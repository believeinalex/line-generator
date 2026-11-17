import { describe, expect, it } from "vitest";
import { parseAthlete, parseGamelog, parseSearch } from "@/lib/espn";
import { fantasyScore, milestone, nineCats, pct } from "@/lib/stats";
import gamelog from "./fixtures/gamelog-1966.json";
import search from "./fixtures/search-lebron.json";
import athlete from "./fixtures/athlete-1966.json";

describe("parsers", () => {
  it("parses player search", () => {
    const r = parseSearch(search);
    expect(r[0]).toMatchObject({ id: "1966", name: "LeBron James" });
    expect(r[0].headshot).toContain("1966.png");
  });

  it("parses athlete with team color", () => {
    const p = parseAthlete(athlete);
    expect(p.name).toBe("LeBron James");
    expect(p.color).toMatch(/^[0-9a-f]{6}$/i);
  });

  it("parses gamelog newest first, matching ESPN's own numbers", () => {
    const games = parseGamelog(gamelog);
    expect(games.length).toBeGreaterThan(5);
    const dates = games.map((g) => g.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    // eventId 401909985: stats 33 min, 5-8 FG, 0-2 3P, 5-6 FT, 7 reb, 11 ast, 1 blk, 0 stl, 3 pf, 2 to, 15 pts
    const g = games.find((x) => x.eventId === "401909985")!;
    expect(g.stats).toMatchObject({ min: 33, fgm: 5, fga: 8, tpm: 0, tpa: 2, ftm: 5, fta: 6, reb: 7, ast: 11, blk: 1, stl: 0, to: 2, pts: 15 });
    expect(g).toMatchObject({ result: "W", teamScore: 131, oppScore: 124, home: true, oppAbbr: "IND" });
  });
});

describe("stat helpers", () => {
  const line = { min: 33, pts: 15, reb: 7, ast: 11, stl: 0, blk: 1, tpm: 0, tpa: 2, fgm: 5, fga: 8, ftm: 5, fta: 6, to: 2, pf: 3 };
  it("formats percentages", () => {
    expect(pct(5, 8)).toBe(".625");
    expect(pct(0, 0)).toBe("—");
    expect(pct(4, 4)).toBe("1.000");
  });
  it("emits nine categories in order", () => {
    expect(nineCats(line).map((c) => c.label)).toEqual(["PTS", "REB", "AST", "STL", "BLK", "3PM", "FG%", "FT%", "TO"]);
  });
  it("detects milestones", () => {
    expect(milestone(line)).toBe("Double-Double");
    expect(milestone({ ...line, pts: 25, reb: 12, ast: 10 })).toBe("Triple-Double");
    expect(milestone({ ...line, ast: 3 })).toBeNull();
  });
  it("computes a fantasy score", () => {
    expect(fantasyScore(line)).toBe(15 + 8.4 + 16.5 + 3 - 2);
  });
});

import leaders from "./fixtures/leaders.json";
import { buildBaseline, tierOf, zScores } from "@/lib/baseline";

describe("league baseline & z-scores", () => {
  const b = buildBaseline(leaders.pages);
  it("builds a sane baseline from the real league table", () => {
    expect(b.pool).toBeGreaterThan(100);
    expect(b.fgPct).toBeGreaterThan(0.42);
    expect(b.fgPct).toBeLessThan(0.55);
    expect(b.cats.pts.mean).toBeGreaterThan(9);
    expect(b.cats.pts.std).toBeGreaterThan(3);
  });
  it("rates a big line elite and a dud poor", () => {
    const big = { min: 36, pts: 40, reb: 14, ast: 10, stl: 3, blk: 3, tpm: 6, tpa: 10, fgm: 15, fga: 22, ftm: 4, fta: 4, to: 1, pf: 2 };
    const dud = { min: 20, pts: 2, reb: 1, ast: 0, stl: 0, blk: 0, tpm: 0, tpa: 4, fgm: 1, fga: 9, ftm: 0, fta: 2, to: 5, pf: 4 };
    const zb = zScores(big, b), zd = zScores(dud, b);
    expect(tierOf(zb.pts)).toBe(3);
    expect(tierOf(zb.fg)).toBe(3);
    expect(tierOf(zd.pts)).toBe(0);
    expect(tierOf(zd.to)).toBe(0); // 5 turnovers is bad
    expect(tierOf(zb.to)).toBe(2); // 1 turnover is good
  });
  it("doesn't call 0-for-0 free throws elite", () => {
    const l = { min: 30, pts: 10, reb: 5, ast: 3, stl: 1, blk: 0, tpm: 1, tpa: 3, fgm: 4, fga: 9, ftm: 0, fta: 0, to: 2, pf: 1 };
    expect(tierOf(zScores(l, b).ft)).toBe(1);
  });
});
