import { NextResponse } from "next/server";
import { getBaseline, getGames, getPlayer } from "@/lib/espn";

/** Player info + full game list (newest first) in one round trip. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("player") ?? "";
  if (!/^\d{1,9}$/.test(id)) return NextResponse.json({ error: "Bad player id" }, { status: 400 });
  try {
    const [player, games, baseline] = await Promise.all([getPlayer(id), getGames(id), getBaseline()]);
    return NextResponse.json({ player, games, baseline });
  } catch {
    return NextResponse.json({ error: "Could not load player" }, { status: 502 });
  }
}
