import type { Baseline } from "@/lib/baseline";
import type { GameEntry, PlayerInfo } from "@/lib/types";
import { cardData } from "./cards/data";
import { FleerCard } from "./cards/FleerCard";

export function StatCard({ player, game, baseline }: { player: PlayerInfo; game: GameEntry; baseline?: Baseline }) {
  return <FleerCard d={cardData(player, game, baseline)} />;
}
