import { DEFAULT_BASELINE, tierOf, zScores, type Baseline, type Tier } from "./baseline";
import type { StatLine } from "./types";

/** Percentage like ".545" (basketball style) or "—" when there were no attempts. */
export function pct(made: number, att: number): string {
  if (!att) return "—";
  const v = made / att;
  return v >= 1 ? "1.000" : v.toFixed(3).replace(/^0/, "");
}

/** Whole-percent version, e.g. "54.5%". */
export function pctLong(made: number, att: number): string {
  if (!att) return "—";
  return `${((made / att) * 100).toFixed(1)}%`;
}

export interface NineCat {
  key: "pts" | "reb" | "ast" | "stl" | "blk" | "tpm" | "fg" | "ft" | "to";
  label: string;
  value: string;
  /** secondary text, e.g. "8/15" */
  sub?: string;
  /** z-score vs league rotation players (positive = good; TO already inverted) */
  z: number;
  /** 0 poor · 1 average · 2 good · 3 elite */
  tier: Tier;
}

/** The standard 9 fantasy categories in display order, each scored against the league baseline. */
export function nineCats(s: StatLine, baseline: Baseline = DEFAULT_BASELINE): NineCat[] {
  const z = zScores(s, baseline);
  const mk = (key: NineCat["key"], label: string, value: string, sub?: string): NineCat => ({
    key,
    label,
    value,
    sub,
    z: z[key],
    tier: tierOf(z[key]),
  });
  return [
    mk("pts", "PTS", String(s.pts)),
    mk("reb", "REB", String(s.reb)),
    mk("ast", "AST", String(s.ast)),
    mk("stl", "STL", String(s.stl)),
    mk("blk", "BLK", String(s.blk)),
    mk("tpm", "3PM", String(s.tpm), `${s.tpm}/${s.tpa}`),
    mk("fg", "FG%", pct(s.fgm, s.fga), `${s.fgm}/${s.fga}`),
    mk("ft", "FT%", pct(s.ftm, s.fta), `${s.ftm}/${s.fta}`),
    mk("to", "TO", String(s.to)),
  ];
}

/** Count of the five counting stats at 10+ (pts, reb, ast, stl, blk). */
export function doubleDigitCount(s: StatLine): number {
  return [s.pts, s.reb, s.ast, s.stl, s.blk].filter((n) => n >= 10).length;
}

/** "Triple-Double", "Double-Double", "5x5" or null. */
export function milestone(s: StatLine): string | null {
  const n = doubleDigitCount(s);
  if (n >= 5) return "5×5";
  if (n >= 3) return "Triple-Double";
  if (n === 2) return "Double-Double";
  return null;
}

/**
 * Classic 9-cat "line value" for the card: simple sum-based fantasy score using
 * common default weights (PTS 1, REB 1.2, AST 1.5, STL 3, BLK 3, 3PM 0.5, TO -1).
 * Shown as a fun at-a-glance number, not a league-specific truth.
 */
export function fantasyScore(s: StatLine): number {
  const v = s.pts + s.reb * 1.2 + s.ast * 1.5 + s.stl * 3 + s.blk * 3 + s.tpm * 0.5 - s.to;
  return Math.round(v * 10) / 10;
}

const NY = "America/New_York";

/** "Nov 16" in US Eastern (NBA game-day), regardless of UTC rollover. */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: NY }).format(new Date(iso));
}

export function longDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: NY }).format(new Date(iso));
}

/** yyyy-mm-dd in US Eastern. */
export function isoDay(iso: string): string {
  const p = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: NY }).format(new Date(iso));
  return p;
}
