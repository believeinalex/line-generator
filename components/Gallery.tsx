"use client";

import { useEffect, useState } from "react";
import type { Baseline } from "@/lib/baseline";
import type { GameEntry, PlayerInfo } from "@/lib/types";
import { CardFrame } from "./CardFrame";
import { StatCard, VARIANTS } from "./StatCard";

/** Dev-only: same real stat line rendered in every card style. */
export function Gallery() {
  const [d, setD] = useState<{ player: PlayerInfo; games: GameEntry[]; baseline?: Baseline } | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const id = sp.get("player") ?? "1966";
    const gi = Number(sp.get("g") ?? 0);
    fetch(`/api/line?player=${id}`)
      .then((r) => r.json())
      .then((j) => setD({ player: j.player, games: [j.games[gi] ?? j.games[0]], baseline: j.baseline }));
  }, []);

  if (!d) return <main className="shell note">Loading…</main>;
  return (
    <main className="shell">
      <div className="brand">Design gallery</div>
      <div className="gallery">
        {VARIANTS.map((v) => (
          <section key={v.id} data-variant={v.id}>
            <h3>
              {v.id}. {v.name}
            </h3>
            <CardFrame>
              <StatCard player={d.player} game={d.games[0]} variant={v.id} baseline={d.baseline} />
            </CardFrame>
          </section>
        ))}
      </div>
    </main>
  );
}
