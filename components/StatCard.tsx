import type { GameEntry, PlayerInfo } from "@/lib/types";
import { Brutalist } from "./cards/Brutalist";
import { Broadcast } from "./cards/Broadcast";
import { Swiss } from "./cards/Swiss";
import { Terminal } from "./cards/Terminal";
import { Trading } from "./cards/Trading";
import { cardData } from "./cards/data";

export const VARIANTS = [
  { id: 1, name: "Broadcast" },
  { id: 2, name: "Swiss" },
  { id: 3, name: "Trading Card" },
  { id: 4, name: "Terminal" },
  { id: 5, name: "Brutalist" },
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
    default:
      return <Broadcast d={d} />;
  }
}
