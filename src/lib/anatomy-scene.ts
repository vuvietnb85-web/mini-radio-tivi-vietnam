import * as THREE from "three";
import { loadAnatomyAtlas, type AnatomyAtlas } from "@/lib/anatomy-atlas";
import { LESSONS } from "@/lib/msk-lesson";

type System = "tim" | "hohap" | "thankinh" | "tieuhoa" | "tietnieu";

const FOCUS: Array<System | "all"> = ["all", "tim", "hohap", "thankinh", "tieuhoa", "tietnieu"];
const FOCUS_LABEL: Record<(typeof FOCUS)[number], string> = {
  all: "Đủ hệ",
  tim: "Tim mạch",
  hohap: "Hô hấp",
  thankinh: "Thần kinh",
  tieuhoa: "Tiêu hóa",
  tietnieu: "Tiết niệu",
};

export function mountAnatomy(root: HTMLElement) {
  const glCanvas = root.querySelector<HTMLCanvasElement>(".anatomy-gl");
  const ecgCanvas = root.querySelector<HTMLCanvasElement>(".anatomy-ecg");
  const vitals = root.querySelector<HTMLElement>("[data-vitals]");
  const teachBtn = root.querySelector<HTMLButtonElement>("[data-teach]");
  const card = root.querySelector<HTMLElement>("[data-card]");
  const kicker = root.querySelector<HTMLElement>("[data-kicker]");
  const stepEl = root.querySelector<HTMLElement>("[data-step]");
  const titleEl = root.querySelector<HTMLElement>("[data-title]");
  const hookEl = root.querySelector<HTMLElement>("[data-hook]");
  const factEl = root.querySelector<HTMLElement>("[data-fact]");
  const tipEl = root.querySelector<HTMLElement>("[data-tip]");
  const dotsEl = root.querySelector<HTMLElement>("[data-dots]");
  if (!glCanvas || !ecgCanvas || !vitals) return { dispose() {} };

  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: glCanvas,
      alpha: true,
      antialias: true,
      powerPreference: "default",
    });
  } catch {
    renderer = null;
  }
  if (!renderer || !renderer.getContext()) return mountFlat(glCanvas, ecgCanvas, vitals);

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.08, 40);
  const rig = new THREE.Group();
  const proxy = new THREE.Group();
  scene.add(rig);
  rig.add(proxy);

  const geos = new Set<THREE.BufferGeometry>();
  const mats = new Set<THREE.Material>();
  const bone = material(0xd9d3c8, 0x2a2a28, 0.12, 0.62);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  scene.add(new THREE.HemisphereLight(0xd5e4f5, 0x1a120e, 0.55));
  const key = new THREE.DirectionalLight(0xfff4e8, 1.45);
  key.position.set(2.4, 3.2, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd0ff, 0.7);
  rim.position.set(-3.2, 1.4, -2.2);
  scene.add(rim);
  const pulseLight = new THREE.PointLight(0xff4458, 0.6, 3.2, 1.4);
  pulseLight.position.set(0.12, 0.58, 0.3);
  rig.add(pulseLight);

  const profile = [
    [0.02, 1.78],
    [0.16, 1.72],
    [0.21, 1.56],
    [0.17, 1.44],
    [0.1, 1.3],
    [0.26, 1.16],
    [0.42, 1.02],
    [0.4, 0.72],
    [0.34, 0.4],
    [0.3, 0.08],
    [0.34, -0.22],
    [0.36, -0.48],
    [0.22, -0.78],
    [0.04, -0.9],
  ].map(([x, y]) => new THREE.Vector2(x!, y!));
  const shellGeo = new THREE.LatheGeometry(profile, 40);
  geos.add(shellGeo);
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x8eafc6,
    transparent: true,
    opacity: 0.07,
    roughness: 0.15,
    metalness: 0,
    depthWrite: false,
  });
  mats.add(shellMat);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x7eb6d6,
    wireframe: true,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  mats.add(wireMat);
  proxy.add(new THREE.Mesh(shellGeo, shellMat), new THREE.Mesh(shellGeo, wireMat));

  const vertGeo = new THREE.CylinderGeometry(0.032, 0.036, 0.05, 8);
  geos.add(vertGeo);
  for (let i = 0; i < 20; i += 1) {
    const piece = new THREE.Mesh(vertGeo, bone);
    piece.position.set(0, -0.62 + i * 0.085, -0.2);
    proxy.add(piece);
  }
  for (let i = 0; i < 6; i += 1) {
    const y = 0.36 + i * 0.09;
    const rx = 0.3 - Math.abs(i - 3) * 0.012;
    proxy.add(rib(y, rx, 0.16));
  }

  const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.042, 0.28, 10), bone);
  geos.add(trachea.geometry);
  trachea.position.set(0, 0.98, 0.05);
  proxy.add(trachea);

  const brainMat = material(0xe7c2ce, 0x6a3048, 0.28, 0.55);
  const brainGeo = new THREE.IcosahedronGeometry(0.16, 2);
  displaceBrain(brainGeo);
  geos.add(brainGeo);
  const brain = new THREE.Mesh(brainGeo, brainMat);
  brain.position.set(0, 1.55, 0.02);
  proxy.add(brain);
  const sparks = makePoints(18, 0xffd2e4, 2.2);
  brain.add(sparks.points);

  const heartMat = material(0xb21f33, 0x6a0c18, 0.45, 0.38);
  const heart = new THREE.Group();
  heart.add(blob(0.15, heartMat, 0.01, -0.02, 0, 1, 1.18, 0.86));
  heart.add(blob(0.11, heartMat, 0.11, 0.01, 0.02, 0.9, 1.05, 0.78));
  heart.add(blob(0.075, heartMat, -0.02, 0.1, 0, 1, 0.9, 0.85));
  heart.add(blob(0.068, heartMat, 0.09, 0.1, 0.02, 1, 0.85, 0.8));
  const aortaMat = material(0xd24a58, 0x5a1020, 0.3, 0.4);
  heart.add(
    vessel(
      [
        new THREE.Vector3(0.02, 0.12, 0),
        new THREE.Vector3(0.02, 0.28, 0.02),
        new THREE.Vector3(-0.02, 0.4, 0.04),
        new THREE.Vector3(-0.08, 0.34, 0.06),
      ],
      0.028,
      aortaMat,
    ),
  );
  heart.position.set(0.1, 0.56, 0.16);
  heart.rotation.z = 0.42;
  proxy.add(heart);

  const lungMat = material(0xd08996, 0x5a3038, 0.2, 0.62);
  const lungs = new THREE.Group();
  lungs.add(blob(0.16, lungMat, -0.24, 0.08, 0, 0.85, 1.25, 0.62));
  lungs.add(blob(0.11, lungMat, -0.22, -0.1, 0.02, 0.9, 0.85, 0.6));
  lungs.add(blob(0.09, lungMat, -0.16, 0.2, -0.02, 0.8, 0.7, 0.55));
  lungs.add(blob(0.15, lungMat, 0.22, 0.06, 0, 0.78, 1.15, 0.58));
  lungs.add(blob(0.1, lungMat, 0.2, -0.1, 0.02, 0.85, 0.8, 0.55));
  lungs.position.set(0, 0.58, 0.02);
  proxy.add(lungs);

  const diaMat = new THREE.MeshStandardMaterial({
    color: 0xc48b86,
    roughness: 0.7,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  mats.add(diaMat);
  const diaphragm = new THREE.Mesh(new THREE.CircleGeometry(0.34, 28), diaMat);
  geos.add(diaphragm.geometry);
  diaphragm.rotation.x = -Math.PI / 2.3;
  diaphragm.position.set(0, 0.32, 0.06);
  proxy.add(diaphragm);

  const liver = blob(0.2, material(0x8a4030, 0x3a140e, 0.18, 0.55), -0.2, 0.2, 0.12, 1.35, 0.7, 0.82);
  liver.rotation.z = 0.35;
  proxy.add(liver);
  const stomach = blob(0.13, material(0xd2b07a, 0x5a3a18, 0.16, 0.5), 0.16, 0.16, 0.16, 1.15, 0.85, 0.75);
  proxy.add(stomach);
  const spleen = blob(0.07, material(0x7a3d58, 0x301420, 0.16, 0.5), 0.28, 0.22, 0.02, 0.7, 1.1, 0.6);
  proxy.add(spleen);

  const gutMat = material(0xcbb58a, 0x4a3818, 0.12, 0.58);
  const gutPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 56; i += 1) {
    const t = i / 56;
    const a = t * Math.PI * 5.2;
    const rad = 0.2 - t * 0.08;
    gutPts.push(new THREE.Vector3(Math.cos(a) * rad, 0.02 - t * 0.4, 0.06 + Math.sin(a) * rad * 0.5));
  }
  const gutCurve = new THREE.CatmullRomCurve3(gutPts);
  const gut = new THREE.Mesh(new THREE.TubeGeometry(gutCurve, 80, 0.028, 6, false), gutMat);
  geos.add(gut.geometry);
  proxy.add(gut);
  const bolus = blob(0.045, material(0xf0d7a4, 0x6a4a20, 0.4, 0.4), 0, 0, 0, 1, 1, 1);
  proxy.add(bolus);
  const waveBalls: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i += 1) {
    const ball = blob(0.02, gutMat, 0, 0, 0, 1, 1, 1);
    waveBalls.push(ball);
    proxy.add(ball);
  }

  const kidneyMat = material(0x9a463c, 0x3d1614, 0.2, 0.5);
  const kidneyL = blob(0.09, kidneyMat, 0.16, 0.02, -0.14, 0.72, 1.15, 0.55);
  const kidneyR = blob(0.09, kidneyMat, -0.16, 0, -0.14, 0.72, 1.15, 0.55);
  kidneyL.rotation.z = -0.3;
  kidneyR.rotation.z = 0.3;
  proxy.add(kidneyL, kidneyR);
  const bladder = blob(0.09, material(0xd9cbb8, 0x4a4034, 0.15, 0.48), 0, -0.5, 0.1, 1.05, 0.8, 0.85);
  proxy.add(bladder);

  const flowPts = [
    new THREE.Vector3(0.12, 0.62, 0.2),
    new THREE.Vector3(0.06, 0.95, 0.12),
    new THREE.Vector3(0, 1.35, 0.06),
    new THREE.Vector3(0, 1.58, 0.02),
    new THREE.Vector3(-0.06, 1.3, 0.05),
    new THREE.Vector3(-0.08, 0.85, 0.04),
    new THREE.Vector3(-0.04, 0.4, 0.1),
    new THREE.Vector3(0.02, 0.05, 0.14),
    new THREE.Vector3(0.04, -0.35, 0.1),
    new THREE.Vector3(0.1, 0.15, 0.16),
    new THREE.Vector3(0.12, 0.5, 0.18),
  ];
  const flow = new THREE.CatmullRomCurve3(flowPts, true);
  const artery = new THREE.Mesh(new THREE.TubeGeometry(flow, 80, 0.012, 5, true), aortaMat);
  geos.add(artery.geometry);
  proxy.add(artery);
  const blood = makePoints(42, 0xff5a68, 3.4);
  proxy.add(blood.points);

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const camCenter = new THREE.Vector3();
  const camOffset = new THREE.Vector3();
  let yaw = 0.62;
  let pitch = 0.12;
  let dragging = false;
  let moved = false;
  let lastX = 0;
  let lastY = 0;
  let idle = 0;
  let pin = 0;
  let pinUntil = 0;
  let teachOn = false;
  let teachIndex = 0;
  let teachAt = 0;
  let viewAspect = 1;
  let elapsed = 0;
  let raf = 0;
  let stopped = false;
  let hudAt = 0;
  let atlas: AnatomyAtlas | null = null;
  let atlasPending = true;
  const ecg = new Float32Array(160);
  let ecgHead = 0;

  const paintTeach = () => {
    const lesson = LESSONS[teachIndex]!;
    root.classList.toggle("is-teaching", teachOn);
    if (teachBtn) teachBtn.textContent = teachOn ? "Cơ quan" : "Bài cơ xương";
    if (kicker) kicker.textContent = teachOn ? "Cơ xương khớp" : "Hệ cơ quan";
    if (card) card.hidden = !teachOn || root.getBoundingClientRect().height < 220;
    if (!teachOn) return;
    if (stepEl) stepEl.textContent = `${teachIndex + 1}/${LESSONS.length}`;
    if (titleEl) titleEl.textContent = lesson.title;
    if (hookEl) hookEl.textContent = lesson.hook;
    if (factEl) factEl.textContent = lesson.fact;
    if (tipEl) tipEl.textContent = lesson.tip;
    if (dotsEl) dotsEl.textContent = LESSONS.map((_, i) => (i === teachIndex ? "●" : "○")).join(" ");
  };

  const onTeach = (event: Event) => {
    event.stopPropagation();
    teachOn = !teachOn;
    teachIndex = 0;
    teachAt = elapsed;
    paintTeach();
    if (!teachOn) frame();
  };
  const onCard = () => {
    if (!teachOn) return;
    teachIndex = (teachIndex + 1) % LESSONS.length;
    teachAt = elapsed;
    paintTeach();
  };
  teachBtn?.addEventListener("click", onTeach);
  card?.addEventListener("click", onCard);

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    dragging = true;
    moved = false;
    lastX = event.clientX;
    lastY = event.clientY;
    try {
      glCanvas.setPointerCapture(event.pointerId);
    } catch {
      /* the drag still tracks the next move */
    }
  };
  const onMove = (event: PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    if (Math.hypot(dx, dy) > 5) moved = true;
    yaw += dx * 0.008;
    pitch = Math.max(-0.45, Math.min(0.55, pitch + dy * 0.005));
    lastX = event.clientX;
    lastY = event.clientY;
    idle = 0;
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    if (!moved) {
      if (teachOn) {
        teachIndex = (teachIndex + 1) % LESSONS.length;
        teachAt = elapsed;
        paintTeach();
      } else {
        pin = (pin + 1) % FOCUS.length;
        pinUntil = elapsed + 14;
      }
    }
  };
  glCanvas.addEventListener("pointerdown", onDown);
  glCanvas.addEventListener("pointermove", onMove);
  glCanvas.addEventListener("pointerup", onUp);
  glCanvas.addEventListener("pointercancel", onUp);

  const frame = () => {
    const rect = root.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const aspect = w / h;
    viewAspect = aspect;
    ecgCanvas.style.display = h < 180 ? "none" : "block";
    const hud = vitals.parentElement;
    if (hud) hud.style.display = h < 88 ? "none" : "";
    const credit = root.querySelector<HTMLElement>(".anatomy-credit");
    if (credit) credit.style.display = h < 120 ? "none" : "";
    if (card && teachOn) card.hidden = h < 220;
    if (!teachOn) {
      if (atlas) {
        if (aspect > 2.4) {
          camera.position.set(0.28, 0.04, 1.15);
          camera.lookAt(0, 0.02, 0);
          camera.fov = 26;
        } else if (aspect > 1.15) {
          camera.position.set(0.4, -0.1, 2.15);
          camera.lookAt(0, -0.12, 0);
          camera.fov = 28;
        } else {
          camera.position.set(0.55, -0.28, 3.55);
          camera.lookAt(0, -0.3, 0);
          camera.fov = 28;
        }
      } else if (aspect > 2.4) {
        camera.position.set(0.35, 0.55, 1.7);
        camera.lookAt(0.05, 0.5, 0);
        camera.fov = 34;
      } else if (aspect > 1.15) {
        camera.position.set(0.15, 0.42, 3.5);
        camera.lookAt(0, 0.4, 0);
        camera.fov = 30;
      } else {
        camera.position.set(0.05, 0.32, 4.15);
        camera.lookAt(0, 0.32, 0);
        camera.fov = 28;
      }
    }
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, atlas ? 1.25 : 1.5));
    renderer.setSize(w, h, false);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    ecgCanvas.width = Math.floor(w * dpr);
    ecgCanvas.height = Math.floor(42 * dpr);
  };
  const observer = new ResizeObserver(frame);
  observer.observe(root);
  frame();

  const drawEcg = (sample: number) => {
    ecg[ecgHead] = sample;
    ecgHead = (ecgHead + 1) % ecg.length;
    const ctx = ecgCanvas.getContext("2d");
    if (!ctx || ecgCanvas.style.display === "none") return;
    const w = ecgCanvas.width;
    const h = ecgCanvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(198,161,90,0.9)";
    ctx.lineWidth = Math.max(1, h * 0.04);
    for (let i = 0; i < ecg.length; i += 1) {
      const value = ecg[(ecgHead + i) % ecg.length] ?? 0;
      const x = (i / (ecg.length - 1)) * w;
      const y = h * 0.62 - value * h * 0.42;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const loop = () => {
    if (stopped) return;
    raf = window.requestAnimationFrame(loop);
    if (document.hidden) return;
    const dt = Math.min(0.05, clock.getDelta());
    elapsed += dt * (reduced ? 0.35 : 1);
    idle += dt;
    if (teachOn && !dragging && !reduced && elapsed - teachAt > 11) {
      teachIndex = (teachIndex + 1) % LESSONS.length;
      teachAt = elapsed;
      paintTeach();
    }
    const lesson = LESSONS[teachIndex]!;
    if (teachOn && !dragging && idle > 0.5) {
      const glide = Math.min(1, dt * 1.8);
      yaw += (lesson.yaw - yaw) * glide;
      pitch += (0.06 - pitch) * glide;
    } else if (!teachOn && !dragging && idle > 0.8 && !reduced) {
      yaw += dt * 0.28;
    }

    const heartPhase = elapsed * ((72 / 60) * Math.PI * 2);
    const beat = Math.pow(Math.max(0, Math.sin(heartPhase)), 10);
    const breathPhase = elapsed * ((15 / 60) * Math.PI * 2);
    const breath = 0.5 - 0.5 * Math.cos(breathPhase);
    const focus = elapsed < pinUntil ? FOCUS[pin]! : FOCUS[Math.floor(elapsed / 6) % FOCUS.length]!;
    pulseLight.intensity = 0.25 + 1.5 * beat;
    if (atlas) {
      atlas.pulse(beat, breath, focus, teachOn ? (lesson.region ?? "") : null);
    } else {
      heart.scale.setScalar(1 + 0.14 * beat);
      lungs.scale.set(1 + 0.05 * breath, 1 + 0.1 * breath, 1 + 0.07 * breath);
      diaphragm.position.y = 0.34 - 0.07 * breath;
      stomach.scale.set(1.15, 0.85 * (1 + 0.06 * Math.sin(elapsed * 0.8)), 0.75);
      bladder.scale.set(1.05, 0.72 + 0.16 * (0.5 + 0.5 * Math.sin(elapsed * 0.23)), 0.85);
      const hot = (system: System) => focus === "all" || focus === system;
      heartMat.emissiveIntensity = hot("tim") ? 0.35 + 0.9 * beat : 0.12;
      aortaMat.emissiveIntensity = hot("tim") ? 0.28 + 0.4 * beat : 0.08;
      lungMat.emissiveIntensity = hot("hohap") ? 0.18 + 0.35 * breath : 0.06;
      brainMat.emissiveIntensity = hot("thankinh") ? 0.3 + 0.25 * Math.sin(elapsed * 3) : 0.08;
      gutMat.emissiveIntensity = hot("tieuhoa") ? 0.22 : 0.06;
      kidneyMat.emissiveIntensity = hot("tietnieu") ? 0.2 + 0.15 * Math.sin(elapsed * 1.4) : 0.06;
      for (let i = 0; i < sparks.count; i += 1) {
        const u = (i * 0.173 + elapsed * 0.15) % 1;
        const phi = Math.acos(2 * ((i * 0.37) % 1) - 1);
        const theta = u * Math.PI * 2;
        const flash = Math.pow(Math.max(0, Math.sin(elapsed * 4 + i)), 8);
        tmp.set(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
        tmp.multiplyScalar(0.17 + flash * 0.03);
        sparks.attr.setXYZ(i, tmp.x, tmp.y, tmp.z);
      }
      sparks.attr.needsUpdate = true;
      gutCurve.getPointAt((elapsed * 0.08) % 1, tmp);
      bolus.position.copy(tmp);
      for (let i = 0; i < waveBalls.length; i += 1) {
        const u = (i / waveBalls.length + elapsed * 0.07) % 1;
        gutCurve.getPointAt(u, tmp);
        const ball = waveBalls[i]!;
        ball.position.copy(tmp);
        const squeeze = 1 + 0.7 * Math.pow(Math.max(0, Math.sin(elapsed * 3 - i * 0.55)), 2);
        ball.scale.setScalar(squeeze);
      }
      for (let i = 0; i < blood.count; i += 1) {
        flow.getPointAt((i / blood.count + elapsed * 0.09) % 1, tmp);
        blood.attr.setXYZ(i, tmp.x, tmp.y, tmp.z);
      }
      blood.attr.needsUpdate = true;
    }

    rig.rotation.y = yaw;
    rig.rotation.x = pitch;
    if (teachOn && atlas) {
      const framed = atlas.focusBox(LESSONS[teachIndex]!.region);
      if (framed) {
        rig.updateMatrix();
        camCenter.copy(framed.center).applyQuaternion(rig.quaternion);
        const fov = viewAspect > 2.4 ? 24 : 30;
        const fit = (framed.radius * 1.25) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
        const dist = Math.max(fit, viewAspect > 2.4 ? 0.7 : 0.95);
        camOffset.set(dist * 0.38, dist * 0.03, dist).applyQuaternion(rig.quaternion);
        camera.position.copy(camCenter).add(camOffset);
        camera.lookAt(camCenter);
        camera.fov = fov;
        camera.aspect = viewAspect;
        camera.updateProjectionMatrix();
      }
    }
    renderer.render(scene, camera);

    const qrs = ecgSample((heartPhase / (Math.PI * 2)) % 1);
    drawEcg(qrs);
    if (elapsed - hudAt > 0.25) {
      hudAt = elapsed;
      const hr = Math.round(70 + 4 * Math.sin(elapsed * 0.17) + beat * 2);
      const br = Math.round(14 + 2 * Math.sin(elapsed * 0.09));
      const current = LESSONS[teachIndex]!;
      vitals.textContent = teachOn
        ? `${teachIndex + 1}/${LESSONS.length} · ${current.hook}`
        : atlasPending
          ? "Đang nạp atlas giải phẫu"
          : `Tim ${hr} nhịp · Thở ${br} · ${FOCUS_LABEL[focus]}`;
    }
  };
  raf = window.requestAnimationFrame(loop);

  void loadAnatomyAtlas(() => stopped, (loaded) => {
    if (stopped) {
      loaded.dispose();
      return;
    }
    atlas = loaded;
    atlasPending = false;
    rig.add(loaded.root);
    proxy.visible = false;
    if (loaded.heart.children.length) {
      loaded.heart.add(pulseLight);
      pulseLight.position.set(0, 0.02, 0.08);
    } else {
      loaded.root.add(pulseLight);
      pulseLight.position.set(0.02, 1.28, 0.1);
    }
    if (teachBtn) teachBtn.hidden = false;
    frame();
    void loaded.loadMuscles(() => stopped).then(() => {
      if (!stopped) root.dataset.muscles = "1";
    });
  }).then((loaded) => {
    if (!loaded) atlasPending = false;
  });

  return {
    dispose() {
      stopped = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      glCanvas.removeEventListener("pointerdown", onDown);
      glCanvas.removeEventListener("pointermove", onMove);
      glCanvas.removeEventListener("pointerup", onUp);
      glCanvas.removeEventListener("pointercancel", onUp);
      teachBtn?.removeEventListener("click", onTeach);
      card?.removeEventListener("click", onCard);
      atlas?.dispose();
      for (const geo of geos) geo.dispose();
      for (const mat of mats) mat.dispose();
      renderer.dispose();
    },
  };

  function material(color: number, emissive: number, glow: number, roughness: number) {
    const mat = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: glow, roughness, metalness: 0.04 });
    mats.add(mat);
    return mat;
  }

  function blob(radius: number, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) {
    const geo = new THREE.SphereGeometry(radius, 28, 20);
    geos.add(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    return mesh;
  }

  function rib(y: number, rx: number, rz: number) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 18; i += 1) {
      const a = Math.PI * (0.12 + 0.76 * (i / 18));
      pts.push(new THREE.Vector3(Math.cos(a) * rx, y, -0.02 + Math.sin(a) * rz));
    }
    return vessel(pts, 0.011, bone);
  }

  function vessel(pts: THREE.Vector3[], radius: number, mat: THREE.Material) {
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, radius, 5, false);
    geos.add(geo);
    return new THREE.Mesh(geo, mat);
  }

  function makePoints(count: number, color: number, size: number) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geos.add(geo);
    const mat = new THREE.PointsMaterial({
      color,
      size,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    mats.add(mat);
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    return { points: new THREE.Points(geo, mat), attr, count };
  }
}

