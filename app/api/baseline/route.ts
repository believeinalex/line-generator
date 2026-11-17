import { NextResponse } from "next/server";
import { getBaseline } from "@/lib/espn";

/**
 * League rotation-player baseline (~1 KB). Cached hard at the CDN so ESPN's big league table
 * is fetched a handful of times a day no matter how many people use the site.
 */
export async function GET() {
  const { value, fresh } = await getBaseline();
  return NextResponse.json(value, {
    headers: {
      "Cache-Control": fresh
        ? "public, s-maxage=21600, stale-while-revalidate=86400"
        : "public, s-maxage=60", // fallback baseline: re-check soon
    },
  });
}
