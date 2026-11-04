import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { jointRegion, muscleRegion, type LessonRegion } from "@/lib/msk-lesson";

type Focus = "all" | "tim" | "hohap" | "thankinh" | "tieuhoa" | "tietnieu";
type System = Focus | "xuong" | "nen";

type Surface = {
  mat: THREE.MeshStandardMaterial;
  base: THREE.Color;
  system: System;
};

const FILES: Array<{ file: string; kind: "organs" | "skeleton" | "vessels" | "nerves" }> = [
  { file: "organs.glb", kind: "organs" },
  { file: "skeleton.glb", kind: "skeleton" },
  { file: "vessels.glb", kind: "vessels" },
  { file: "nerves.glb", kind: "nerves" },
];

export type FocusFrame = { center: THREE.Vector3; radius: number };

export type AnatomyAtlas = {
  root: THREE.Group;
  heart: THREE.Group;
  lungs: THREE.Group;
  /** lesson null = cơ quan. "" = bài chìa khóa, chỉ xương. Khác rỗng = vùng cơ khớp. */
  pulse: (beat: number, breath: number, focus: Focus, lesson: LessonRegion | "" | null) => void;
  focusBox: (region: LessonRegion | null) => FocusFrame | null;
  loadMuscles: (cancelled: () => boolean) => Promise<void>;
  dispose: () => void;
};

