import { TIER_NAMES } from "@/lib/baseline";
import { fitSize, type CardData } from "./data";

/** Corner tier icon: chevrons carry the meaning (▲▲ elite … ▼▼ awful), color reinforces it. */
function Chip({ tier, small }: { tier: number; small?: boolean }) {
  const up = tier >= 3;
  const n = tier === 2 ? 0 : tier === 1 || tier === 3 ? 1 : 2;
  const path = (y: number) => (up ? `M5 ${y + 6}l7-7 7 7` : `M5 ${y}l7 7 7-7`);
  const ys = n === 2 ? [4, 11] : [up ? 9 : 7];
  return (
    <span className={`tchip t${tier}${small ? " sm" : ""}`} aria-label={TIER_NAMES[tier]}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="square" strokeLinejoin="miter">
        {n === 0 ? <path d="M5 12h14" /> : ys.map((y) => <path key={y} d={path(y)} />)}
      </svg>
    </span>
  );
}

function Legend({ className }: { className: string }) {
  return (
    <div className={`legend ${className}`}>
      <span className="legend-title">Vs league avg</span>
      {TIER_NAMES.map((n, t) => (
        <span key={n} className="legend-item">
          <Chip tier={t} small />
          {n}
        </span>
      ))}
    </div>
  );
}

export function FleerCard({ d }: { d: CardData }) {
  const by = Object.fromEntries(d.cats.map((c) => [c.key, c]));
  const row1 = ["pts", "reb", "ast", "stl", "blk"].map((k) => by[k]);
  const row2 = ["tpm", "fg", "ft", "to"].map((k) => by[k]);
  const cell = (c: (typeof row1)[number]) => (
    <div key={c.key} className="cf-td">
      <div className="cf-l">
        {c.label}
        <em>{c.sub ?? " "}</em>
      </div>
      <div className="cf-v" style={c.key === "fg" || c.key === "ft" ? { fontSize: 72 } : undefined}>
        {c.value}
      </div>
      <Chip tier={c.tier} />
    </div>
  );
  return (
    <div className="cf" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="cf-card">
        <div className="cf-photo">
          <div className="cf-stripe" />
          {d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}
          <div className="cf-corner">{d.position}</div>
        </div>
        <div className="cf-banner">
          <span style={{ fontSize: fitSize(d.name.length, 780, 0.58, 78) }}>{d.name}</span>
        </div>
        <div className="cf-sub">
          {d.dateLong}
          {d.phase ? ` · ${d.phase}` : ""} · {d.vsAt} {d.oppName} · <b className={d.result}>{d.result}</b> {d.score}
        </div>
        {d.dnp ? (
          <div className="cf-dnp">
            <div className="cf-dnp-big">Did not play</div>
            <div className="cf-dnp-sub">No stats recorded for {d.name} in this game</div>
          </div>
        ) : (
        <div className="cf-table">
          <div className="cf-tr">{row1.map(cell)}</div>
          <div className="cf-tr">
            {row2.map(cell)}
            <div className="cf-td fp">
              <div className="cf-l">
                FANTASY<em>{d.min} MIN</em>
              </div>
              <div className="cf-v" style={{ fontSize: 72 }}>
                {d.fantasy}
              </div>
            </div>
          </div>
        </div>
        )}
        {!d.dnp && <Legend className="cf-legend" />}
      </div>
    </div>
  );
}
