import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const UA =
  "Mozilla/5.0 (Linux; Android 16; SM-A566B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const dnsCache = new Map<string, { address: string; exp: number }>();

function blocked(message: string, status = 400): Response {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

function isPrivate(ip: string): boolean {
  if (ip.startsWith("10.") || ip.startsWith("127.") || ip.startsWith("0.") || ip.startsWith("169.254.")) {
    return true;
  }
  if (ip.startsWith("192.168.") || ip.startsWith("100.64.")) return true;
  const match = /^172\.(\d+)\./.exec(ip);
  if (match) {
    const octet = Number(match[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  const lower = ip.toLowerCase();
  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
}

async function assertPublicHttp(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("bad url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad url");
  if (url.username || url.password) throw new Error("bad url");
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("blocked");
  }
  if (/^\d+$/.test(host)) throw new Error("blocked");
  let address = host;
  if (isIP(host) === 0) {
    const hit = dnsCache.get(host);
    if (hit && hit.exp > Date.now()) {
      address = hit.address;
    } else {
      const resolved = await lookup(host);
      address = resolved.address;
      dnsCache.set(host, { address, exp: Date.now() + 60_000 });
    }
  }
  if (isPrivate(address)) throw new Error("blocked");
  return url;
}

/** Relative query keeps whatever path prefix the playlist itself was loaded from. */
export function rewritePlaylist(body: string, playlistUrl: string): string {
  const base = new URL(playlistUrl);
  const point = (uri: string) => {
    const absolute = new URL(uri, base).toString();
    return `?u=${encodeURIComponent(absolute)}`;
  };
  return body
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) {
        return line.replace(/URI=(["'])(.*?)\1/g, (_all, quote: string, uri: string) => {
          return `URI=${quote}${point(uri)}${quote}`;
        });
      }
      return point(trimmed);
    })
    .join("\n");
}

async function pull(url: URL, request: Request, hops: number): Promise<Response> {
  if (hops > 4) return blocked("too many redirects", 502);
  const headers = new Headers();
  headers.set("user-agent", UA);
  headers.set("accept", "*/*");
  const range = request.headers.get("range");
  if (range) headers.set("range", range);
  const upstream = await fetch(url, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    if (!location) return blocked("bad redirect", 502);
    const next = await assertPublicHttp(new URL(location, url).toString());
    return pull(next, request, hops + 1);
  }
  if (!upstream.ok && upstream.status !== 206) {
    return blocked("upstream", upstream.status === 404 ? 404 : 502);
  }

  const type = (upstream.headers.get("content-type") || "").toLowerCase();
  const path = url.pathname.toLowerCase();
  const looksPlaylist =
    type.includes("mpegurl") ||
    type.includes("m3u") ||
    path.endsWith(".m3u8") ||
    path.endsWith(".m3u");

  if (looksPlaylist) {
    const text = await upstream.text();
    if (text.length > 1_500_000) return blocked("too large", 502);
    if (!text.trimStart().startsWith("#EXTM3U")) {
      return new Response(text, {
        status: upstream.status,
        headers: {
          "content-type": type || "application/vnd.apple.mpegurl",
          "cache-control": "no-store",
        },
      });
    }
    return new Response(rewritePlaylist(text, url.toString()), {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const media =
    type.startsWith("video/") ||
    type.startsWith("audio/") ||
    type.includes("mp2t") ||
    type.includes("octet-stream") ||
    /\.(ts|m4s|mp4|aac|mp3|cmfv|cmfa|vtt)(\?|$)/.test(path);
  if (!media || type.includes("text/html") || type.includes("application/json")) {
    return blocked("not media", 415);
  }

  const out = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) out.set("content-type", contentType);
  const length = upstream.headers.get("content-length");
  if (length) out.set("content-length", length);
  const acceptRanges = upstream.headers.get("accept-ranges");
  if (acceptRanges) out.set("accept-ranges", acceptRanges);
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) out.set("content-range", contentRange);
  out.set("cache-control", "public, max-age=2");
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export async function proxyMedia(request: Request): Promise<Response> {
  const raw = new URL(request.url).searchParams.get("u") ?? "";
  if (!raw || raw.length > 12_000) return blocked("bad url");
  try {
    const url = await assertPublicHttp(raw);
    return await pull(url, request, 0);
  } catch (error) {
    const message = error instanceof Error ? error.message : "blocked";
    if (message === "bad url" || message === "blocked") return blocked(message);
    return blocked("upstream", 502);
  }
}
