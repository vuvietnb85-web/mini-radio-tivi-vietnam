import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, _ as createFileRoute, b as require_jsx_runtime, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Ccggue2n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-BY5w9iJf.css";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
			},
			{ title: "SÓNG" },
			{
				name: "description",
				content: "Màn hình là khung hình. Mở là phát. Chạm đổi kênh. Giữ 2 giây sang đài."
			},
			{
				name: "theme-color",
				content: "#07080a"
			},
			{
				name: "google",
				content: "notranslate"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "SÓNG"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "format-detection",
				content: "telephone=no"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "vi",
		translate: "no",
		className: "notranslate",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-CZJXMzle.mjs");
var Route$2 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var BLOCKED_HOSTS = [
	"dethich.pw",
	"freem3u.xyz",
	"vietanhtv.top",
	"vietanhtv.id.vn",
	"dpdns.org",
	"duckdns.org",
	"ddns.net"
];
function isHls(url) {
	const path = url.split("?")[0]?.toLowerCase() ?? "";
	return path.endsWith(".m3u8") || path.endsWith(".m3u");
}
function slugId(kind, name) {
	return `${kind}-${name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kenh"}`.slice(0, 96);
}
function hostBlocked(url) {
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
function netAddress(host) {
	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
	return host.includes(":");
}
function cleanName(raw) {
	return raw.replace(/\s*\((?:2160|1080|720|576|540|480|406)p\)\s*/gi, " ").replace(/\s*\[[^\]]{0,40}\]\s*/g, " ").replace(/\b(?:HD|SD|FHD|UHD)\b/gi, " ").replace(/\s+/g, " ").trim();
}
function parseM3u(text) {
	const lines = text.split(/\r?\n/);
	const rows = [];
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
		rows.push({
			name: name || "Kênh",
			url: trimmed
		});
		name = "";
	}
	return rows;
}
var FOREIGN_TV = [
	"lao sv",
	"lao-thai",
	"lao thai",
	"uniquely thai",
	"rtm asean",
	"hmong tv",
	"mnb world",
	"tea tv"
];
function foreignTv(name) {
	const folded = fold(name);
	return FOREIGN_TV.some((item) => folded.includes(item));
}
function fold(value) {
	return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
function tvRank(name) {
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
function inferLane(name) {
	const n = fold(name);
	if (n.includes("cctv") || n.includes("cgtn")) return "cctv";
	if (/\bvtc\b/.test(n)) return "vtc";
	if (/\bitv\b/.test(n)) return "itv";
	return "hls";
}
var LANE_ORDER = {
	hls: 0,
	itv: 1,
	cctv: 2,
	vtc: 3
};
function fpt(slug) {
	return `https://vips-livecdn.fptplay.net/live/media/${slug}/live247-hls-avc/index.m3u8`;
}
function pushUrl(urls, url) {
	if (hostBlocked(url)) return;
	if (!urls.includes(url)) urls.push(url);
}
var CURATED_RADIO = [
	{
		name: "VOV1",
		urls: ["https://audio-lss.vov.vn/live/vov1.m3u8", "https://str.vov.gov.vn/vovlive/vov1vov5Vietnamese.sdp_aac/playlist.m3u8"]
	},
	{
		name: "VOV2",
		urls: ["https://audio-lss.vov.vn/live/vov2.m3u8", "https://str.vov.gov.vn/vovlive/vov2.sdp_aac/playlist.m3u8"]
	},
	{
		name: "VOV3",
		urls: ["https://audio-lss.vov.vn/live/vov3.m3u8", "https://str.vov.gov.vn/vovlive/vov3.sdp_aac/playlist.m3u8"]
	},
	{
		name: "VOV4",
		urls: ["https://audio-lss.vov.vn/live/vov4.m3u8"]
	},
	{
		name: "VOV5",
		urls: ["https://audio-lss.vov.vn/live/vov5.m3u8"]
	},
	{
		name: "VOV Giao thông Hà Nội",
		urls: ["https://play.vovgiaothong.vn/live/gthn/playlist.m3u8"]
	},
	{
		name: "VOV Giao thông Hồ Chí Minh",
		urls: ["https://play.vovgiaothong.vn/live/gthcm/playlist.m3u8"]
	}
];
var CURATED_TV = [
	{
		name: "Cần Thơ TV",
		urls: ["https://live.canthotv.vn/live/tv/playlist.m3u8", "https://live.canthotv.vn/live/tv/chunklist.m3u8"]
	},
	{
		name: "Cao Bằng TV",
		urls: ["https://stream.thingnet.vn/live/smil:CRTV.smil/chunklist.m3u8"]
	},
	{
		name: "Đắk Lắk TV",
		urls: ["https://cdn.drt.vn/live/285a27750861b964c27af22091662a74f2f/chunklist.m3u8"]
	},
	{
		name: "Lào Cai TV",
		urls: ["https://live.baolaocai.vn/channel2/stream.m3u8"]
	},
	{
		name: "Hà Tĩnh TV",
		urls: ["https://cohauw9bgpvod.vcdn.cloud/httv1/index.m3u8"]
	},
	{
		name: "Thái Nguyên TV",
		urls: ["https://streaming.thainguyentv.vn/hls/livestream.m3u8"]
	},
	{
		name: "QPVN",
		urls: ["https://qpvn.vn/live/qpvn/master.m3u8"]
	},
	{
		name: "Đà Nẵng TV1",
		urls: ["https://live.mediatech.vn/live/285b59a111d76974225a8e3004bfc31a509/chunklist.m3u8"]
	},
	{
		name: "Tây Ninh TV",
		urls: ["https://live-hq.evgcdn.net/live/2851dc2c9af68834814a89e61db0faee561/chunklist.m3u8"]
	},
	{
		name: "VTV1",
		urls: [fpt("vtv1")]
	},
	{
		name: "VTV2",
		urls: [fpt("vtv2")]
	},
	{
		name: "VTV3",
		urls: [fpt("vtv3")]
	},
	{
		name: "VTV4",
		urls: [fpt("vtv4")]
	},
	{
		name: "VTV5",
		urls: [fpt("vtv5")]
	},
	{
		name: "VTV6",
		urls: [fpt("vtv6")]
	},
	{
		name: "VTV7",
		urls: [fpt("vtv7")]
	},
	{
		name: "VTV9",
		urls: [fpt("vtv9")]
	},
	{
		name: "VTV10",
		urls: [fpt("vtv10")]
	},
	{
		name: "HTV1",
		urls: [fpt("htv1")]
	},
	{
		name: "HTV2",
		urls: [fpt("htv2")]
	},
	{
		name: "HTV3",
		urls: [fpt("htv3")]
	},
	{
		name: "HTV7",
		urls: [fpt("htv7")]
	},
	{
		name: "HTV9",
		urls: [fpt("htv9")]
	},
	{
		name: "Vietnam Today",
		urls: ["https://amagi-live.ondemandkorea.com/amgplt0456.m3u8"]
	},
	{
		name: "An Giang TV1",
		urls: ["https://tv.angiangtv.vn/live/kgtv/kgtv.m3u8"]
	},
	{
		name: "DW",
		lane: "itv",
		urls: ["https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8"]
	},
	{
		name: "DW Español",
		lane: "itv",
		urls: ["https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/master.m3u8"]
	},
	{
		name: "France 24",
		lane: "itv",
		urls: ["https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8"]
	},
	{
		name: "CGTN",
		lane: "cctv",
		urls: ["https://news.cgtn.com/resource/live/english/cgtn-news.m3u8"]
	},
	{
		name: "CGTN Español",
		lane: "cctv",
		urls: ["https://news.cgtn.com/resource/live/espanol/cgtn-e.m3u8"]
	},
	{
		name: "CGTN Français",
		lane: "cctv",
		urls: ["https://news.cgtn.com/resource/live/french/cgtn-f.m3u8"]
	},
	{
		name: "CGTN العربية",
		lane: "cctv",
		urls: ["https://news.cgtn.com/resource/live/arabic/cgtn-a.m3u8"]
	},
	{
		name: "CGTN Русский",
		lane: "cctv",
		urls: ["https://news.cgtn.com/resource/live/russian/cgtn-r.m3u8"]
	},
	{
		name: "CCTV+ 1",
		lane: "cctv",
		urls: ["https://cd-live-stream.news.cctvplus.com/live/smil:CHANNEL1.smil/playlist.m3u8"]
	},
	{
		name: "CCTV+ 2",
		lane: "cctv",
		urls: ["https://cd-live-stream.news.cctvplus.com/live/smil:CHANNEL2.smil/playlist.m3u8"]
	},
	...[
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
		"14",
		"16"
	].map((n) => ({
		name: `VTC${n}`,
		lane: "vtc",
		urls: [fpt(`vtc${n}`)]
	}))
];
var FALLBACK_FEEDS = [
	...CURATED_TV.map((item) => ({
		id: slugId("tv", item.name),
		name: item.name,
		kind: "tv",
		lane: item.lane ?? inferLane(item.name),
		urls: item.urls
	})),
	...CURATED_RADIO.map((item) => ({
		id: slugId("radio", item.name),
		name: item.name,
		kind: "radio",
		lane: "hls",
		urls: item.urls
	})),
	{
		id: slugId("radio", "RFI Tiếng Việt"),
		name: "RFI Tiếng Việt",
		kind: "radio",
		lane: "hls",
		urls: ["https://rfienvietnamien64k.ice.infomaniak.ch/rfienvietnamien-64.mp3"]
	}
];
function isVietnameseRadio(row) {
	const blob = fold(`${row.name} ${row.language} ${row.tags}`);
	if (blob.includes("abdulbasit") || blob.includes("quran")) return false;
	const vietnamese = blob.includes("viet") || /\bvov\b/.test(blob) || blob.includes("tieng viet") || blob.includes("vietnamese");
	if (row.country.toUpperCase() === "VN") return true;
	return vietnamese;
}
function assembleFeeds(tvRows, radioRows) {
	const tv = /* @__PURE__ */ new Map();
	const takeTv = (name, urls, lane) => {
		const cleaned = cleanName(name);
		if (!cleaned || foreignTv(cleaned)) return;
		const id = slugId("tv", cleaned);
		const nextLane = lane ?? inferLane(cleaned);
		const existing = tv.get(id);
		if (!existing) {
			const next = [];
			for (const url of urls) pushUrl(next, url);
			if (!next.length) return;
			tv.set(id, {
				id,
				name: cleaned,
				kind: "tv",
				lane: nextLane,
				urls: next
			});
			return;
		}
		if (lane) existing.lane = lane;
		for (const url of urls) pushUrl(existing.urls, url);
	};
	for (const item of CURATED_TV) takeTv(item.name, item.urls, item.lane ?? inferLane(item.name));
	for (const row of tvRows) takeTv(row.name, [row.url]);
	const radio = /* @__PURE__ */ new Map();
	const takeRadio = (name, urls, votes, rank) => {
		const cleaned = cleanName(name);
		if (!cleaned) return;
		const id = slugId("radio", cleaned);
		const existing = radio.get(id);
		if (!existing) {
			const next = [];
			for (const url of urls) pushUrl(next, url);
			if (!next.length) return;
			radio.set(id, {
				id,
				name: cleaned,
				kind: "radio",
				lane: "hls",
				urls: next,
				votes,
				rank
			});
			return;
		}
		for (const url of urls) pushUrl(existing.urls, url);
		existing.votes = Math.max(existing.votes, votes);
		existing.rank = Math.min(existing.rank, rank);
	};
	CURATED_RADIO.forEach((item, index) => takeRadio(item.name, item.urls, 1e4 - index, index));
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
	const radioFeeds = [...radio.values()].sort((a, b) => a.rank - b.rank || b.votes - a.votes || a.name.localeCompare(b.name, "vi")).map(({ votes: _votes, rank: _rank, ...feed }) => feed);
	return [...tvFeeds, ...radioFeeds];
}
function apiPath(path) {
	if (typeof window === "undefined") return path;
	return `${previewPathPrefix(window.location.hostname, window.location.pathname) ?? ""}${path}`;
}
var TV_LISTS = ["https://iptv-org.github.io/iptv/countries/vn.m3u", "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/vn.m3u"];
var CCTV_LISTS = ["https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cctv.m3u"];
var RADIO_LISTS = [
	"https://de1.api.radio-browser.info/json/stations/search?countrycode=VN&hidebroken=true&order=votes&reverse=true&limit=200",
	"https://at1.api.radio-browser.info/json/stations/search?countrycode=VN&hidebroken=true&order=votes&reverse=true&limit=200",
	"https://de1.api.radio-browser.info/json/stations/search?language=vietnamese&hidebroken=true&order=votes&reverse=true&limit=100"
];
var UA$1 = "SongViet/1.0 (Vietnamese TV and radio viewer)";
var cache = null;
var TTL_MS = 6e5;
async function textFrom(urls) {
	for (const url of urls) try {
		const response = await fetch(url, {
			headers: {
				"user-agent": UA$1,
				accept: "text/plain,*/*"
			},
			signal: AbortSignal.timeout(12e3)
		});
		if (!response.ok) continue;
		const text = await response.text();
		if (text.length > 40) return text;
	} catch {}
	return "";
}
function asRadio(value) {
	if (!value || typeof value !== "object") return null;
	const row = value;
	const url = String(row.url_resolved || row.url || "");
	if (!url.startsWith("http")) return null;
	return {
		name: String(row.name || "Đài"),
		url,
		votes: Number(row.votes) || 0,
		country: String(row.countrycode || ""),
		language: String(row.language || ""),
		tags: String(row.tags || "")
	};
}
async function loadCatalog() {
	if (cache && Date.now() - cache.at < TTL_MS) return JSON.parse(cache.body);
	const [tvText, cctvText, ...radioTexts] = await Promise.all([
		textFrom(TV_LISTS),
		textFrom(CCTV_LISTS),
		...RADIO_LISTS.slice(0, 2).map((url) => textFrom([url])),
		textFrom([RADIO_LISTS[2]])
	]);
	const radioRows = [];
	for (const blob of radioTexts) {
		if (!blob) continue;
		try {
			const parsed = JSON.parse(blob);
			for (const item of parsed) {
				const row = asRadio(item);
				if (row) radioRows.push(row);
			}
		} catch {}
	}
	const feeds = assembleFeeds([...tvText ? parseM3u(tvText) : [], ...cctvText ? parseM3u(cctvText) : []], radioRows);
	const body = JSON.stringify({ feeds: feeds.length ? feeds : FALLBACK_FEEDS });
	cache = {
		at: Date.now(),
		body
	};
	return JSON.parse(body);
}
function catalogJson(payload, status = 200) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "public, max-age=300"
		}
	});
}
var Route$1 = createFileRoute("/api/catalog")({ server: { handlers: { GET: async () => {
	try {
		return catalogJson(await loadCatalog());
	} catch (error) {
		console.error("[catalog]", error);
		return catalogJson({ feeds: FALLBACK_FEEDS });
	}
} } } });
var UA = "Mozilla/5.0 (Linux; Android 16; SM-A566B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
var dnsCache = /* @__PURE__ */ new Map();
function blocked(message, status = 400) {
	return new Response(message, {
		status,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}
function isPrivate(ip) {
	if (ip.startsWith("10.") || ip.startsWith("127.") || ip.startsWith("0.") || ip.startsWith("169.254.")) return true;
	if (ip.startsWith("192.168.") || ip.startsWith("100.64.")) return true;
	const match = /^172\.(\d+)\./.exec(ip);
	if (match) {
		const octet = Number(match[1]);
		if (octet >= 16 && octet <= 31) return true;
	}
	const lower = ip.toLowerCase();
	return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
}
async function assertPublicHttp(raw) {
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw new Error("bad url");
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad url");
	if (url.username || url.password) throw new Error("bad url");
	const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
	if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("blocked");
	if (/^\d+$/.test(host)) throw new Error("blocked");
	let address = host;
	if (isIP(host) === 0) {
		const hit = dnsCache.get(host);
		if (hit && hit.exp > Date.now()) address = hit.address;
		else {
			address = (await lookup(host)).address;
			dnsCache.set(host, {
				address,
				exp: Date.now() + 6e4
			});
		}
	}
	if (isPrivate(address)) throw new Error("blocked");
	return url;
}
/** Relative query keeps whatever path prefix the playlist itself was loaded from. */
function rewritePlaylist(body, playlistUrl) {
	const base = new URL(playlistUrl);
	const point = (uri) => {
		const absolute = new URL(uri, base).toString();
		return `?u=${encodeURIComponent(absolute)}`;
	};
	return body.split(/\r?\n/).map((line) => {
		const trimmed = line.trim();
		if (!trimmed) return line;
		if (trimmed.startsWith("#")) return line.replace(/URI=(["'])(.*?)\1/g, (_all, quote, uri) => {
			return `URI=${quote}${point(uri)}${quote}`;
		});
		return point(trimmed);
	}).join("\n");
}
async function pull(url, request, hops) {
	if (hops > 4) return blocked("too many redirects", 502);
	const headers = new Headers();
	headers.set("user-agent", UA);
	headers.set("accept", "*/*");
	const range = request.headers.get("range");
	if (range) headers.set("range", range);
	const upstream = await fetch(url, {
		headers,
		redirect: "manual",
		signal: AbortSignal.timeout(15e3)
	});
	if (upstream.status >= 300 && upstream.status < 400) {
		const location = upstream.headers.get("location");
		if (!location) return blocked("bad redirect", 502);
		return pull(await assertPublicHttp(new URL(location, url).toString()), request, hops + 1);
	}
	if (!upstream.ok && upstream.status !== 206) return blocked("upstream", upstream.status === 404 ? 404 : 502);
	const type = (upstream.headers.get("content-type") || "").toLowerCase();
	const path = url.pathname.toLowerCase();
	if (type.includes("mpegurl") || type.includes("m3u") || path.endsWith(".m3u8") || path.endsWith(".m3u")) {
		const text = await upstream.text();
		if (text.length > 15e5) return blocked("too large", 502);
		if (!text.trimStart().startsWith("#EXTM3U")) return new Response(text, {
			status: upstream.status,
			headers: {
				"content-type": type || "application/vnd.apple.mpegurl",
				"cache-control": "no-store"
			}
		});
		return new Response(rewritePlaylist(text, url.toString()), {
			status: 200,
			headers: {
				"content-type": "application/vnd.apple.mpegurl; charset=utf-8",
				"cache-control": "no-store"
			}
		});
	}
	if (!(type.startsWith("video/") || type.startsWith("audio/") || type.includes("mp2t") || type.includes("octet-stream") || /\.(ts|m4s|mp4|aac|mp3|cmfv|cmfa|vtt)(\?|$)/.test(path)) || type.includes("text/html") || type.includes("application/json")) return blocked("not media", 415);
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
	return new Response(upstream.body, {
		status: upstream.status,
		headers: out
	});
}
async function proxyMedia(request) {
	const raw = new URL(request.url).searchParams.get("u") ?? "";
	if (!raw || raw.length > 12e3) return blocked("bad url");
	try {
		return await pull(await assertPublicHttp(raw), request, 0);
	} catch (error) {
		const message = error instanceof Error ? error.message : "blocked";
		if (message === "bad url" || message === "blocked") return blocked(message);
		return blocked("upstream", 502);
	}
}
var Route = createFileRoute("/api/media")({ server: { handlers: { GET: ({ request }) => proxyMedia(request) } } });
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	ApiCatalogRoute: Route$1.update({
		id: "/api/catalog",
		path: "/api/catalog",
		getParentRoute: () => Route$3
	}),
	ApiMediaRoute: Route.update({
		id: "/api/media",
		path: "/api/media",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { isHls as i, FALLBACK_FEEDS as n, apiPath as r, router_exports as t };
