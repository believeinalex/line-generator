import { accentFor, inkOn } from "@/lib/color";
import type { Baseline } from "@/lib/baseline";
import { fantasyScore, longDate, milestone, nineCats, shortDate } from "@/lib/stats";
import type { GameEntry, PlayerInfo } from "@/lib/types";

export const CARD_W = 1080;
export const CARD_H = 1350;

export const proxied = (url: string) => (url ? `/api/img?url=${encodeURIComponent(url)}` : "");

export function cardData(player: PlayerInfo, game: GameEntry, baseline?: Baseline) {
  const parts = player.name.split(" ");
  const first = player.firstName || parts[0] || "";
  const last = player.lastName || parts.slice(1).join(" ") || player.name;
  const accent = accentFor(player.color, player.altColor);
  return {
    first,
    last,
    name: player.name,
    jersey: player.jersey,
    position: player.position,
    teamName: player.teamName,
    teamAbbr: game.teamAbbr || player.teamAbbr,
    oppAbbr: game.oppAbbr,
    oppName: game.oppName,
    oppLogo: proxied(game.oppLogo),
    home: game.home,
    vsAt: game.home ? "vs" : "@",
    date: shortDate(game.date),
    dateLong: longDate(game.date),
    result: game.result,
    score: `${game.teamScore}–${game.oppScore}`,
    min: game.dnp ? "DNP" : String(game.stats.min),
    dnp: game.dnp,
    cats: nineCats(game.stats, baseline),
    milestone: milestone(game.stats),
    fantasy: fantasyScore(game.stats),
    headshot: proxied(player.headshot),
    color: `#${player.color}`,
    alt: `#${player.altColor}`,
    accent,
    accentInk: inkOn(accent),
    seasonType: game.seasonType,
    stats: game.stats,
  };
}

export type CardData = ReturnType<typeof cardData>;

/** Font size (px) so `len` characters fit in `width` px, assuming avg glyph width = ratio × size. */
export function fitSize(len: number, width: number, ratio: number, max: number): number {
  return Math.min(max, Math.floor(width / (Math.max(len, 1) * ratio)));
}
