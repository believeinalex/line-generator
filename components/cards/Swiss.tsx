import { fitSize, type CardData } from "./data";

export function Swiss({ d }: { d: CardData }) {
  return (
    <div className="c2" style={{ ["--spot" as string]: d.accent }}>
      <div className="c2-top">
        <span>Line / {d.dateLong}</span>
        <span>
          {d.vsAt} {d.oppName}
        </span>
        <span>
          {d.result} {d.score}
        </span>
      </div>
      <div className="c2-rule thick" />

      <div className="c2-head">
        <h1 className="c2-name" style={{ fontSize: fitSize(Math.max(d.first.length, d.last.length), 540, 0.6, 150) }}>
          {d.first}
          <br />
          {d.last}
        </h1>
        <div className="c2-photo">
          <div className="c2-pbox">{d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}</div>
          <span className="c2-cap">
            {d.teamName}
            {d.jersey ? ` — No. ${d.jersey}` : ""}
          </span>
        </div>
      </div>

      <div className="c2-rule" />
      <div className="c2-stats">
        {d.cats.map((c, i) => (
          <div key={c.key} className={`c2-stat${i % 3 === 2 ? " last" : ""}${c.hot ? " hot" : ""}`}>
            <div className="c2-label">
              <span>{String(i + 1).padStart(2, "0")}</span>
              {c.label}
            </div>
            <div className={`c2-num${c.key === "fg" || c.key === "ft" ? " pct" : ""}`}>
              <span>{c.value}</span>
            </div>
            <div className="c2-sub">{c.sub ?? " "}</div>
          </div>
        ))}
      </div>
      <div className="c2-rule thick" />
      <div className="c2-bottom">
        <span>{d.min} min</span>
        <span>{d.milestone ?? "Fantasy line"}</span>
        <span>
          Fantasy pts <b>{d.fantasy}</b>
        </span>
      </div>
    </div>
  );
}
