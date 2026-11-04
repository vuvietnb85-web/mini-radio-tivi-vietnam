import { assembleFeeds, FALLBACK_FEEDS, parseM3u, type RadioRow } from "@/lib/feeds";

const TV_LISTS = [
  "https://iptv-org.github.io/iptv/countries/vn.m3u",
  "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/vn.m3u",
];

const CCTV_LISTS = ["https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cctv.m3u"];

const RADIO_LISTS = [
  "https://de1.api.radio-browser.info/json/stations/search?countrycode=VN&hidebroken=true&order=votes&reverse=true&limit=200",
  "https://at1.api.radio-browser.info/json/stations/search?countrycode=VN&hidebroken=true&order=votes&reverse=true&limit=200",
  "https://de1.api.radio-browser.info/json/stations/search?language=vietnamese&hidebroken=true&order=votes&reverse=true&limit=100",
];

const UA = "SongViet/1.0 (Vietnamese TV and radio viewer)";

let cache: { at: number; body: string } | null = null;
const TTL_MS = 10 * 60 * 1000;

async function textFrom(urls: string[]): Promise<string> {
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": UA, accept: "text/plain,*/*" },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) continue;
      const text = await response.text();
      if (text.length > 40) return text;
    } catch {
      /* try the next mirror */
    }
  }
  return "";
}

function asRadio(value: unknown): RadioRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const url = String(row.url_resolved || row.url || "");
  if (!url.startsWith("http")) return null;
  return {
    name: String(row.name || "Đài"),
    url,
    votes: Number(row.votes) || 0,
    country: String(row.countrycode || ""),
    language: String(row.language || ""),
    tags: String(row.tags || ""),
  };
}

export async function loadCatalog(): Promise<{ feeds: ReturnType<typeof assembleFeeds> }> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return JSON.parse(cache.body) as { feeds: ReturnType<typeof assembleFeeds> };
  }

  const [tvText, cctvText, ...radioTexts] = await Promise.all([
    textFrom(TV_LISTS),
    textFrom(CCTV_LISTS),
    ...RADIO_LISTS.slice(0, 2).map((url) => textFrom([url])),
    textFrom([RADIO_LISTS[2]]),
  ]);

  const radioRows: RadioRow[] = [];
  for (const blob of radioTexts) {
    if (!blob) continue;
    try {
      const parsed = JSON.parse(blob) as unknown[];
      for (const item of parsed) {
        const row = asRadio(item);
        if (row) radioRows.push(row);
      }
    } catch {
      /* ignore a bad mirror */
    }
  }

  const tvRows = [
    ...(tvText ? parseM3u(tvText) : []),
    ...(cctvText ? parseM3u(cctvText) : []),
  ];
  const feeds = assembleFeeds(tvRows, radioRows);
  const body = JSON.stringify({ feeds: feeds.length ? feeds : FALLBACK_FEEDS });
  cache = { at: Date.now(), body };
  return JSON.parse(body) as { feeds: ReturnType<typeof assembleFeeds> };
}

export function catalogJson(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
