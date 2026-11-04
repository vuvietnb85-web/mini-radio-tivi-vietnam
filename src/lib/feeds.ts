import { previewPathPrefix } from "@/lib/preview-path-prefix";

export type FeedKind = "tv" | "radio";

export type Lane = "hls" | "itv" | "cctv" | "vtc";

export type Feed = {
  id: string;
  name: string;
  kind: FeedKind;
  lane: Lane;
  urls: string[];
};

export type RadioRow = {
  name: string;
  url: string;
  votes: number;
  country: string;
  language: string;
  tags: string;
};

const BLOCKED_HOSTS = [
  "dethich.pw",
  "freem3u.xyz",
  "vietanhtv.top",
  "vietanhtv.id.vn",
  "dpdns.org",
  "duckdns.org",
  "ddns.net",
];

export function isHls(url: string): boolean {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  return path.endsWith(".m3u8") || path.endsWith(".m3u");
}

export function slugId(kind: FeedKind, name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${kind}-${base || "kenh"}`.slice(0, 96);
}

function hostBlocked(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;
    if (parsed.username || parsed.password) return true;
    const host = parsed.hostname.toLowerCase();
    if (netAddress(host)) return true;
    if (BLOCKED_HOSTS.some((item) => host === item || host.endsWith(`.${item}`))) return true;
    if (/[?&]token=/.test(url) && /requestTime=158/.test(url)) return true;
    if (/[?&]auth=testpub/.test(url)) return true;
    return false;
  } catch {
    return true;
  }
}

function netAddress(host: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function cleanName(raw: string): string {
  return raw
    .replace(/\s*\((?:2160|1080|720|576|540|480|406)p\)\s*/gi, " ")
    .replace(/\s*\[[^\]]{0,40}\]\s*/g, " ")
    .replace(/\b(?:HD|SD|FHD|UHD)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseM3u(text: string): Array<{ name: string; url: string }> {
  const lines = text.split(/\r?\n/);
  const rows: Array<{ name: string; url: string }> = [];
  let name = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#EXTINF")) {
      const comma = trimmed.lastIndexOf(",");
      name = cleanName(comma >= 0 ? trimmed.slice(comma + 1) : "Kênh");
      continue;
    }
    if (trimmed.startsWith("#") || !trimmed) continue;
    if (!trimmed.startsWith("http")) continue;
    rows.push({ name: name || "Kênh", url: trimmed });
    name = "";
  }
  return rows;
}

const FOREIGN_TV = ["lao sv", "lao-thai", "lao thai", "uniquely thai", "rtm asean", "hmong tv", "mnb world", "tea tv"];

function foreignTv(name: string): boolean {
  const folded = fold(name);
  return FOREIGN_TV.some((item) => folded.includes(item));
}

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function tvRank(name: string): number {
  const n = fold(name);
  const vtv = /\bvtv\s*(\d+)/.exec(n);
  if (vtv) return Number(vtv[1]);
  const htv = /\bhtv\s*(\d+)/.exec(n);
  if (htv) return 40 + Number(htv[1]);
  if (n.includes("an ninh") || /\bantv\b/.test(n)) return 60;
  if (n.includes("qpvn") || n.includes("quoc phong")) return 61;
  if (n.includes("vietnam today")) return 62;
  const vtc = /\bvtc\s*\+?\s*(\d+)/.exec(n);
  if (vtc) return Number(vtc[1]);
  const cctv = /\bcctv\s*\+?\s*(\d+)/.exec(n);
  if (cctv) return Number(cctv[1]);
  return 100;
}

export function inferLane(name: string): Lane {
  const n = fold(name);
  if (n.includes("cctv") || n.includes("cgtn")) return "cctv";
  if (/\bvtc\b/.test(n)) return "vtc";
  if (/\bitv\b/.test(n)) return "itv";
  return "hls";
}

const LANE_ORDER: Record<Lane, number> = { hls: 0, itv: 1, cctv: 2, vtc: 3 };

function fpt(slug: string): string {
  return `https://vips-livecdn.fptplay.net/live/media/${slug}/live247-hls-avc/index.m3u8`;
}

function pushUrl(urls: string[], url: string) {
  if (hostBlocked(url)) return;
  if (!urls.includes(url)) urls.push(url);
}

