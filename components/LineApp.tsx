"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Baseline } from "@/lib/baseline";
import type { GameEntry, PlayerInfo, PlayerSummary } from "@/lib/types";
import { isoDay, shortDate } from "@/lib/stats";
import { CardFrame } from "./CardFrame";
import { ShareButtons } from "./ShareButtons";
import { StatCard } from "./StatCard";

interface Loaded {
  player: PlayerInfo;
  games: GameEntry[];
}

export function LineApp() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PlayerSummary[]>([]);
  const [hi, setHi] = useState(0);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Loaded | null>(null);
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const searchSeq = useRef(0);
  const lastId = useRef("");
  const pickedName = useRef(""); // name we just filled in ourselves: never search for it
  const [baseline, setBaseline] = useState<Baseline | undefined>();
  const [baselineReady, setBaselineReady] = useState(false);
  const searchCache = useRef(new Map<string, PlayerSummary[]>());

  const loadPlayer = useCallback(async (id: string, preferGame?: string) => {
    lastId.current = id;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/line?player=${id}`);
      if (res.status === 503) {
        setErr("ESPN is busy right now. Give it a minute and retry.");
        return;
      }
      if (!res.ok) throw new Error();
      const j: Loaded = await res.json();
      setData(j);
      const g = j.games.find((x) => x.eventId === preferGame) ?? j.games[0];
      setGameId(g?.eventId ?? "");
      pickedName.current = j.player.name;
      setQ(j.player.name);
    } catch {
      setErr("Couldn’t load that player. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // league baseline (tiny, CDN-cached); cards fall back to a built-in one if this fails
  useEffect(() => {
    fetch("/api/baseline")
      .then((r) => (r.ok ? r.json() : undefined))
      .then((b) => b && setBaseline(b))
      .catch(() => undefined)
      .finally(() => setBaselineReady(true));
  }, []);

  // initial state from URL
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("player");
    if (p && /^\d+$/.test(p)) loadPlayer(p, sp.get("game") ?? undefined);
  }, [loadPlayer]);

  // keep URL in sync so the page is linkable
  useEffect(() => {
    if (!data) return;
    const sp = new URLSearchParams();
    sp.set("player", data.player.id);
    if (gameId) sp.set("game", gameId);
    window.history.replaceState(null, "", `?${sp.toString()}`);
  }, [data, gameId]);

  // debounced search
  useEffect(() => {
    const term = q.trim();
    if (term.length < 3 || term === pickedName.current || (data && term === data.player.name)) {
      setResults([]);
      return;
    }
    const key = term.toLowerCase().replace(/\s+/g, " ");
    const cached = searchCache.current.get(key);
    if (cached) {
      setResults(cached);
      setHi(0);
      return;
    }
    const seq = ++searchSeq.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players?q=${encodeURIComponent(term)}`);
        if (!res.ok) return;
        const j = await res.json();
        searchCache.current.set(key, j.players ?? []);
        if (seq === searchSeq.current) {
          setResults(j.players ?? []);
          setHi(0);
        }
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, data]);

  function pick(p: PlayerSummary) {
    setOpen(false);
    setResults([]);
    pickedName.current = p.name;
    setQ(p.name);
    loadPlayer(p.id);
  }

  const game = data?.games.find((g) => g.eventId === gameId);
  const latest = data?.games[0];
  const stale = latest && game && game.eventId === latest.eventId && Date.now() - new Date(latest.date).getTime() > 3 * 86400000;

  return (
    <main className="shell">
      <div className="brand">
        Line <span>9-cat stat line cards</span>
      </div>

      <div className="search">
        <input
          autoFocus
          value={q}
          placeholder="Type a player…"
          aria-label="Search NBA player"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!results.length) return;
            if (e.key === "ArrowDown") (e.preventDefault(), setHi((h) => Math.min(h + 1, results.length - 1)));
            if (e.key === "ArrowUp") (e.preventDefault(), setHi((h) => Math.max(h - 1, 0)));
            if (e.key === "Enter") pick(results[hi]);
          }}
        />
        {open && results.length > 0 && (
          <div className="results" role="listbox">
            {results.map((p, i) => (
              <button key={p.id} className={`result${i === hi ? " on" : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)}>
                <img src={`/api/img?url=${encodeURIComponent(p.headshot)}`} alt="" />
                <span>
                  <b>{p.name}</b>
                  <small>{p.team}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="stage">
        {err && (
          <div className="note err">
            {err}{" "}
            <button className="link" onClick={() => lastId.current && loadPlayer(lastId.current)}>
              Retry
            </button>
          </div>
        )}
        {loading && !data && (
          <div className="frame skeleton" aria-busy="true" style={{ aspectRatio: "1080 / 1350" }} />
        )}
        {!data && !loading && !err && <div className="note">Pick a player to get their most recent game, ready to post.</div>}
        {data && !game && !loading && <div className="note">{data.player.name} hasn’t played a game this season.</div>}

        {data && game && !baselineReady && <div className="frame skeleton" aria-busy="true" style={{ aspectRatio: "1080 / 1350" }} />}

        {data && game && baselineReady && (
          <>
            <CardFrame ref={cardRef} loading={loading}>
              <StatCard player={data.player} game={game} baseline={baseline} />
            </CardFrame>

            <ShareButtons
              getNode={() => cardRef.current}
              filename={`${data.player.lastName || "line"}-${isoDay(game.date)}.png`.toLowerCase().replace(/\s+/g, "-")}
            />

            <div className="panel">
              <div className="row-label">Game {stale ? "· latest game was a few days ago" : ""}</div>
              <div className="chips">
                {data.games.map((g, i) => (
                  <button key={g.eventId} className={`chip${g.eventId === gameId ? " on" : ""}`} onClick={() => setGameId(g.eventId)}>
                    {i === 0 ? "Latest" : shortDate(g.date)}
                    <small>
                      {g.home ? "vs" : "@"} {g.oppAbbr}
                      {g.dnp ? " · DNP" : ""}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
