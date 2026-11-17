import type { StatLine } from "./types";

export type CatKey = "pts" | "reb" | "ast" | "stl" | "blk" | "tpm" | "fg" | "ft" | "to";

export interface Baseline {
  /** number of rotation players the distribution was built from */
  pool: number;
  /** league FG% / FT% (0..1) among the pool, used for volume-weighted impact */
  fgPct: number;
  ftPct: number;
  cats: Record<CatKey, { mean: number; std: number }>;
}

/**
 * Fallback used when ESPN's league table can't be fetched: a snapshot of the real
 * rotation-player distribution (20+ mpg) from early in the 2026-27 season.
 */
export const DEFAULT_BASELINE: Baseline = {
  pool: 0,
  fgPct: 0.461,
  ftPct: 0.79,
  cats: {
    pts: { mean: 14.18, std: 6.1 },
    reb: { mean: 5.03, std: 2.41 },
    ast: { mean: 3.32, std: 1.89 },
    stl: { mean: 0.99, std: 0.44 },
    blk: { mean: 0.56, std: 0.5 },
    tpm: { mean: 1.63, std: 0.95 },
    fg: { mean: 0, std: 0.67 },
    ft: { mean: 0, std: 0.37 },
    to: { mean: 1.8, std: 0.88 },
  },
};

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface Row {
  min: number; pts: number; reb: number; ast: number; stl: number; blk: number;
  tpm: number; to: number; fgm: number; fga: number; ftm: number; fta: number; gp: number;
}

function rowsFromPage(page: Json): Row[] {
  const names = (cat: string): string[] => page.categories.find((c: Json) => c.name === cat)?.names ?? [];
  const gen = names("general"), off = names("offensive"), def = names("defensive");
  const out: Row[] = [];
  for (const a of page.athletes ?? []) {
    const val = (cat: string, list: string[], key: string): number => {
      const c = a.categories.find((x: Json) => x.name === cat);
      const i = list.indexOf(key);
      return i >= 0 && c ? Number(c.values[i]) : NaN;
    };
    const r: Row = {
      gp: val("general", gen, "gamesPlayed"),
      min: val("general", gen, "avgMinutes"),
      reb: val("general", gen, "avgRebounds"),
      pts: val("offensive", off, "avgPoints"),
      fgm: val("offensive", off, "avgFieldGoalsMade"),
      fga: val("offensive", off, "avgFieldGoalsAttempted"),
      tpm: val("offensive", off, "avgThreePointFieldGoalsMade"),
      ftm: val("offensive", off, "avgFreeThrowsMade"),
      fta: val("offensive", off, "avgFreeThrowsAttempted"),
      ast: val("offensive", off, "avgAssists"),
      to: val("offensive", off, "avgTurnovers"),
      stl: val("defensive", def, "avgSteals"),
      blk: val("defensive", def, "avgBlocks"),
    };
    if (Object.values(r).every(Number.isFinite)) out.push(r);
  }
  return out;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const std = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

/** Build the league distribution from ESPN `statistics/byathlete` pages. */
export function buildBaseline(pages: Json[]): Baseline {
  const rows = pages.flatMap(rowsFromPage).filter((r) => r.min >= 20 && r.gp >= 3);
  if (rows.length < 40) return DEFAULT_BASELINE;

  const fgPct = rows.reduce((a, r) => a + r.fgm, 0) / rows.reduce((a, r) => a + r.fga, 0);
  const ftPct = rows.reduce((a, r) => a + r.ftm, 0) / rows.reduce((a, r) => a + r.fta, 0);
  const col = (f: (r: Row) => number) => {
    const xs = rows.map(f);
    return { mean: mean(xs), std: std(xs) || 1 };
  };
  return {
    pool: rows.length,
    fgPct,
    ftPct,
    cats: {
      pts: col((r) => r.pts),
      reb: col((r) => r.reb),
      ast: col((r) => r.ast),
      stl: col((r) => r.stl),
      blk: col((r) => r.blk),
      tpm: col((r) => r.tpm),
      to: col((r) => r.to),
      fg: col((r) => r.fgm - fgPct * r.fga),
      ft: col((r) => r.ftm - ftPct * r.fta),
    },
  };
}

/* ---------- z-scores & tiers ---------- */

export type Tier = 0 | 1 | 2 | 3; // poor, average, good, elite
export const TIER_NAMES = ["Poor", "Avg", "Good", "Elite"] as const;

/** Thresholds in z (positive = better for the fantasy manager). */
export function tierOf(z: number): Tier {
  if (z >= 1.75) return 3;
  if (z >= 0.75) return 2;
  if (z >= -0.5) return 1;
  return 0;
}

export function zScores(s: StatLine, b: Baseline): Record<CatKey, number> {
  const z = (k: CatKey, v: number) => (v - b.cats[k].mean) / b.cats[k].std;
  return {
    pts: z("pts", s.pts),
    reb: z("reb", s.reb),
    ast: z("ast", s.ast),
    stl: z("stl", s.stl),
    blk: z("blk", s.blk),
    tpm: z("tpm", s.tpm),
    fg: z("fg", s.fgm - b.fgPct * s.fga),
    ft: z("ft", s.ftm - b.ftPct * s.fta),
    to: -z("to", s.to), // fewer turnovers is better
  };
}