const CURATED_RADIO: Array<{ name: string; urls: string[] }> = [
  {
    name: "VOV1",
    urls: [
      "https://audio-lss.vov.vn/live/vov1.m3u8",
      "https://str.vov.gov.vn/vovlive/vov1vov5Vietnamese.sdp_aac/playlist.m3u8",
    ],
  },
  {
    name: "VOV2",
    urls: [
      "https://audio-lss.vov.vn/live/vov2.m3u8",
      "https://str.vov.gov.vn/vovlive/vov2.sdp_aac/playlist.m3u8",
    ],
  },
  {
    name: "VOV3",
    urls: [
      "https://audio-lss.vov.vn/live/vov3.m3u8",
      "https://str.vov.gov.vn/vovlive/vov3.sdp_aac/playlist.m3u8",
    ],
  },
  { name: "VOV4", urls: ["https://audio-lss.vov.vn/live/vov4.m3u8"] },
  { name: "VOV5", urls: ["https://audio-lss.vov.vn/live/vov5.m3u8"] },
  { name: "VOV Giao thông Hà Nội", urls: ["https://play.vovgiaothong.vn/live/gthn/playlist.m3u8"] },
  {
    name: "VOV Giao thông Hồ Chí Minh",
    urls: ["https://play.vovgiaothong.vn/live/gthcm/playlist.m3u8"],
  },
];

const CURATED_TV: Array<{ name: string; lane?: Lane; urls: string[] }> = [
  {
    name: "Cần Thơ TV",
    urls: [
      "https://live.canthotv.vn/live/tv/playlist.m3u8",
      "https://live.canthotv.vn/live/tv/chunklist.m3u8",
    ],
  },
  { name: "Cao Bằng TV", urls: ["https://stream.thingnet.vn/live/smil:CRTV.smil/chunklist.m3u8"] },
  { name: "Đắk Lắk TV", urls: ["https://cdn.drt.vn/live/285a27750861b964c27af22091662a74f2f/chunklist.m3u8"] },
  { name: "Lào Cai TV", urls: ["https://live.baolaocai.vn/channel2/stream.m3u8"] },
  { name: "Hà Tĩnh TV", urls: ["https://cohauw9bgpvod.vcdn.cloud/httv1/index.m3u8"] },
  { name: "Thái Nguyên TV", urls: ["https://streaming.thainguyentv.vn/hls/livestream.m3u8"] },
  { name: "QPVN", urls: ["https://qpvn.vn/live/qpvn/master.m3u8"] },
  { name: "Đà Nẵng TV1", urls: ["https://live.mediatech.vn/live/285b59a111d76974225a8e3004bfc31a509/chunklist.m3u8"] },
  { name: "Tây Ninh TV", urls: ["https://live-hq.evgcdn.net/live/2851dc2c9af68834814a89e61db0faee561/chunklist.m3u8"] },
  { name: "VTV1", urls: [fpt("vtv1")] },
  { name: "VTV2", urls: [fpt("vtv2")] },
  { name: "VTV3", urls: [fpt("vtv3")] },
  { name: "VTV4", urls: [fpt("vtv4")] },
  { name: "VTV5", urls: [fpt("vtv5")] },
  { name: "VTV6", urls: [fpt("vtv6")] },
  { name: "VTV7", urls: [fpt("vtv7")] },
  { name: "VTV9", urls: [fpt("vtv9")] },
  { name: "VTV10", urls: [fpt("vtv10")] },
  { name: "HTV1", urls: [fpt("htv1")] },
  { name: "HTV2", urls: [fpt("htv2")] },
  { name: "HTV3", urls: [fpt("htv3")] },
  { name: "HTV7", urls: [fpt("htv7")] },
  { name: "HTV9", urls: [fpt("htv9")] },
  { name: "Vietnam Today", urls: ["https://amagi-live.ondemandkorea.com/amgplt0456.m3u8"] },
  { name: "An Giang TV1", urls: ["https://tv.angiangtv.vn/live/kgtv/kgtv.m3u8"] },
  {
    name: "DW",
    lane: "itv",
    urls: ["https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8"],
  },
  {
    name: "DW Español",
    lane: "itv",
    urls: ["https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/master.m3u8"],
  },
  {
    name: "France 24",
    lane: "itv",
    urls: ["https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8"],
  },
  { name: "CGTN", lane: "cctv", urls: ["https://news.cgtn.com/resource/live/english/cgtn-news.m3u8"] },
  { name: "CGTN Español", lane: "cctv", urls: ["https://news.cgtn.com/resource/live/espanol/cgtn-e.m3u8"] },
  { name: "CGTN Français", lane: "cctv", urls: ["https://news.cgtn.com/resource/live/french/cgtn-f.m3u8"] },
  { name: "CGTN العربية", lane: "cctv", urls: ["https://news.cgtn.com/resource/live/arabic/cgtn-a.m3u8"] },
  { name: "CGTN Русский", lane: "cctv", urls: ["https://news.cgtn.com/resource/live/russian/cgtn-r.m3u8"] },
  {
    name: "CCTV+ 1",
    lane: "cctv",
    urls: ["https://cd-live-stream.news.cctvplus.com/live/smil:CHANNEL1.smil/playlist.m3u8"],
  },
  {
    name: "CCTV+ 2",
    lane: "cctv",
    urls: ["https://cd-live-stream.news.cctvplus.com/live/smil:CHANNEL2.smil/playlist.m3u8"],
  },
  ...["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "16"].map((n) => ({
    name: `VTC${n}`,
    lane: "vtc" as const,
    urls: [fpt(`vtc${n}`)],
  })),
];

