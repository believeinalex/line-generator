import { fitSize, type CardData } from "./data";

export function Brutalist({ d }: { d: CardData }) {
  return (
    <div className="c5" style={{ ["--bg" as string]: d.accent, ["--bgInk" as string]: d.accentInk }}>
      <div className="c5-last" style={{ fontSize: fitSize(d.last.length, 740, 0.5, 360) }}>
        {d.last}
      </div>
      {d.headshot && <img className="c5-shot" src={d.headshot} alt="" crossOrigin="anonymous" />}
      <div className="c5-first">{d.first}</div>
      <div className="c5-sticker">
        {d.result}
        <span>{d.score}</span>
      </div>
      <div className="c5-grid">
        {d.cats.map((c) => (
          <div key={c.key} className={`c5-box${c.hot ? " hot" : ""}`}>
            <div className="c5-val">{c.value}</div>
            <div className="c5-lab">
              {c.label}
              {c.sub ? <em> {c.sub}</em> : null}
            </div>
          </div>
        ))}
      </div>
      <div className="c5-strip">
        <span>
          {d.vsAt} {d.oppAbbr} · {d.date}
        </span>
        <span>{d.milestone ?? `${d.min} MIN`}</span>
        <span>FP {d.fantasy}</span>
      </div>
    </div>
  );
}
