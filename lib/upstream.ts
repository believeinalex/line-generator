/**
 * Polite upstream fetching for ESPN's unofficial API.
 *  - identical in-flight requests are shared (10 callers → 1 request)
 *  - last good response per URL is kept and served if ESPN errors
 *  - after a 429/403/5xx (or a network failure) we stop calling ESPN for a cooldown
 */
export class UpstreamBusy extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("Upstream temporarily unavailable");
    this.retryAfter = retryAfter;
  }
}

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const COOLDOWN_MS = 60_000;
const NETWORK_COOLDOWN_MS = 15_000;
const MAX_STALE = 300;
const UA = "Mozilla/5.0 (compatible; line-generator)";

const stale = new Map<string, Json>();
const inflight = new Map<string, Promise<Json>>();
let blockedUntil = 0;

/** test helper */
export function resetUpstream() {
  stale.clear();
  inflight.clear();
  blockedUntil = 0;
}

export interface UpstreamOptions {
  /** seconds for Next's fetch cache; 0 = don't use it (e.g. responses over 2 MB) */
  revalidate: number;
  /** keep the parsed response for stale-on-error. Off for very large payloads. */
  keepStale?: boolean;
}

function remember(url: string, value: Json) {
  stale.delete(url);
  stale.set(url, value);
  if (stale.size > MAX_STALE) stale.delete(stale.keys().next().value as string);
}

async function run(url: string, opts: UpstreamOptions): Promise<Json> {
  const fallback = () => {
    const s = opts.keepStale === false ? undefined : stale.get(url);
    if (s) return s;
    throw new UpstreamBusy(Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000)));
  };

  if (Date.now() < blockedUntil) return fallback();

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": UA },
      ...(opts.revalidate > 0 ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" as const }),
    });
  } catch {
    blockedUntil = Date.now() + NETWORK_COOLDOWN_MS;
    return fallback();
  }

  if (res.status === 429 || res.status === 403 || res.status >= 500) {
    blockedUntil = Date.now() + COOLDOWN_MS;
    return fallback();
  }
  if (!res.ok) throw new Error(`ESPN ${res.status}`);

  const json = (await res.json()) as Json;
  if (opts.keepStale !== false) remember(url, json);
  return json;
}

export function upstreamJson(url: string, opts: UpstreamOptions): Promise<Json> {
  const existing = inflight.get(url);
  if (existing) return existing;
  const p = run(url, opts).finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
}
