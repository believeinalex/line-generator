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
  /** numeric weight for "standout" detection (higher = louder) */
  hot: boolean;
}

/** The standard 9 fantasy categories in display order. */
export function nineCats(s: StatLine): NineCat[] {
  return [
    { key: "pts", label: "PTS", value: String(s.pts), hot: s.pts >= 30 },
    { key: "reb", label: "REB", value: String(s.reb), hot: s.reb >= 12 },
    { key: "ast", label: "AST", value: String(s.ast), hot: s.ast >= 10 },
    { key: "stl", label: "STL", value: String(s.stl), hot: s.stl >= 3 },
    { key: "blk", label: "BLK", value: String(s.blk), hot: s.blk >= 3 },
    { key: "tpm", label: "3PM", value: String(s.tpm), sub: `${s.tpm}/${s.tpa}`, hot: s.tpm >= 5 },
    { key: "fg", label: "FG%", value: pct(s.fgm, s.fga), sub: `${s.fgm}/${s.fga}`, hot: s.fga >= 8 && s.fgm / s.fga >= 0.6 },
    { key: "ft", label: "FT%", value: pct(s.ftm, s.fta), sub: `${s.ftm}/${s.fta}`, hot: s.fta >= 6 && s.ftm === s.fta },
    { key: "to", label: "TO", value: String(s.to), hot: s.to >= 5 },
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