export async function loadAnatomyAtlas(
  cancelled: () => boolean,
  onVisible?: (atlas: AnatomyAtlas) => void,
): Promise<AnatomyAtlas | null> {
  const loader = new GLTFLoader();
  const root = new THREE.Group();
  root.position.set(0, -1.15, 0);
  const heart = new THREE.Group();
  const lungs = new THREE.Group();
  const periVessels = new THREE.Group();
  const periNerves = new THREE.Group();
  const viscera = new THREE.Group();
  periVessels.visible = false;
  periNerves.visible = false;
  root.add(heart, lungs, periVessels, periNerves, viscera);
  const regions = new Map<LessonRegion, THREE.Group>();
  const frames = new Map<LessonRegion, FocusFrame>();
  let boneFrame: FocusFrame | null = null;
  let lessonNow: LessonRegion | "" | null = null;

  const materials: THREE.Material[] = [];
  const palette = new Map<number, THREE.MeshStandardMaterial>();
  const surfaces: Surface[] = [];
  const noted = new Set<THREE.MeshStandardMaterial>();

  const paint = (color: number, emissive: number) => {
    let mat = palette.get(color);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.08,
        roughness: 0.48,
        metalness: 0.04,
        side: THREE.DoubleSide,
      });
      palette.set(color, mat);
      materials.push(mat);
    }
    return mat;
  };

  const heartMat = paint(0x9a2430, 0x4a1018);
  const arteryMat = paint(0xc44752, 0x5a1820);
  const veinMat = paint(0x3e5688, 0x1a2748);
  const lungMat = paint(0xd08996, 0x5a3038);
  const airwayMat = paint(0xd5c6be, 0x4a403c);
  const liverMat = paint(0x7a3a2c, 0x3a140e);
  const gutMat = paint(0xc9a36a, 0x4a3818);
  const kidneyMat = paint(0x9a463c, 0x3d1614);
  const brainMat = paint(0xe4c0cc, 0x5a3044);
  const nerveMat = paint(0xe6d39a, 0x4a3c18);
  const boneMat = paint(0xe4ddd2, 0x3a3834);
  const vaultMat = paint(0xe7e2da, 0x3a3834);
  vaultMat.transparent = true;
  vaultMat.opacity = 0.14;
  vaultMat.depthWrite = false;
  const otherMat = paint(0xc4a090, 0x3a2824);
  const muscleMat = paint(0x9c403c, 0x3a1414);
  muscleMat.roughness = 0.62;
  const jointMat = paint(0xd7b15a, 0x6a4a10);
  jointMat.emissiveIntensity = 0.42;
  jointMat.roughness = 0.4;
  let shown: Focus | "" = "";

  const note = (mat: THREE.MeshStandardMaterial, system: System) => {
    if (noted.has(mat)) return;
    noted.add(mat);
    surfaces.push({ mat, base: mat.color.clone(), system });
    shown = "";
  };

  const styleOf = (kind: string, name: string) => {
    const n = name.toLowerCase();
    if (kind === "skeleton") {
      const vault = /frontal bone|parietal bone|occipital bone|temporal bone|sphenoid bone/.test(n);
      return { mat: vault ? vaultMat : boneMat, system: "xuong" as const, gate: "always" as const, pivot: "" };
    }
    if (kind === "vessels") {
      const onHeart = /ventricle|atrium|papillary|coronary/.test(n);
      const vein = /vein|vena|sinus/.test(n);
      const core = onHeart || /aorta|vena cava|pulmonary trunk|pulmonary artery|pulmonary vein/.test(n);
      return {
        mat: onHeart && !vein ? heartMat : vein ? veinMat : arteryMat,
        system: "tim" as const,
        gate: core ? ("always" as const) : ("tim" as const),
        pivot: onHeart ? "heart" : "",
      };
    }
    if (kind === "nerves") {
      const brain = /gyrus|insula|thalamus|hypothalamus|cerebell|midbrain|pons|medulla|corpus callosum|ventricle|aqueduct|falx|tentorium/.test(n);
      return {
        mat: brain ? brainMat : nerveMat,
        system: "thankinh" as const,
        gate: brain ? ("always" as const) : ("thankinh" as const),
        pivot: "",
      };
    }
    const lobe = /lobe of (left|right) lung/.test(n);
    if (lobe || /lung|trachea|bronchus/.test(n)) {
      return { mat: lobe ? lungMat : airwayMat, system: "hohap" as const, gate: "always" as const, pivot: lobe ? "lungs" : "" };
    }
    if (/liver/.test(n)) return { mat: liverMat, system: "tieuhoa" as const, gate: "always" as const, pivot: "" };
    if (/stomach|colon|jejunum|duodenum|ileum|pancreas|gallbladder|oesophagus|appendix|rectum|spleen|mesocolon/.test(n)) {
      return { mat: gutMat, system: "tieuhoa" as const, gate: "always" as const, pivot: "" };
    }
    if (/kidney|bladder|ureter|urethra/.test(n)) {
      return { mat: kidneyMat, system: "tietnieu" as const, gate: "always" as const, pivot: "" };
    }
    return { mat: otherMat, system: "nen" as const, gate: "always" as const, pivot: "" };
  };

  const dim = (focus: Focus) => {
    periVessels.visible = focus === "tim";
    periNerves.visible = focus === "thankinh";
    if (focus === shown) return;
    shown = focus;
    for (const item of surfaces) {
      const hot = focus === "all" || item.system === focus;
      const scale = hot ? 1 : item.system === "xuong" ? 0.62 : 0.4;
      item.mat.color.copy(item.base).multiplyScalar(scale);
    }
  };

  const applyLesson = (lesson: LessonRegion | "" | null) => {
    if (lesson === lessonNow) return;
    lessonNow = lesson;
    const teaching = lesson !== null;
    viscera.visible = !teaching;
    heart.visible = !teaching;
    lungs.visible = !teaching;
    if (teaching) {
      periVessels.visible = false;
      periNerves.visible = false;
      for (const [id, group] of regions) group.visible = id === lesson;
      shown = "";
      dim("all");
    } else {
      for (const group of regions.values()) group.visible = false;
      shown = "";
    }
  };

  let handed = false;
  const dispose = () => {
    const seen = new Set<THREE.BufferGeometry>();
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry || seen.has(mesh.geometry)) return;
      seen.add(mesh.geometry);
      mesh.geometry.dispose();
    });
    for (const mat of materials) mat.dispose();
  };

  const api: AnatomyAtlas = {
    root,
    heart,
    lungs,
    pulse(beat, breath, focus, lesson) {
      applyLesson(lesson);
      if (lesson !== null) return;
      dim(focus);
      heart.scale.setScalar(1 + 0.045 * beat);
      lungs.scale.set(1 + 0.028 * breath, 1 + 0.04 * breath, 1 + 0.028 * breath);
      heartMat.emissiveIntensity = focus === "all" || focus === "tim" ? 0.1 + 0.5 * beat : 0.04;
      lungMat.emissiveIntensity = focus === "all" || focus === "hohap" ? 0.06 + 0.18 * breath : 0.03;
      brainMat.emissiveIntensity = focus === "thankinh" ? 0.16 : 0.05;
    },
    focusBox(region) {
      if (region) return frames.get(region) ?? boneFrame;
      return boneFrame;
    },
    async loadMuscles(cancelled) {
      await ingestLesson("muscles.glb", "muscle", cancelled);
      if (cancelled()) return;
      await ingestLesson("joints.glb", "joint", cancelled);
    },
    dispose,
  };

  const reveal = () => {
    if (handed || cancelled()) return;
    handed = true;
    dim("all");
    onVisible?.(api);
  };

  for (const entry of FILES) {
    if (cancelled()) {
      if (!handed) dispose();
      return null;
    }
    const ok = await ingest(entry.kind, entry.file);
    if (entry.kind === "organs" && !ok) {
      dispose();
      return null;
    }
    if (entry.kind === "vessels") reveal();
  }

  rememberBones();

  if (cancelled()) return handed ? api : null;
  if (!handed) reveal();
  return api;

  async function ingest(kind: (typeof FILES)[number]["kind"], file: string) {
    let gltf: { scene: THREE.Group };
    try {
      gltf = await loader.loadAsync(`/anatomy/${file}`);
    } catch {
      return false;
    }
    if (cancelled()) return false;

    root.add(gltf.scene);
    root.updateMatrixWorld(true);

    const heartBatches = new Map<THREE.MeshStandardMaterial, THREE.Mesh[]>();
    const lungList: THREE.Mesh[] = [];
    const buckets = new Map<string, { mat: THREE.MeshStandardMaterial; meshes: THREE.Mesh[]; gate: "always" | "tim" | "thankinh"; system: System }>();
    const ownedGeo = new Set<THREE.BufferGeometry>();
    const ownedMat = new Set<THREE.Material>();

    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      ownedGeo.add(mesh.geometry);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) if (mat) ownedMat.add(mat);
      const name = mesh.name || String(mesh.userData?.name || mesh.parent?.name || "");
      const style = styleOf(kind, name);
      if (style.pivot === "heart") {
        const list = heartBatches.get(style.mat) ?? [];
        list.push(mesh);
        heartBatches.set(style.mat, list);
        return;
      }
      if (style.pivot === "lungs") {
        lungList.push(mesh);
        return;
      }
      const key = `${style.gate}:${style.mat.uuid}`;
      const bucket = buckets.get(key) ?? { mat: style.mat, meshes: [], gate: style.gate, system: style.system };
      bucket.meshes.push(mesh);
      buckets.set(key, bucket);
    });

    if (heartBatches.size) {
      mountPivot(
        heart,
        [...heartBatches.entries()].map(([mat, meshes]) => ({ mat, meshes })),
        root,
      );
      for (const mat of heartBatches.keys()) note(mat, "tim");
    }
    if (lungList.length) {
      mountPivot(lungs, [{ mat: lungMat, meshes: lungList }], root);
      note(lungMat, "hohap");
    }

    for (const bucket of buckets.values()) {
      const merged = mergedMesh(bucket.meshes, bucket.mat, root);
      if (!merged) continue;
      note(bucket.mat, bucket.system);
      if (bucket.gate === "tim") periVessels.add(merged);
      else if (bucket.gate === "thankinh") periNerves.add(merged);
      else if (bucket.system === "xuong") root.add(merged);
      else viscera.add(merged);
    }

    root.remove(gltf.scene);
    for (const geo of ownedGeo) geo.dispose();
    for (const mat of ownedMat) mat.dispose();
    return true;
  }

  function packFrame(box: THREE.Box3): FocusFrame {
    const size = box.getSize(new THREE.Vector3());
    return {
      center: box.getCenter(new THREE.Vector3()),
      radius: Math.max(0.05, 0.5 * Math.max(size.x, size.y, size.z)),
    };
  }

  function rememberBones() {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3();
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (mesh.material !== boneMat && mesh.material !== vaultMat) return;
      box.expandByObject(mesh);
    });
    if (!box.isEmpty()) boneFrame = packFrame(box);
  }

  async function ingestLesson(file: string, kind: "muscle" | "joint", stop: () => boolean) {
    if (stop()) return;
    let gltf: { scene: THREE.Group };
    try {
      gltf = await loader.loadAsync(`/anatomy/${file}`);
    } catch {
      return;
    }
    if (stop()) return;
    root.add(gltf.scene);
    root.updateMatrixWorld(true);
    const all = new Map<LessonRegion, THREE.Mesh[]>();
    const sided = new Map<LessonRegion, THREE.Mesh[]>();
    const ownedGeo = new Set<THREE.BufferGeometry>();
    const ownedMat = new Set<THREE.Material>();
    const classify = kind === "muscle" ? muscleRegion : jointRegion;
    const mat = kind === "muscle" ? muscleMat : jointMat;
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      ownedGeo.add(mesh.geometry);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const item of mats) if (item) ownedMat.add(item);
      const name = mesh.name || String(mesh.userData?.name || mesh.parent?.name || "");
      const region = classify(name);
      if (!region) return;
      const list = all.get(region) ?? [];
      list.push(mesh);
      all.set(region, list);
      if (new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3()).x >= -0.02) {
        const half = sided.get(region) ?? [];
        half.push(mesh);
        sided.set(region, half);
      }
    });
    for (const [region, meshes] of all) {
      const half = sided.get(region);
      const use = half && half.length ? half : meshes;
      let group = regions.get(region);
      if (!group) {
        group = new THREE.Group();
        group.visible = lessonNow === region;
        regions.set(region, group);
        root.add(group);
      }
      const merged = mergedMesh(use, mat, root);
      if (merged) group.add(merged);
    }
    root.remove(gltf.scene);
    for (const geo of ownedGeo) geo.dispose();
    for (const item of ownedMat) item.dispose();
    root.updateMatrixWorld(true);
    for (const [region, group] of regions) {
      if (!group.children.length) continue;
      const box = new THREE.Box3().setFromObject(group);
      if (!box.isEmpty()) frames.set(region, packFrame(box));
    }
  }
}

