import { NextResponse } from "next/server";
import { normalizeQuery, searchPlayers } from "@/lib/espn";
import { UpstreamBusy } from "@/lib/upstream";

export async function GET(req: Request) {
  const q = normalizeQuery(new URL(req.url).searchParams.get("q") ?? "");
  if (q.length < 3 || q.length > 40) return NextResponse.json({ players: [] }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  try {
    return NextResponse.json(
      { players: await searchPlayers(q) },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (e) {
    if (e instanceof UpstreamBusy) return NextResponse.json({ error: "busy" }, { status: 503, headers: { "Retry-After": String(e.retryAfter) } });
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
