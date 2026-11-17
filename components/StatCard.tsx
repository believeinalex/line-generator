import type { GameEntry, PlayerInfo } from "@/lib/types";
import { Brutalist } from "./cards/Brutalist";
import { Broadcast } from "./cards/Broadcast";
import { Swiss } from "./cards/Swiss";
import { Terminal } from "./cards/Terminal";
import { Trading } from "./cards/Trading";
import { cardData } from "./cards/data";
import { BackOfCard, BroadcastLight, BroadcastNight, BroadcastSplit, Fleer, NightCard } from "./cards/Variants";

export const VARIANTS = [
  { id: 1, name: "Broadcast" },
  { id: 2, name: "Swiss" },
  { id: 3, name: "Trading Card" },
  { id: 4, name: "Terminal" },
  { id: 5, name: "Brutalist" },
  { id: 6, name: "Broadcast Night" },
  { id: 7, name: "Broadcast Split" },
  { id: 8, name: "Broadcast Light" },
  { id: 9, name: "Fleer" },
  { id: 10, name: "Night Card" },
  { id: 11, name: "Back of Card" },
] as const;

export function StatCard({ player, game, variant }: { player: PlayerInfo; game: GameEntry; variant: number }) {
  const d = cardData(player, game);
  switch (variant) {
    case 2:
      return <Swiss d={d} />;
    case 3:
      return <Trading d={d} />;
    case 4:
      return <Terminal d={d} />;
    case 5:
      return <Brutalist d={d} />;
    case 6:
      return <BroadcastNight d={d} />;
    case 7:
      return <BroadcastSplit d={d} />;
    case 8:
      return <BroadcastLight d={d} />;
    case 9:
      return <Fleer d={d} />;
    case 10:
      return <NightCard d={d} />;
    case 11:
      return <BackOfCard d={d} />;
    default:
      return <Broadcast d={d} />;
  }
}
