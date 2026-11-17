/**
 * Same-origin proxy for ESPN headshots/logos so the card can be rasterised
 * to PNG in the browser without tainting the canvas (CORS).
 */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (u.protocol !== "https:" || u.hostname !== "a.espncdn.com" || !u.pathname.startsWith("/i/")) {
    return new Response("forbidden", { status: 403 });
  }
  const upstream = await fetch(u, { next: { revalidate: 86400 } });
  if (!upstream.ok) return new Response("upstream error", { status: 502 });
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
