import { buildBaseline, DEFAULT_BASELINE, type Baseline } from "./baseline";
import { upstreamJson } from "./upstream";
import type { GameEntry, PlayerInfo, PlayerSummary, StatLine } from "./types";

const SEARCH = "https://site.web.api.espn.com/apis/common/v3/search";
const ATHLETE = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes";

/* ---------- pure parsers (unit-tested against saved fixtures) ---------- */

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function parseSearch(json: Json): PlayerSummary[] {
  const items: Json[] = json?.items ?? [];
  return items
    .filter((i) => i.type === "player" && i.league === "nba")
    .map((i) => ({
      id: String(i.id),
      name: String(i.displayName),
      team: String(i.teamRelationships?.[0]?.core?.displayName ?? ""),
      headshot: i.headshot?.href ?? `https://a.espncdn.com/i/headshots/nba/players/full/${i.id}.png`,
    }));
}

export function parseAthlete(json: Json): PlayerInfo {
  const a = json?.athlete;
  if (!a) throw new Error("athlete missing");
  return {
    id: String(a.id),
    name: String(a.displayName),
    firstName: String(a.firstName ?? ""),
    lastName: String(a.lastName ?? ""),
    jersey: String(a.jersey ?? ""),
    position: String(a.position?.abbreviation ?? ""),
    headshot: a.headshot?.href ?? `https://a.espncdn.com/i/headshots/nba/players/full/${a.id}.png`,
    teamId: String(a.team?.id ?? ""),
    teamAbbr: String(a.team?.abbreviation ?? ""),
    teamName: String(a.team?.displayName ?? ""),
    color: String(a.team?.color ?? "222222"),
    altColor: String(a.team?.alternateColor ?? "dddddd"),
  };
}

const num = (v: unknown): number => {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

/** "5-8" -> [5, 8] */
const madeAtt = (v: unknown): [number, number] => {
  const [m, a] = String(v ?? "").split("-");
  return [num(m), num(a)];
};

export function parseGamelog(json: Json): GameEntry[] {
  const names: string[] = json?.names ?? [];
  const idx = (n: string) => names.indexOf(n);
  const I = {
    min: idx("minutes"),
    fg: idx("fieldGoalsMade-fieldGoalsAttempted"),
    tp: idx("threePointFieldGoalsMade-threePointFieldGoalsAttempted"),
    ft: idx("freeThrowsMade-freeThrowsAttempted"),
    reb: idx("totalRebounds"),
    ast: idx("assists"),
    blk: idx("blocks"),
    stl: idx("steals"),
    pf: idx("fouls"),
    to: idx("turnovers"),
    pts: idx("points"),
  };
  if (Object.values(I).some((i) => i < 0)) throw new Error("unexpected gamelog columns");

  const meta: Record<string, Json> = json?.events ?? {};
  const out = new Map<string, GameEntry>();

  for (const st of json?.seasonTypes ?? []) {
    const seasonType = String(st.displayName ?? "");
    for (const cat of st.categories ?? []) {
      for (const ev of cat.events ?? []) {
        const m = meta[ev.eventId];
        if (!m || out.has(ev.eventId)) continue;
        const s: string[] = ev.stats ?? [];
        const [fgm, fga] = madeAtt(s[I.fg]);
        const [tpm, tpa] = madeAtt(s[I.tp]);
        const [ftm, fta] = madeAtt(s[I.ft]);
        const stats: StatLine = {
          min: num(s[I.min]),
          pts: num(s[I.pts]),
          reb: num(s[I.reb]),
          ast: num(s[I.ast]),
          stl: num(s[I.stl]),
          blk: num(s[I.blk]),
          tpm, tpa, fgm, fga, ftm, fta,
          to: num(s[I.to]),
          pf: num(s[I.pf]),
        };
        const isHome = m.atVs === "vs";
        const ownTeamId = String(m.team?.id ?? "");
        const homeIsUs = m.homeTeamId ? String(m.homeTeamId) === ownTeamId : isHome;
        const hs = num(m.homeTeamScore);
        const as = num(m.awayTeamScore);
        out.set(String(ev.eventId), {
          eventId: String(ev.eventId),
          date: String(m.gameDate),
          seasonType,
          home: isHome,
          result: m.gameResult === "W" || m.gameResult === "L" ? m.gameResult : "",
          teamScore: homeIsUs ? hs : as,
          oppScore: homeIsUs ? as : hs,
          oppAbbr: String(m.opponent?.abbreviation ?? ""),
          oppName: String(m.opponent?.displayName ?? ""),
          oppLogo: String(m.opponent?.logo ?? ""),
          teamAbbr: String(m.team?.abbreviation ?? ""),
          dnp: stats.min === 0 && stats.fga === 0 && stats.pts === 0,
          stats,
        });
      }
    }
  }
  return [...out.values()].sort((a, b) => b.date.localeCompare(a.date));
}

/* ---------- fetchers (server only) ---------- */

/** "  LeBron   James " → "lebron james": one cache key per real query. */
export function normalizeQuery(q: string): string {
  return q.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export async function searchPlayers(q: string): Promise<PlayerSummary[]> {
  const url = `${SEARCH}?query=${encodeURIComponent(normalizeQuery(q))}&limit=8&type=player&sport=basketball&league=nba`;
  return parseSearch(await upstreamJson(url, { revalidate: 3600 }));
}

export async function getPlayer(id: string): Promise<PlayerInfo> {
  return parseAthlete(await upstreamJson(`${ATHLETE}/${encodeURIComponent(id)}`, { revalidate: 3600 }));
}

export async function getGames(id: string): Promise<GameEntry[]> {
  return parseGamelog(await upstreamJson(`${ATHLETE}/${encodeURIComponent(id)}/gamelog`, { revalidate: 300 }));
}

/*
 * League baseline. The raw table is >2 MB (too big for Next's fetch cache), so we keep only the
 * small computed result in memory, and /api/baseline puts it behind the CDN for hours.
 */
const LEADERS = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete";
const BASELINE_TTL = 6 * 3600 * 1000;
let memo: { at: number; value: Baseline } | null = null;
let baselineInflight: Promise<{ value: Baseline; fresh: boolean }> | null = null;

async function fetchBaseline(): Promise<Baseline> {
  const page = (n: number) =>
    upstreamJson(`${LEADERS}?region=us&lang=en&contentorigin=espn&isqualified=true&page=${n}&limit=200&sort=offensive.avgPoints%3Adesc&seasontype=2`, {
      revalidate: 0,
      keepStale: false,
    });
  const first = await page(1);
  const pages = [first];
  for (let n = 2; n <= Math.min(Number(first.pagination?.pages ?? 1), 4); n++) pages.push(await page(n));
  return buildBaseline(pages);
}

/** `fresh` is false when we had to fall back to an older or built-in baseline (so callers shouldn't cache it long). */
export async function getBaseline(): Promise<{ value: Baseline; fresh: boolean }> {
  if (memo && Date.now() - memo.at < BASELINE_TTL) return { value: memo.value, fresh: true };
  baselineInflight ??= fetchBaseline()
    .then((value) => {
      memo = { at: Date.now(), value };
      return { value, fresh: value.pool > 0 };
    })
    .catch(() => ({ value: memo?.value ?? DEFAULT_BASELINE, fresh: false }))
    .finally(() => {
      baselineInflight = null;
    });
  return baselineInflight;
}
