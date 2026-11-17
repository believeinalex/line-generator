import { fitSize, type CardData } from "./data";

export function Trading({ d }: { d: CardData }) {
  return (
    <div className="c3" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c3-card">
        <div className="c3-top">
          <span className="c3-no">{d.jersey ? `#${d.jersey}` : ""}</span>
          <span className="c3-pos">{d.position}</span>
        </div>
        <div className="c3-window">
          <div className="c3-halftone" />
          {d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}
          <div className="c3-badge">
            {d.result}
            <small>{d.score}</small>
          </div>
        </div>
        <div className="c3-plate">
          <div className="c3-team">{d.teamName}</div>
          <div className="c3-name" style={{ fontSize: fitSize(d.name.length, 860, 0.62, 84) }}>
            {d.name}
          </div>
        </div>
        <div className="c3-sub">
          {d.dateLong} · {d.vsAt} {d.oppName}
        </div>
        <div className="c3-table">
          {d.cats.map((c) => (
            <div key={c.key} className={`c3-row${c.hot ? " hot" : ""}`}>
              <span className="c3-k">{c.label}</span>
              <span className="c3-v">{c.value}</span>
              {c.sub && <span className="c3-s">{c.sub}</span>}
            </div>
          ))}
        </div>
        <div className="c3-foot">
          <span>{d.min} MIN</span>
          <span>{d.milestone ?? "Box score line"}</span>
          <span>FP {d.fantasy}</span>
        </div>
      </div>
    </div>
  );
}
