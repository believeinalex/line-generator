import type { Baseline } from "@/lib/baseline";
import type { GameEntry, PlayerInfo } from "@/lib/types";
import { cardData } from "./cards/data";
import { BroadcastLight, Fleer } from "./cards/Variants";

export const VARIANTS = [
  { id: 1, name: "Broadcast Light" },
  { id: 2, name: "Fleer" },
] as const;

export function StatCard({ player, game, variant, baseline }: { player: PlayerInfo; game: GameEntry; variant: number; baseline?: Baseline }) {
  const d = cardData(player, game, baseline);
  return variant === 2 ? <Fleer d={d} /> : <BroadcastLight d={d} />;
}