function displaceBrain(geo: THREE.BufferGeometry) {
  const pos = geo.getAttribute("position");
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos as THREE.BufferAttribute, i);
    const n = v.clone().normalize();
    const fold = Math.sin(n.x * 17) * Math.sin(n.y * 13) * Math.sin(n.z * 15) + 0.35 * Math.sin(n.x * 31 + n.y * 11);
    v.addScaledVector(n, 0.011 * fold);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
}

function ecgSample(x: number) {
  const bump = (center: number, width: number, amp: number) => amp * Math.exp(-((x - center) ** 2) / width);
  return bump(0.18, 0.0009, 0.15) + bump(0.32, 0.00012, -0.18) + bump(0.36, 0.00005, 1) + bump(0.42, 0.00018, -0.28) + bump(0.62, 0.0022, 0.26);
}

function mountFlat(canvas: HTMLCanvasElement, ecgCanvas: HTMLCanvasElement, vitals: HTMLElement) {
  let stopped = false;
  let raf = 0;
  const started = performance.now();
  const loop = (now: number) => {
    if (stopped) return;
    raf = window.requestAnimationFrame(loop);
    const t = (now - started) / 1000;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5;
    const cy = h * 0.46;
    const beat = Math.pow(Math.max(0, Math.sin(t * 7.5)), 10);
    const breath = 0.5 - 0.5 * Math.cos(t * 1.57);
    ctx.strokeStyle = "rgba(126,182,214,0.55)";
    ctx.lineWidth = Math.max(1, w * 0.004);
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.16, h * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    const organ = (x: number, y: number, rx: number, ry: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    organ(cx - w * 0.07, cy - h * 0.02, w * 0.055 * (1 + 0.08 * breath), h * 0.1 * (1 + 0.1 * breath), "#d08996");
    organ(cx + w * 0.07, cy - h * 0.01, w * 0.05 * (1 + 0.08 * breath), h * 0.09 * (1 + 0.1 * breath), "#c47d8b");
    organ(cx + w * 0.025, cy + h * 0.01, w * 0.035 * (1 + 0.16 * beat), h * 0.045 * (1 + 0.16 * beat), "#b21f33");
    organ(cx - w * 0.05, cy + h * 0.08, w * 0.05, h * 0.04, "#8a4030");
    organ(cx, cy - h * 0.28, w * 0.045, h * 0.04, "#e7c2ce");
    vitals.textContent = `Tim ${Math.round(70 + 4 * Math.sin(t * 0.17))} nhịp · Thở ${Math.round(14 + breath)} · Mô phỏng phẳng`;
    ecgCanvas.width = Math.floor(rect.width * dpr);
    ecgCanvas.height = Math.floor(42 * dpr);
    const eg = ecgCanvas.getContext("2d");
    if (!eg) return;
    eg.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    eg.strokeStyle = "rgba(198,161,90,0.9)";
    eg.beginPath();
    for (let i = 0; i < 120; i += 1) {
      const sample = ecgSample((i / 120 + t * 1.2) % 1);
      const x = (i / 119) * ecgCanvas.width;
      const y = ecgCanvas.height * 0.62 - sample * ecgCanvas.height * 0.4;
      if (i === 0) eg.moveTo(x, y);
      else eg.lineTo(x, y);
    }
    eg.stroke();
  };
  raf = window.requestAnimationFrame(loop);
  return {
    dispose() {
      stopped = true;
      window.cancelAnimationFrame(raf);
    },
  };
}
