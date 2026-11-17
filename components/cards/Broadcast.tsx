import { fitSize, type CardData } from "./data";

export function Broadcast({ d }: { d: CardData }) {
  return (
    <div className="c1" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c1-hero">
        <div className="c1-slab" />
        <div className="c1-slab2" />
        {d.headshot && <img className="c1-shot" src={d.headshot} alt="" crossOrigin="anonymous" />}
        <div className="c1-tag">
          <span className="c1-dot" />
          Final · {d.seasonType.includes("Pre") ? "Preseason" : d.dateLong}
        </div>
        <div className="c1-name">
          <span className="c1-first">{d.first}</span>
          <span className="c1-last" style={{ fontSize: fitSize(d.last.length, 490, 0.5, 220) }}>
            {d.last}
          </span>
        </div>
      </div>

      <div className="c1-grid">
        {d.cats.map((c) => (
          <div key={c.key} className={`c1-cell${c.hot ? " hot" : ""}`}>
            <div className="c1-lab">{c.label}</div>
            <div className="c1-val">{c.value}</div>
            {c.sub && <div className="c1-sub">{c.sub}</div>}
          </div>
        ))}
      </div>

      <div className="c1-foot">
        <div className="c1-game">
          <span className={`c1-res ${d.result}`}>{d.result || "–"}</span>
          <span>
            {d.vsAt} {d.oppAbbr} <b>{d.score}</b>
          </span>
        </div>
        <div className="c1-meta">
          {d.min} MIN{d.milestone ? ` · ${d.milestone}` : ""} · FP {d.fantasy}
        </div>
      </div>
    </div>
  );
}
