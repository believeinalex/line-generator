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

/* ---------- Broadcast Light ---------- */
export function BroadcastLight({ d }: { d: CardData }) {
  return (
    <div className="cb" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="cb-head">
        <div className="cb-final">
          FINAL
          <small>{d.dateLong}</small>
        </div>
        <div className="cb-score">
          <span>{d.teamAbbr}</span>
          <b>{d.score}</b>
          <span>
            {d.vsAt} {d.oppAbbr}
          </span>
        </div>
        <div className={`cb-wl ${d.result}`}>{d.result || "–"}</div>
      </div>
      <div className="cb-hero">
        <div className="cb-disc" />
        {d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}
        <div className="cb-name">
          <div className="cb-first">{d.first}</div>
          <div className="cb-last" style={{ fontSize: fitSize(d.last.length, 560, 0.5, 150) }}>
            {d.last}
          </div>
          <div className="cb-tags">
            <span>{d.min} MIN</span>
            {d.milestone && <span>{d.milestone}</span>}
            <span>FP {d.fantasy}</span>
          </div>
        </div>
      </div>
      <div className="cb-grid">
        {d.cats.map((c) => (
          <div key={c.key} className="cb-cell">
            <div className="cb-lab">{c.label}</div>
            <Chip tier={c.tier} />
            <div className="cb-val">{c.value}</div>
            {c.sub && <div className="cb-sub">{c.sub}</div>}
          </div>
        ))}
      </div>
      <Legend className="cb-legend" />
    </div>
  );
}

/* ---------- Fleer ---------- */
export function Fleer({ d }: { d: CardData }) {
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
          {d.dateLong} · {d.vsAt} {d.oppName} · <b className={d.result}>{d.result}</b> {d.score}
        </div>
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
        <Legend className="cf-legend" />
      </div>
    </div>
  );
}
