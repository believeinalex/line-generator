import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeQuery } from "@/lib/espn";
import { resetUpstream, upstreamJson, UpstreamBusy } from "@/lib/upstream";

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const status = (s: number) => new Response("nope", { status: s });

describe("upstream fetching", () => {
  beforeEach(() => {
    resetUpstream();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shares one request between concurrent identical calls", async () => {
    const f = vi.fn(async () => ok({ a: 1 }));
    vi.stubGlobal("fetch", f);
    const rs = await Promise.all(Array.from({ length: 10 }, () => upstreamJson("https://x/a", { revalidate: 60 })));
    expect(f).toHaveBeenCalledTimes(1);
    expect(rs.every((r) => r.a === 1)).toBe(true);
  });

  it("serves the last good response when ESPN errors", async () => {
    const f = vi.fn().mockResolvedValueOnce(ok({ v: "good" })).mockResolvedValueOnce(status(500));
    vi.stubGlobal("fetch", f);
    expect((await upstreamJson("https://x/b", { revalidate: 60 })).v).toBe("good");
    expect((await upstreamJson("https://x/b", { revalidate: 60 })).v).toBe("good");
  });

  it("stops calling ESPN for a cooldown after a 429, then resumes", async () => {
    const f = vi.fn().mockResolvedValueOnce(status(429)).mockResolvedValue(ok({ v: "back" }));
    vi.stubGlobal("fetch", f);
    await expect(upstreamJson("https://x/c", { revalidate: 60 })).rejects.toBeInstanceOf(UpstreamBusy);
    await expect(upstreamJson("https://x/d", { revalidate: 60 })).rejects.toBeInstanceOf(UpstreamBusy);
    await expect(upstreamJson("https://x/e", { revalidate: 60 })).rejects.toBeInstanceOf(UpstreamBusy);
    expect(f).toHaveBeenCalledTimes(1); // the other two never reached ESPN
    vi.advanceTimersByTime(61_000);
    expect((await upstreamJson("https://x/c", { revalidate: 60 })).v).toBe("back");
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("treats a network failure as a short cooldown", async () => {
    const f = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValue(ok({ v: 1 }));
    vi.stubGlobal("fetch", f);
    await expect(upstreamJson("https://x/f", { revalidate: 60 })).rejects.toBeInstanceOf(UpstreamBusy);
    await expect(upstreamJson("https://x/f", { revalidate: 60 })).rejects.toBeInstanceOf(UpstreamBusy);
    expect(f).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(16_000);
    expect((await upstreamJson("https://x/f", { revalidate: 60 })).v).toBe(1);
  });

  it("doesn't retain huge payloads when keepStale is off", async () => {
    const f = vi.fn().mockResolvedValueOnce(ok({ big: true })).mockResolvedValueOnce(status(503));
    vi.stubGlobal("fetch", f);
    await upstreamJson("https://x/g", { revalidate: 0, keepStale: false });
    await expect(upstreamJson("https://x/g", { revalidate: 0, keepStale: false })).rejects.toBeInstanceOf(UpstreamBusy);
  });

  it("a plain 404 is an error, not a cooldown", async () => {
    const f = vi.fn().mockResolvedValueOnce(status(404)).mockResolvedValue(ok({ v: 2 }));
    vi.stubGlobal("fetch", f);
    await expect(upstreamJson("https://x/h", { revalidate: 60 })).rejects.toThrow("ESPN 404");
    expect((await upstreamJson("https://x/i", { revalidate: 60 })).v).toBe(2);
  });
});

describe("query normalisation", () => {
  it("collapses case, spacing and accents into one cache key", () => {
    expect(normalizeQuery("  LeBron   James ")).toBe("lebron james");
    expect(normalizeQuery("Nikola Jokić")).toBe("nikola jokic");
    expect(normalizeQuery("lebron james")).toBe(normalizeQuery("LEBRON JAMES"));
  });
});
