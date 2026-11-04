import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as isHls, n as FALLBACK_FEEDS, r as apiPath } from "./router-Ccggue2n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CZJXMzle.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AnatomyDock() {
	const rootRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const root = rootRef.current;
		if (!root) return;
		let dead = false;
		let dispose = () => {};
		import("./anatomy-scene-Dfs0EU70.mjs").then((mod) => {
			if (dead || !rootRef.current) return;
			dispose = mod.mountAnatomy(root).dispose;
		});
		return () => {
			dead = true;
			dispose();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "anatomy",
		ref: rootRef,
		"aria-label": "Mô phỏng 3D. Kéo để xoay, chạm để đổi hệ. Nút Bài cơ xương mở bài giảng.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { className: "anatomy-gl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "anatomy-hud",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "anatomy-kicker",
						"data-kicker": true,
						children: "Hệ cơ quan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-vitals": true,
						children: "Đang nạp atlas giải phẫu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "anatomy-teach",
						"data-teach": true,
						hidden: true,
						children: "Bài cơ xương"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "anatomy-card",
				"data-card": true,
				hidden: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "anatomy-card-kicker",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-step": true,
							children: "1/7"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-title": true,
							children: "Chìa khóa"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "anatomy-card-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "anatomy-card-tag",
							children: "Nhớ"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "anatomy-card-hook",
							"data-hook": true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "anatomy-card-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "anatomy-card-tag",
							children: "Hiểu"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-fact": true })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "anatomy-card-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "anatomy-card-tag",
							children: "Việc"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-tip": true })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "anatomy-card-dots",
						"data-dots": true,
						children: "● ○ ○ ○ ○ ○ ○"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "anatomy-credit",
				children: "Nguồn: BodyParts3D · Z-Anatomy · CC BY-SA"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				className: "anatomy-ecg",
				"aria-hidden": "true"
			})
		]
	});
}
var LANE_LABEL = {
	hls: "HLS",
	itv: "ITV",
	cctv: "CCTV",
	vtc: "VTC"
};
var SKIP_CAP = 24;
async function loadFeeds() {
	try {
		const response = await fetch(apiPath("/api/catalog"), { cache: "no-store" });
		if (!response.ok) throw new Error(String(response.status));
		const data = await response.json();
		if (!data.feeds?.length) throw new Error("empty");
		return data.feeds.filter((feed) => feed.urls?.length && feed.name);
	} catch {
		return FALLBACK_FEEDS;
	}
}
function StagePlayer() {
	const appRef = (0, import_react.useRef)(null);
	const screenRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const hlsRef = (0, import_react.useRef)(null);
	const feedsRef = (0, import_react.useRef)(FALLBACK_FEEDS);
	const indexRef = (0, import_react.useRef)(0);
	const urlPosRef = (0, import_react.useRef)(0);
	const phaseRef = (0, import_react.useRef)("on");
	const genRef = (0, import_react.useRef)(0);
	const skipsRef = (0, import_react.useRef)(0);
	const gotPlayingRef = (0, import_react.useRef)(false);
	const watchRef = (0, import_react.useRef)(0);
	const wakeRef = (0, import_react.useRef)(null);
	const osdTimerRef = (0, import_react.useRef)(0);
	const slotRef = (0, import_react.useRef)({
		tv: 0,
		radio: 0
	});
	const [phase, setPhase] = (0, import_react.useState)("on");
	const [index, setIndex] = (0, import_react.useState)(0);
	const [live, setLive] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	const [osd, setOsd] = (0, import_react.useState)(true);
	const [holding, setHolding] = (0, import_react.useState)(false);
	const [needsTap, setNeedsTap] = (0, import_react.useState)(false);
	const ctl = (0, import_react.useRef)({
		userNext: () => {},
		powerOff: () => {},
		switchKind: (_kind) => {},
		unlock: () => {}
	});
	function flashOsd() {
		setOsd(true);
		window.clearTimeout(osdTimerRef.current);
		osdTimerRef.current = window.setTimeout(() => setOsd(false), 2200);
	}
	function destroyHls() {
		hlsRef.current?.destroy();
		hlsRef.current = null;
	}
	function publish(feed) {
		if (!("mediaSession" in navigator)) return;
		const lane = feed.kind === "tv" ? LANE_LABEL[feed.lane] : "Đài";
		navigator.mediaSession.metadata = new MediaMetadata({
			title: feed.name,
			artist: lane,
			album: "SÓNG"
		});
		navigator.mediaSession.playbackState = "playing";
	}
	async function claimWake() {
		try {
			wakeRef.current = await navigator.wakeLock.request("screen");
		} catch {
			wakeRef.current = null;
		}
	}
	function releaseWake() {
		wakeRef.current?.release().catch(() => {});
		wakeRef.current = null;
	}
	function clearWatch() {
		window.clearTimeout(watchRef.current);
		watchRef.current = 0;
	}
	function armWatch(gen) {
		clearWatch();
		watchRef.current = window.setTimeout(() => {
			if (gen !== genRef.current || gotPlayingRef.current) return;
			fail(gen);
		}, 8e3);
	}
	async function kickPlay(video, gen) {
		if (gen !== genRef.current || phaseRef.current !== "on") return;
		try {
			video.muted = false;
			await video.play();
			if (gen === genRef.current) setNeedsTap(false);
		} catch {
			if (gen !== genRef.current || phaseRef.current !== "on") return;
			video.muted = true;
			try {
				await video.play();
				if (gen === genRef.current) setNeedsTap(true);
			} catch {
				if (gen === genRef.current) setNeedsTap(true);
			}
		}
	}
	async function startHls(url, viaProxy, gen) {
		const video = videoRef.current;
		if (!video || gen !== genRef.current) return;
		const source = viaProxy ? apiPath(`/api/media?u=${encodeURIComponent(url)}`) : url;
		if (video.canPlayType("application/vnd.apple.mpegurl") === "probably" && !viaProxy) {
			video.src = source;
			kickPlay(video, gen);
			return;
		}
		const { default: Hls } = await import("../_libs/hls.js.mjs").then((n) => n.t);
		if (gen !== genRef.current) return;
		if (!Hls.isSupported()) {
			video.src = source;
			kickPlay(video, gen);
			return;
		}
		destroyHls();
		const hls = new Hls({
			enableWorker: true,
			lowLatencyMode: false,
			manifestLoadingTimeOut: 8e3,
			manifestLoadingMaxRetry: 1,
			levelLoadingTimeOut: 8e3,
			fragLoadingTimeOut: 1e4
		});
		hlsRef.current = hls;
		hls.on(Hls.Events.MANIFEST_PARSED, () => void kickPlay(video, gen));
		hls.on(Hls.Events.ERROR, (_event, data) => {
			if (!data.fatal || gen !== genRef.current) return;
			const cors = (data.response?.code ?? 0) === 0 || data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR;
			if (!viaProxy && cors) {
				hls.destroy();
				hlsRef.current = null;
				armWatch(gen);
				startHls(url, true, gen);
				return;
			}
			fail(gen);
		});
		hls.loadSource(source);
		hls.attachMedia(video);
		video.addEventListener("canplay", () => void kickPlay(video, gen), { once: true });
	}
	function openUrl(url, gen) {
		const video = videoRef.current;
		if (!video || gen !== genRef.current) return;
		destroyHls();
		gotPlayingRef.current = false;
		setLive(false);
		video.pause();
		armWatch(gen);
		if (isHls(url)) {
			video.removeAttribute("src");
			startHls(url, false, gen);
			return;
		}
		video.src = url;
		kickPlay(video, gen);
	}
	function fail(gen) {
		if (gen !== genRef.current || phaseRef.current !== "on") return;
		const feeds = feedsRef.current;
		const feed = feeds[indexRef.current];
		if (!feed) return;
		const nextGen = ++genRef.current;
		if (urlPosRef.current + 1 < feed.urls.length) {
			urlPosRef.current += 1;
			openUrl(feed.urls[urlPosRef.current], nextGen);
			return;
		}
		skipsRef.current += 1;
		if (skipsRef.current >= SKIP_CAP) {
			clearWatch();
			destroyHls();
			setLive(false);
			setHint("Không vào được sóng. Chạm để thử kênh khác.");
			flashOsd();
			return;
		}
		const kind = feed.kind;
		let next = -1;
		for (let step = 1; step <= feeds.length; step += 1) {
			const candidate = (indexRef.current + step) % feeds.length;
			if (feeds[candidate]?.kind === kind) {
				next = candidate;
				break;
			}
		}
		if (next < 0 || next === indexRef.current) {
			clearWatch();
			setLive(false);
			setHint("Mất tín hiệu");
			flashOsd();
			return;
		}
		indexRef.current = next;
		urlPosRef.current = 0;
		setIndex(next);
		setHint("Mất tín hiệu — đang chuyển");
		flashOsd();
		const nextFeed = feeds[next];
		remember(nextFeed);
		publish(nextFeed);
		openUrl(nextFeed.urls[0], nextGen);
	}
	function remember(feed) {
		if (feed.kind === "tv") slotRef.current.tv = indexRef.current;
		else slotRef.current.radio = indexRef.current;
		try {
			localStorage.setItem("song.id", feed.id);
			localStorage.setItem("song.kind", feed.kind);
		} catch {}
	}
	function begin(indexValue) {
		const feeds = feedsRef.current;
		if (!feeds.length) return;
		const next = (indexValue % feeds.length + feeds.length) % feeds.length;
		indexRef.current = next;
		urlPosRef.current = 0;
		setIndex(next);
		setHint("");
		flashOsd();
		const feed = feeds[next];
		remember(feed);
		publish(feed);
		const gen = ++genRef.current;
		openUrl(feed.urls[0], gen);
	}
	ctl.current.unlock = () => {
		const video = videoRef.current;
		if (!video) return;
		video.muted = false;
		video.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
	};
	ctl.current.userNext = () => {
		skipsRef.current = 0;
		const feeds = feedsRef.current;
		if (phaseRef.current !== "on") {
			phaseRef.current = "on";
			setPhase("on");
			claimWake();
			begin(indexRef.current);
			return;
		}
		const kind = feeds[indexRef.current]?.kind ?? "tv";
		for (let step = 1; step <= feeds.length; step += 1) {
			const candidate = (indexRef.current + step) % feeds.length;
			if (feeds[candidate]?.kind === kind) {
				begin(candidate);
				return;
			}
		}
	};
	ctl.current.switchKind = (kind) => {
		const feeds = feedsRef.current;
		if (feeds[indexRef.current]?.kind === kind && phaseRef.current === "on") return;
		if (phaseRef.current !== "on") {
			phaseRef.current = "on";
			setPhase("on");
			claimWake();
		}
		let target = kind === "tv" ? slotRef.current.tv : slotRef.current.radio;
		if (feeds[target]?.kind !== kind) target = feeds.findIndex((feed) => feed.kind === kind);
		if (target < 0) {
			setHint(kind === "radio" ? "Chưa có đài" : "Chưa có kênh");
			flashOsd();
			return;
		}
		skipsRef.current = 0;
		begin(target);
	};
	ctl.current.powerOff = () => {
		phaseRef.current = "off";
		setPhase("off");
		genRef.current += 1;
		clearWatch();
		destroyHls();
		const video = videoRef.current;
		if (video) {
			video.pause();
			video.removeAttribute("src");
			video.load();
		}
		setLive(false);
		setNeedsTap(false);
		setHint("");
		setOsd(true);
		releaseWake();
		if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
		if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
	};
	(0, import_react.useEffect)(() => {
		const app = appRef.current;
		const screen = screenRef.current;
		const video = videoRef.current;
		if (!app || !screen || !video) return;
		const onPlaying = () => {
			if (phaseRef.current !== "on") return;
			gotPlayingRef.current = true;
			clearWatch();
			skipsRef.current = 0;
			setLive(true);
			setHint("");
		};
		const onError = () => {
			if (phaseRef.current !== "on") return;
			if (!video.error) return;
			if (!video.currentSrc && !video.getAttribute("src")) return;
			fail(genRef.current);
		};
		const onVis = () => {
			if (document.visibilityState !== "hidden") return;
			if (phaseRef.current !== "on" || video.paused) return;
			if (!document.pictureInPictureEnabled || document.pictureInPictureElement) return;
			video.requestPictureInPicture().catch(() => {});
		};
		video.addEventListener("playing", onPlaying);
		video.addEventListener("error", onError);
		document.addEventListener("visibilitychange", onVis);
		video.disablePictureInPicture = false;
		if ("mediaSession" in navigator) try {
			navigator.mediaSession.setActionHandler("nexttrack", () => ctl.current.userNext());
			navigator.mediaSession.setActionHandler("stop", () => ctl.current.powerOff());
		} catch {}
		const block = (event) => event.preventDefault();
		document.addEventListener("contextmenu", block);
		document.addEventListener("selectstart", block);
		document.addEventListener("dragstart", block);
		document.addEventListener("gesturestart", block);
		const onKey = (event) => {
			if ((event.ctrlKey || event.metaKey) && [
				"+",
				"-",
				"=",
				"_",
				"0"
			].includes(event.key)) event.preventDefault();
		};
		const onCtrlWheel = (event) => {
			if (event.ctrlKey) event.preventDefault();
		};
		document.addEventListener("keydown", onKey);
		window.addEventListener("wheel", onCtrlWheel, { passive: false });
		let downX = 0;
		let downY = 0;
		let holdTimer = 0;
		let held = false;
		let lastUp = 0;
		let pending = 0;
		const clearHold = () => {
			window.clearTimeout(holdTimer);
			holdTimer = 0;
			setHolding(false);
		};
		const onDown = (event) => {
			if (event.button !== 0) return;
			try {
				screen.setPointerCapture(event.pointerId);
			} catch {}
			downX = event.clientX;
			downY = event.clientY;
			held = false;
			clearHold();
			setHolding(true);
			holdTimer = window.setTimeout(() => {
				held = true;
				setHolding(false);
				window.clearTimeout(pending);
				const kind = feedsRef.current[indexRef.current]?.kind === "radio" ? "tv" : "radio";
				ctl.current.switchKind(kind);
			}, 2e3);
		};
		const onMove = (event) => {
			if (!holdTimer && !held) return;
			if (Math.hypot(event.clientX - downX, event.clientY - downY) > 14) clearHold();
		};
		const onUp = () => {
			clearHold();
			if (held) {
				ctl.current.unlock();
				return;
			}
			const now = performance.now();
			if (now - lastUp < 450) {
				window.clearTimeout(pending);
				lastUp = 0;
				ctl.current.powerOff();
				return;
			}
			lastUp = now;
			window.clearTimeout(pending);
			pending = window.setTimeout(() => {
				if (videoRef.current?.muted) {
					ctl.current.unlock();
					return;
				}
				ctl.current.userNext();
			}, 450);
		};
		screen.addEventListener("pointerdown", onDown);
		screen.addEventListener("pointermove", onMove);
		screen.addEventListener("pointerup", onUp);
		screen.addEventListener("pointercancel", onUp);
		let cancelLoad = false;
		phaseRef.current = "on";
		claimWake();
		begin(0);
		loadFeeds().then((feeds) => {
			if (cancelLoad || !feeds.length) return;
			const current = feedsRef.current[indexRef.current];
			feedsRef.current = feeds;
			if (phaseRef.current === "on" && current) {
				const found = feeds.findIndex((feed) => feed.id === current.id);
				if (found >= 0) {
					indexRef.current = found;
					if (current.kind === "tv") slotRef.current.tv = found;
					setIndex(found);
					return;
				}
			}
			const next = feeds.findIndex((feed) => feed.kind === "tv");
			indexRef.current = next >= 0 ? next : 0;
			setIndex(indexRef.current);
		});
		return () => {
			cancelLoad = true;
			video.removeEventListener("playing", onPlaying);
			video.removeEventListener("error", onError);
			document.removeEventListener("visibilitychange", onVis);
			document.removeEventListener("contextmenu", block);
			document.removeEventListener("selectstart", block);
			document.removeEventListener("dragstart", block);
			document.removeEventListener("gesturestart", block);
			document.removeEventListener("keydown", onKey);
			window.removeEventListener("wheel", onCtrlWheel);
			screen.removeEventListener("pointerdown", onDown);
			screen.removeEventListener("pointermove", onMove);
			screen.removeEventListener("pointerup", onUp);
			screen.removeEventListener("pointercancel", onUp);
			window.clearTimeout(pending);
			clearHold();
			clearWatch();
			window.clearTimeout(osdTimerRef.current);
			destroyHls();
			releaseWake();
		};
	}, []);
	const feed = feedsRef.current[index] ?? FALLBACK_FEEDS[0];
	const lane = feed.kind === "tv" ? LANE_LABEL[feed.lane] ?? "HLS" : "Đài";
	const whisper = phase === "off" ? "Chạm để mở lại" : feed.kind === "radio" ? "Giữ 2 giây — về hình" : "Giữ 2 giây — đài";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "song-home",
		className: "song-home",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			ref: appRef,
			className: "app",
			"aria-label": "SÓNG",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: phase === "off" ? "stage is-off" : holding ? "stage is-holding" : "stage",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "screen",
					ref: screenRef,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: videoRef,
							className: phase === "on" && feed.kind === "tv" ? "picture" : "picture is-hidden",
							playsInline: true,
							autoPlay: true
						}),
						phase === "on" && feed.kind === "radio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "radio-face",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "kicker",
								children: "Đài"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: feed.name })]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: phase === "on" && (osd || !live || needsTap) ? "osd is-on" : "osd",
							"aria-live": "polite",
							children: [
								phase === "off" ? "Đã tắt" : `${feed.name} · ${lane}${hint ? ` · ${hint}` : ""}`,
								needsTap && phase === "on" ? " · Chạm để mở tiếng" : "",
								live && phase === "on" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live" }) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "whisper",
							children: whisper
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hold" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnatomyDock, {})]
			})
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StagePlayer, {});
}
//#endregion
export { Home as component };
