import { TIER_NAMES } from "@/lib/baseline";
import { fitSize, type CardData } from "./data";

/** Four-segment meter: 1 filled = poor … 4 filled = elite. Shape + count, so it never relies on color alone. */
function Meter({ tier }: { tier: number }) {
  return (
    <div className="meter">
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className={i <= tier ? "on" : ""} />
      ))}
    </div>
  );
}

function Legend({ className }: { className: string }) {
  return (
    <div className={`legend ${className}`}>
      <span className="legend-title">Vs league rotation players</span>
      {TIER_NAMES.map((n, t) => (
        <span key={n} className="legend-item">
          <i className={`sw t${t}`} />
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
          <div key={c.key} className={`cb-cell t${c.tier}`}>
            <div className="cb-lab">
              {c.label}
              {c.sub && <em>{c.sub}</em>}
            </div>
            <div className="cb-val">{c.value}</div>
            <div className="cb-tier">{TIER_NAMES[c.tier]}</div>
            <Meter tier={c.tier} />
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
    <div key={c.key} className={`cf-td t${c.tier}`}>
      <div className="cf-l">
        {c.label}
        <em>{c.sub ?? " "}</em>
      </div>
      <div className="cf-v" style={c.key === "fg" || c.key === "ft" ? { fontSize: 72 } : undefined}>
        {c.value}
      </div>
      <Meter tier={c.tier} />
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
