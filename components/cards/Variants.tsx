import { fitSize, type CardData } from "./data";

const verb = (d: CardData) => (d.result === "W" ? "win over" : "loss to");

/* ---------- 6. Broadcast Night: dark, full-bleed photo, big-3 + small-6 ---------- */
export function BroadcastNight({ d }: { d: CardData }) {
  const big = d.cats.slice(0, 3);
  const small = d.cats.slice(3);
  return (
    <div className="c6" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c6-bar" />
      {d.headshot && <img className="c6-shot" src={d.headshot} alt="" crossOrigin="anonymous" />}
      <div className="c6-fade" />
      <div className="c6-top">
        <span className="c6-pill">{d.dateLong}</span>
        <span className="c6-pill alt">
          {d.vsAt} {d.oppAbbr}
        </span>
      </div>
      <div className="c6-name">
        <div className="c6-first">{d.first}</div>
        <div className="c6-last" style={{ fontSize: fitSize(d.last.length, 560, 0.5, 200) }}>
          {d.last}
        </div>
        <div className="c6-line">
          <b className={d.result}>{d.result}</b> {d.score} · {d.min} MIN{d.milestone ? ` · ${d.milestone.replace("-", "\u2011")}` : ""} · FP {d.fantasy}
        </div>
      </div>
      <div className="c6-big">
        {big.map((c) => (
          <div key={c.key} className="c6-bc">
            <div className="c6-bv">{c.value}</div>
            <div className="c6-bl">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="c6-small">
        {small.map((c) => (
          <div key={c.key} className={`c6-sc${c.hot ? " hot" : ""}`}>
            <div className="c6-sl">
              {c.label}
              {c.sub && <em>{c.sub}</em>}
            </div>
            <div className="c6-sv">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 7. Broadcast Split: photo column + stat ladder ---------- */
export function BroadcastSplit({ d }: { d: CardData }) {
  return (
    <div className="c7" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c7-head">
        <div className="c7-first">{d.first}</div>
        <div className="c7-last" style={{ fontSize: fitSize(d.last.length, 960, 0.5, 170) }}>
          {d.last}
        </div>
      </div>
      <div className="c7-body">
        <div className="c7-left">
          <div className="c7-photo">{d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}</div>
          <div className="c7-res">
            <b className={d.result}>{d.result || "–"}</b>
            <span>{d.score}</span>
          </div>
          <div className="c7-ctx">
            {d.vsAt} {d.oppName}
            <br />
            {d.dateLong}
          </div>
        </div>
        <div className="c7-ladder">
          {d.cats.map((c) => (
            <div key={c.key} className={`c7-row${c.hot ? " hot" : ""}`}>
              <span className="c7-k">{c.label}</span>
              <span className="c7-s">{c.sub ?? ""}</span>
              <span className="c7-v">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="c7-foot">
        <span>{d.min} MIN</span>
        <span>{d.milestone ?? ""}</span>
        <span>FP {d.fantasy}</span>
      </div>
    </div>
  );
}

/* ---------- 8. Broadcast Light: scoreboard on paper ---------- */
export function BroadcastLight({ d }: { d: CardData }) {
  return (
    <div className="c8" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c8-head">
        <div className="c8-final">
          FINAL
          <small>{d.dateLong}</small>
        </div>
        <div className="c8-score">
          <span>{d.teamAbbr}</span>
          <b>{d.score}</b>
          <span>
            {d.vsAt} {d.oppAbbr}
          </span>
        </div>
        <div className={`c8-wl ${d.result}`}>{d.result || "–"}</div>
      </div>
      <div className="c8-hero">
        <div className="c8-disc" />
        {d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}
        <div className="c8-name">
          <div className="c8-first">{d.first}</div>
          <div className="c8-last" style={{ fontSize: fitSize(d.last.length, 560, 0.5, 150) }}>
            {d.last}
          </div>
          <div className="c8-tags">
            <span>{d.min} MIN</span>
            {d.milestone && <span>{d.milestone}</span>}
            <span>FP {d.fantasy}</span>
          </div>
        </div>
      </div>
      <div className="c8-grid">
        {d.cats.map((c) => (
          <div key={c.key} className={`c8-cell${c.hot ? " hot" : ""}`}>
            <div className="c8-lab">
              {c.label}
              {c.sub && <em>{c.sub}</em>}
            </div>
            <div className="c8-val">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 9. Fleer: classic front with banner + stat table ---------- */
export function Fleer({ d }: { d: CardData }) {
  const row1 = d.cats.filter((c) => ["pts", "reb", "ast", "stl", "blk"].includes(c.key));
  const row2 = d.cats.filter((c) => ["tpm", "fg", "ft", "to"].includes(c.key));
  return (
    <div className="c9" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c9-card">
        <div className="c9-photo">
          <div className="c9-stripe" />
          {d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}
          <div className="c9-corner">{d.position}</div>
        </div>
        <div className="c9-banner">
          <span style={{ fontSize: fitSize(d.name.length, 780, 0.58, 78) }}>{d.name}</span>
        </div>
        <div className="c9-sub">
          {d.dateLong} · {d.vsAt} {d.oppName} · <b className={d.result}>{d.result}</b> {d.score}
        </div>
        <div className="c9-table">
          <div className="c9-tr">
            {row1.map((c) => (
              <div key={c.key} className={`c9-td${c.hot ? " hot" : ""}`}>
                <div className="c9-l">{c.label}</div>
                <div className="c9-v">{c.value}</div>
              </div>
            ))}
          </div>
          <div className="c9-tr">
            {row2.map((c) => (
              <div key={c.key} className={`c9-td${c.hot ? " hot" : ""}`}>
                <div className="c9-l">
                  {c.label}
                  {c.sub && <em>{c.sub}</em>}
                </div>
                <div className="c9-v" style={c.key === "fg" || c.key === "ft" ? { fontSize: 74 } : undefined}>
                  {c.value}
                </div>
              </div>
            ))}
            <div className="c9-td fp">
              <div className="c9-l">FANTASY</div>
              <div className="c9-v">{d.fantasy}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 10. Night Card: dark card, full-bleed photo ---------- */
export function NightCard({ d }: { d: CardData }) {
  return (
    <div className="c10" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c10-card">
        <div className="c10-photo">
          {d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}
          <div className="c10-shade" />
          <div className="c10-no">{d.jersey ? `#${d.jersey}` : ""}</div>
          <div className="c10-res">
            <b className={d.result}>{d.result}</b> {d.score}
          </div>
          <div className="c10-nameblock">
            <div className="c10-team">
              {d.teamName} · {d.position}
            </div>
            <div className="c10-name" style={{ fontSize: fitSize(d.name.length, 800, 0.6, 92) }}>
              {d.name}
            </div>
          </div>
        </div>
        <div className="c10-info">
          {d.dateLong} · {d.vsAt} {d.oppName} · {d.min} min
        </div>
        <div className="c10-grid">
          {d.cats.map((c) => (
            <div key={c.key} className={`c10-t${c.hot ? " hot" : ""}`}>
              <div className="c10-l">
                {c.label}
                {c.sub && <em>{c.sub}</em>}
              </div>
              <div className="c10-v">{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 11. Back of Card: stat sheet + game notes ---------- */
export function BackOfCard({ d }: { d: CardData }) {
  const s = d.stats;
  const hi = [
    s.pts >= 20 ? `${s.pts} pts` : "",
    s.reb >= 8 ? `${s.reb} reb` : "",
    s.ast >= 6 ? `${s.ast} ast` : "",
    s.stl >= 3 ? `${s.stl} stl` : "",
    s.blk >= 3 ? `${s.blk} blk` : "",
  ].filter(Boolean);
  const note = `${d.milestone ? `Posted a ${d.milestone.toLowerCase()}` : "Finished"} with ${hi.length ? hi.join(", ") : `${s.pts} points`} in a ${d.score} ${verb(d)} ${d.oppName}${d.home ? "" : " on the road"}.`;
  return (
    <div className="c11" style={{ ["--team" as string]: d.accent, ["--teamInk" as string]: d.accentInk }}>
      <div className="c11-card">
        <div className="c11-head">
          <div className="c11-id">
            <div className="c11-name" style={{ fontSize: fitSize(d.name.length, 600, 0.6, 76) }}>
              {d.name}
            </div>
            <div className="c11-meta">
              {d.position} · {d.teamName}
              {d.jersey ? ` · #${d.jersey}` : ""}
            </div>
          </div>
          <div className="c11-mug">{d.headshot && <img src={d.headshot} alt="" crossOrigin="anonymous" />}</div>
        </div>
        <div className="c11-title">
          <span>{d.dateLong}</span>
          <span>
            {d.vsAt} {d.oppAbbr}
          </span>
          <span>
            {d.result} {d.score}
          </span>
        </div>
        <div className="c11-sheet">
          {d.cats.map((c) => (
            <div key={c.key} className={`c11-r${c.hot ? " hot" : ""}`}>
              <span className="c11-k">{c.label}</span>
              <span className="c11-dots" />
              <span className="c11-s">{c.sub ?? ""}</span>
              <span className="c11-v">{c.value}</span>
            </div>
          ))}
        </div>
        <div className="c11-note">
          <b>GAME NOTES</b> {note} <b>{d.min} MIN · FP {d.fantasy}</b>
        </div>
      </div>
    </div>
  );
}
