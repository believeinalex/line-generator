import { NextResponse } from "next/server";
import { getGames, getPlayer } from "@/lib/espn";

/** Player info + full game list (newest first) in one round trip. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("player") ?? "";
  if (!/^\d{1,9}$/.test(id)) return NextResponse.json({ error: "Bad player id" }, { status: 400 });
  try {
    const [player, games] = await Promise.all([getPlayer(id), getGames(id)]);
    return NextResponse.json({ player, games });
  } catch {
    return NextResponse.json({ error: "Could not load player" }, { status: 502 });
  }
}
