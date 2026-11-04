import { useEffect, useRef, useState } from "react";
import { AnatomyDock } from "@/components/anatomy-dock";
import { apiPath, FALLBACK_FEEDS, isHls, type Feed, type FeedKind, type Lane } from "@/lib/feeds";

type Phase = "on" | "off";

const LANE_LABEL: Record<Lane, string> = {
  hls: "HLS",
  itv: "ITV",
  cctv: "CCTV",
  vtc: "VTC",
};

const SKIP_CAP = 24;

async function loadFeeds(): Promise<Feed[]> {
  try {
    const response = await fetch(apiPath("/api/catalog"), { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as { feeds?: Feed[] };
    if (!data.feeds?.length) throw new Error("empty");
    return data.feeds.filter((feed) => feed.urls?.length && feed.name);
  } catch {
    return FALLBACK_FEEDS;
  }
}

export function StagePlayer() {
  const appRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const feedsRef = useRef<Feed[]>(FALLBACK_FEEDS);
  const indexRef = useRef(0);
  const urlPosRef = useRef(0);
  const phaseRef = useRef<Phase>("on");
  const genRef = useRef(0);
  const skipsRef = useRef(0);
  const gotPlayingRef = useRef(false);
  const watchRef = useRef(0);
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const osdTimerRef = useRef(0);
  const slotRef = useRef({ tv: 0, radio: 0 });

  const [phase, setPhase] = useState<Phase>("on");
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(false);
  const [hint, setHint] = useState("");
  const [osd, setOsd] = useState(true);
  const [holding, setHolding] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  const ctl = useRef({
    userNext: () => {},
    powerOff: () => {},
    switchKind: (_kind: FeedKind) => {},
    unlock: () => {},
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

  function publish(feed: Feed) {
    if (!("mediaSession" in navigator)) return;
    const lane = feed.kind === "tv" ? LANE_LABEL[feed.lane] : "Đài";
    navigator.mediaSession.metadata = new MediaMetadata({
      title: feed.name,
      artist: lane,
      album: "SÓNG",
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
    void wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  }

  function clearWatch() {
    window.clearTimeout(watchRef.current);
    watchRef.current = 0;
  }

  function armWatch(gen: number) {
    clearWatch();
    watchRef.current = window.setTimeout(() => {
      if (gen !== genRef.current || gotPlayingRef.current) return;
      void fail(gen);
    }, 8000);
  }

  async function kickPlay(video: HTMLVideoElement, gen: number) {
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

  async function startHls(url: string, viaProxy: boolean, gen: number) {
    const video = videoRef.current;
    if (!video || gen !== genRef.current) return;
    const source = viaProxy ? apiPath(`/api/media?u=${encodeURIComponent(url)}`) : url;
    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") === "probably";
    if (nativeHls && !viaProxy) {
      video.src = source;
      void kickPlay(video, gen);
      return;
    }
    const { default: Hls } = await import("hls.js");
    if (gen !== genRef.current) return;
    if (!Hls.isSupported()) {
      video.src = source;
      void kickPlay(video, gen);
      return;
    }
    destroyHls();
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      manifestLoadingTimeOut: 8000,
      manifestLoadingMaxRetry: 1,
      levelLoadingTimeOut: 8000,
      fragLoadingTimeOut: 10_000,
    });
    hlsRef.current = hls;
    hls.on(Hls.Events.MANIFEST_PARSED, () => void kickPlay(video, gen));
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal || gen !== genRef.current) return;
      const code = data.response?.code ?? 0;
      const cors = code === 0 || data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR;
      if (!viaProxy && cors) {
        hls.destroy();
        hlsRef.current = null;
        armWatch(gen);
        void startHls(url, true, gen);
        return;
      }
      void fail(gen);
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video.addEventListener("canplay", () => void kickPlay(video, gen), { once: true });
  }

  function openUrl(url: string, gen: number) {
    const video = videoRef.current;
    if (!video || gen !== genRef.current) return;
    destroyHls();
    gotPlayingRef.current = false;
    setLive(false);
    video.pause();
    armWatch(gen);
    if (isHls(url)) {
      video.removeAttribute("src");
      void startHls(url, false, gen);
      return;
    }
    video.src = url;
    void kickPlay(video, gen);
  }

  function fail(gen: number) {
    if (gen !== genRef.current || phaseRef.current !== "on") return;
    const feeds = feedsRef.current;
    const feed = feeds[indexRef.current];
    if (!feed) return;
    const nextGen = ++genRef.current;
    if (urlPosRef.current + 1 < feed.urls.length) {
      urlPosRef.current += 1;
      openUrl(feed.urls[urlPosRef.current]!, nextGen);
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
    const nextFeed = feeds[next]!;
    remember(nextFeed);
    publish(nextFeed);
    openUrl(nextFeed.urls[0]!, nextGen);
  }

  function remember(feed: Feed) {
    if (feed.kind === "tv") slotRef.current.tv = indexRef.current;
    else slotRef.current.radio = indexRef.current;
    try {
      localStorage.setItem("song.id", feed.id);
      localStorage.setItem("song.kind", feed.kind);
    } catch {
      /* ignore quota */
    }
  }

  function begin(indexValue: number) {
    const feeds = feedsRef.current;
    if (!feeds.length) return;
    const next = ((indexValue % feeds.length) + feeds.length) % feeds.length;
    indexRef.current = next;
    urlPosRef.current = 0;
    setIndex(next);
    setHint("");
    flashOsd();
    const feed = feeds[next]!;
    remember(feed);
    publish(feed);
    const gen = ++genRef.current;
    openUrl(feed.urls[0]!, gen);
  }

  ctl.current.unlock = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    void video.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
  };

  ctl.current.userNext = () => {
    skipsRef.current = 0;
    const feeds = feedsRef.current;
    if (phaseRef.current !== "on") {
      phaseRef.current = "on";
      setPhase("on");
      void claimWake();
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
    const current = feeds[indexRef.current];
    if (current?.kind === kind && phaseRef.current === "on") return;
    if (phaseRef.current !== "on") {
      phaseRef.current = "on";
      setPhase("on");
      void claimWake();
    }
    let target = kind === "tv" ? slotRef.current.tv : slotRef.current.radio;
    if (feeds[target]?.kind !== kind) {
      target = feeds.findIndex((feed) => feed.kind === kind);
    }
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
    if (document.pictureInPictureElement) void document.exitPictureInPicture().catch(() => {});
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
  };

  useEffect(() => {
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
      void fail(genRef.current);
    };
    const onVis = () => {
      if (document.visibilityState !== "hidden") return;
      if (phaseRef.current !== "on" || video.paused) return;
      if (!document.pictureInPictureEnabled || document.pictureInPictureElement) return;
      void video.requestPictureInPicture().catch(() => {});
    };
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVis);
    video.disablePictureInPicture = false;

    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("nexttrack", () => ctl.current.userNext());
        navigator.mediaSession.setActionHandler("stop", () => ctl.current.powerOff());
      } catch {
        /* some browsers reject a handler twice */
      }
    }

    const block = (event: Event) => event.preventDefault();
    document.addEventListener("contextmenu", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("gesturestart", block);
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ["+", "-", "=", "_", "0"].includes(event.key)) {
        event.preventDefault();
      }
    };
    const onCtrlWheel = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onCtrlWheel, { passive: false });

    let downX = 0;
    let downY = 0;
    let moved = false;
    let holdTimer = 0;
    let held = false;
    let lastUp = 0;
    let pending = 0;

    const clearHold = () => {
      window.clearTimeout(holdTimer);
      holdTimer = 0;
      setHolding(false);
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      try {
        screen.setPointerCapture(event.pointerId);
      } catch {
        /* a lost pointer still starts the hold */
      }
      downX = event.clientX;
      downY = event.clientY;
      moved = false;
      held = false;
      clearHold();
      setHolding(true);
      holdTimer = window.setTimeout(() => {
        held = true;
        setHolding(false);
        window.clearTimeout(pending);
        const kind = feedsRef.current[indexRef.current]?.kind === "radio" ? "tv" : "radio";
        ctl.current.switchKind(kind);
      }, 2000);
    };
    const onMove = (event: PointerEvent) => {
      if (!holdTimer && !held) return;
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 14) {
        moved = true;
        clearHold();
      }
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
        const current = videoRef.current;
        if (current?.muted) {
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
    void claimWake();
    begin(0);

    void loadFeeds().then((feeds) => {
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
    // Playback and gestures live in refs so this binds once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed = feedsRef.current[index] ?? FALLBACK_FEEDS[0]!;
  const lane = feed.kind === "tv" ? LANE_LABEL[feed.lane] ?? "HLS" : "Đài";
  const whisper =
    phase === "off"
      ? "Chạm để mở lại"
      : feed.kind === "radio"
        ? "Giữ 2 giây — về hình"
        : "Giữ 2 giây — đài";

  return (
    <section id="song-home" className="song-home">
      <main ref={appRef} className="app" aria-label="SÓNG">
        <div className={phase === "off" ? "stage is-off" : holding ? "stage is-holding" : "stage"}>
          <div className="screen" ref={screenRef}>
            <video
              ref={videoRef}
              className={phase === "on" && feed.kind === "tv" ? "picture" : "picture is-hidden"}
              playsInline
              autoPlay
            />
            {phase === "on" && feed.kind === "radio" ? (
              <div className="radio-face">
                <p className="kicker">Đài</p>
                <h1>{feed.name}</h1>
              </div>
            ) : null}
            <p className={phase === "on" && (osd || !live || needsTap) ? "osd is-on" : "osd"} aria-live="polite">
              {phase === "off" ? "Đã tắt" : `${feed.name} · ${lane}${hint ? ` · ${hint}` : ""}`}
              {needsTap && phase === "on" ? " · Chạm để mở tiếng" : ""}
              {live && phase === "on" ? <span className="live" /> : null}
            </p>
            <p className="whisper">{whisper}</p>
            <div className="hold" />
          </div>
          <AnatomyDock />
        </div>
      </main>
    </section>
  );
}
