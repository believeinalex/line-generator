import type { CardData } from "./data";

const SCALE: Record<string, number> = { pts: 40, reb: 16, ast: 14, stl: 5, blk: 5, tpm: 8, fg: 1, ft: 1, to: 6 };

function bar(c: CardData["cats"][number], d: CardData) {
  let frac: number;
  if (c.key === "fg") frac = d.stats.fga ? d.stats.fgm / d.stats.fga : 0;
  else if (c.key === "ft") frac = d.stats.fta ? d.stats.ftm / d.stats.fta : 0;
  else frac = Math.min(1, Number(c.value) / SCALE[c.key]);
  const n = 27;
  const filled = Math.round(frac * n);
  return "█".repeat(filled) + "░".repeat(n - filled);
}

export function Terminal({ d }: { d: CardData }) {
  return (
    <div className="c4">
      <div className="c4-line dim">$ line --player &quot;{d.name}&quot; --date {d.date.toLowerCase().replace(" ", "-")}</div>
      <div className="c4-line dim">fetching box score ... ok</div>
      <div className="c4-hr">{"━".repeat(52)}</div>
      <div className="c4-title">{d.name.toUpperCase()}</div>
      <div className="c4-line">
        {d.teamAbbr} {d.vsAt} {d.oppAbbr} &nbsp;·&nbsp; {d.dateLong} &nbsp;·&nbsp; <span className={`c4-res ${d.result}`}>{d.result || "-"} {d.score}</span>
      </div>
      <div className="c4-line dim">
        MIN {d.min}
        {d.milestone ? `  ·  ${d.milestone.toUpperCase()}` : ""}
      </div>
      <div className="c4-hr">{"━".repeat(52)}</div>
      <div className="c4-rows">
        {d.cats.map((c) => (
          <div key={c.key} className={`c4-row${c.hot ? " hot" : ""}`}>
            <span className="c4-k">{c.label}</span>
            <span className="c4-v">{c.value}</span>
            <span className="c4-bar">{bar(c, d)}</span>
            <span className="c4-s">{c.sub ?? ""}</span>
          </div>
        ))}
      </div>
      <div className="c4-hr">{"━".repeat(52)}</div>
      <div className="c4-line">
        FANTASY <b>{d.fantasy}</b>
        <span className="c4-cursor" />
      </div>
    </div>
  );
}
