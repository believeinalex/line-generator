import { NextResponse } from "next/server";
import { getGames, getPlayer } from "@/lib/espn";
import { UpstreamBusy } from "@/lib/upstream";

/** Player info + full game list (newest first) in one round trip. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("player") ?? "";
  if (!/^\d{1,9}$/.test(id)) return NextResponse.json({ error: "Bad player id" }, { status: 400 });
  try {
    const [player, games] = await Promise.all([getPlayer(id), getGames(id)]);
    return NextResponse.json({ player, games }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (e) {
    if (e instanceof UpstreamBusy) return NextResponse.json({ error: "busy" }, { status: 503, headers: { "Retry-After": String(e.retryAfter) } });
    return NextResponse.json({ error: "Could not load player" }, { status: 502 });
  }
}
