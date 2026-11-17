import { NextResponse } from "next/server";
import { searchPlayers } from "@/lib/espn";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ players: [] });
  try {
    return NextResponse.json({ players: await searchPlayers(q) });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