function mergedMesh(meshes: THREE.Mesh[], material: THREE.Material, space: THREE.Object3D) {
  if (!meshes.length) return null;
  space.updateWorldMatrix(true, false);
  const inv = new THREE.Matrix4().copy(space.matrixWorld).invert();
  const parts: THREE.BufferGeometry[] = [];
  for (const mesh of meshes) {
    const geo = mesh.geometry.clone();
    for (const key of Object.keys(geo.attributes)) {
      if (key !== "position" && key !== "normal") geo.deleteAttribute(key);
    }
    geo.applyMatrix4(mesh.matrixWorld).applyMatrix4(inv);
    parts.push(geo);
  }
  const merged = mergeGeometries(parts, false);
  for (const part of parts) part.dispose();
  if (!merged) return null;
  merged.computeBoundingSphere();
  const out = new THREE.Mesh(merged, material);
  out.castShadow = false;
  out.receiveShadow = false;
  return out;
}

function mountPivot(
  group: THREE.Group,
  batches: Array<{ mat: THREE.Material; meshes: THREE.Mesh[] }>,
  space: THREE.Object3D,
) {
  const box = new THREE.Box3();
  for (const batch of batches) for (const mesh of batch.meshes) box.expandByObject(mesh);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  space.worldToLocal(center);
  group.position.copy(center);
  const shift = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z);
  for (const batch of batches) {
    const mesh = mergedMesh(batch.meshes, batch.mat, space);
    if (!mesh) continue;
    mesh.geometry.applyMatrix4(shift);
    mesh.geometry.computeBoundingSphere();
    group.add(mesh);
  }
}