export const FALLBACK_FEEDS: Feed[] = [
  ...CURATED_TV.map((item) => ({
    id: slugId("tv", item.name),
    name: item.name,
    kind: "tv" as const,
    lane: item.lane ?? inferLane(item.name),
    urls: item.urls,
  })),
  ...CURATED_RADIO.map((item) => ({
    id: slugId("radio", item.name),
    name: item.name,
    kind: "radio" as const,
    lane: "hls" as const,
    urls: item.urls,
  })),
  {
    id: slugId("radio", "RFI Tiếng Việt"),
    name: "RFI Tiếng Việt",
    kind: "radio",
    lane: "hls",
    urls: ["https://rfienvietnamien64k.ice.infomaniak.ch/rfienvietnamien-64.mp3"],
  },
];

export function isVietnameseRadio(row: RadioRow): boolean {
  const blob = fold(`${row.name} ${row.language} ${row.tags}`);
  if (blob.includes("abdulbasit") || blob.includes("quran")) return false;
  const vietnamese =
    blob.includes("viet") ||
    /\bvov\b/.test(blob) ||
    blob.includes("tieng viet") ||
    blob.includes("vietnamese");
  if (row.country.toUpperCase() === "VN") return true;
  return vietnamese;
}

export function assembleFeeds(
  tvRows: Array<{ name: string; url: string }>,
  radioRows: RadioRow[],
): Feed[] {
  const tv = new Map<string, Feed>();
  const takeTv = (name: string, urls: string[], lane?: Lane) => {
    const cleaned = cleanName(name);
    if (!cleaned || foreignTv(cleaned)) return;
    const id = slugId("tv", cleaned);
    const nextLane = lane ?? inferLane(cleaned);
    const existing = tv.get(id);
    if (!existing) {
      const next: string[] = [];
      for (const url of urls) pushUrl(next, url);
      if (!next.length) return;
      tv.set(id, { id, name: cleaned, kind: "tv", lane: nextLane, urls: next });
      return;
    }
    if (lane) existing.lane = lane;
    for (const url of urls) pushUrl(existing.urls, url);
  };

  for (const item of CURATED_TV) takeTv(item.name, item.urls, item.lane ?? inferLane(item.name));
  for (const row of tvRows) takeTv(row.name, [row.url]);

  const radio = new Map<string, Feed & { votes: number; rank: number }>();
  const takeRadio = (name: string, urls: string[], votes: number, rank: number) => {
    const cleaned = cleanName(name);
    if (!cleaned) return;
    const id = slugId("radio", cleaned);
    const existing = radio.get(id);
    if (!existing) {
      const next: string[] = [];
      for (const url of urls) pushUrl(next, url);
      if (!next.length) return;
      radio.set(id, { id, name: cleaned, kind: "radio", lane: "hls", urls: next, votes, rank });
      return;
    }
    for (const url of urls) pushUrl(existing.urls, url);
    existing.votes = Math.max(existing.votes, votes);
    existing.rank = Math.min(existing.rank, rank);
  };

  CURATED_RADIO.forEach((item, index) => takeRadio(item.name, item.urls, 10_000 - index, index));
  takeRadio("RFI Tiếng Việt", ["https://rfienvietnamien64k.ice.infomaniak.ch/rfienvietnamien-64.mp3"], 5558, 50);

  for (const row of radioRows) {
    if (!isVietnameseRadio(row)) continue;
    takeRadio(row.name, [row.url], row.votes, 80);
  }

  const tvFeeds = [...tv.values()].sort((a, b) => {
    const lane = LANE_ORDER[a.lane] - LANE_ORDER[b.lane];
    if (lane !== 0) return lane;
    const rank = tvRank(a.name) - tvRank(b.name);
    if (rank !== 0) return rank;
    return a.name.localeCompare(b.name, "vi");
  });

  const radioFeeds = [...radio.values()]
    .sort((a, b) => a.rank - b.rank || b.votes - a.votes || a.name.localeCompare(b.name, "vi"))
    .map(({ votes: _votes, rank: _rank, ...feed }) => feed);

  return [...tvFeeds, ...radioFeeds];
}

export function apiPath(path: string): string {
  if (typeof window === "undefined") return path;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
  return `${prefix}${path}`;
}

