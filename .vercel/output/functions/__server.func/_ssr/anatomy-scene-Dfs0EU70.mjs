import { A as WebGLRenderer, C as PointsMaterial, D as TubeGeometry, E as SphereGeometry, O as Vector2, S as Points, T as Scene, _ as Mesh, a as BufferGeometry, b as PerspectiveCamera, c as Clock, d as Group, f as HemisphereLight, g as Matrix4, h as MathUtils, i as BufferAttribute, k as Vector3, l as CylinderGeometry, m as LatheGeometry, n as mergeGeometries, o as CatmullRomCurve3, p as IcosahedronGeometry, r as Box3, s as CircleGeometry, t as GLTFLoader, u as DirectionalLight, v as MeshBasicMaterial, w as SRGBColorSpace, x as PointLight, y as MeshStandardMaterial } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/anatomy-scene-Dfs0EU70.js
var LESSONS = [
	{
		title: "Chìa khóa",
		region: null,
		hook: "Khung · Bản lề · Dây kéo",
		fact: "Xương chịu lực. Khớp cho chuyển động. Cơ kéo xương.",
		tip: "Mỗi vùng chỉ hỏi ba câu: xương nào, khớp nào, cơ nào.",
		yaw: .45
	},
	{
		title: "Cột sống",
		region: "spine",
		hook: "7 cổ · 12 ngực · 5 lưng",
		fact: "Đĩa đệm là miếng đệm giữa các đốt. Cơ dựng sống giữ người thẳng.",
		tip: "Nhấc đồ thì hạ gối, lưng thẳng. Không vừa cúi vừa xoay.",
		yaw: .85
	},
	{
		title: "Vai",
		region: "shoulder",
		hook: "Vai rộng nhưng lỏng",
		fact: "Khớp cầu, cử động nhiều nhất. Cơ delta nâng tay. Chóp xoay giữ khớp.",
		tip: "Khuân quá đầu dễ làm lỏng vai. Khuỷu thấp hơn vai thì an toàn hơn.",
		yaw: 1.05
	},
	{
		title: "Khuỷu",
		region: "elbow",
		hook: "Khuỷu chỉ gấp, cẳng tay mới xoay",
		fact: "Khuỷu là bản lề. Sấp ngửa là xương quay xoay trên xương trụ.",
		tip: "Đau mặt ngoài khi vặn vít hay bê xô: nghỉ đúng động tác đó.",
		yaw: 1.15
	},
	{
		title: "Háng",
		region: "hip",
		hook: "Háng chịu cả người",
		fact: "Khớp cầu. Cơ mông duỗi háng. Cơ thắt lưng-chậu đưa đùi lên.",
		tip: "Đau bẹn lúc bước dài thì bước ngắn lại, đừng ép dạng mạnh.",
		yaw: .7
	},
	{
		title: "Gối",
		region: "knee",
		hook: "Bản lề, có đệm, có dây",
		fact: "Sụn chêm là đệm. Dây chằng chéo giữ khớp không trượt trước sau.",
		tip: "Bàn chân đang bám đất thì đừng xoay người. Dễ rách đệm hoặc dây.",
		yaw: .55
	},
	{
		title: "Cổ chân",
		region: "ankle",
		hook: "Hay lật vào trong",
		fact: "Mắt cá ngoài xuống thấp hơn, nên chân hay lật vào trong và đau phía ngoài.",
		tip: "Đường gồ ghề thì nhìn xuống. Lật rồi thì nghỉ và kê cao chân.",
		yaw: .6
	}
];
function muscleRegion(name) {
	const n = name.toLowerCase();
	if (/iliocostalis|longissimus|spinalis|multifidus|semispinalis|splenius|rotatores|quadratus lumborum|sternocleidomastoid/.test(n)) return "spine";
	if (/coracobrachialis|deltoid|supraspinatus|infraspinatus|subscapularis|teres minor|teres major/.test(n)) return "shoulder";
	if (/biceps brachii|triceps brachii|brachialis|brachioradialis|anconeus/.test(n)) return "elbow";
	if (/gluteus|iliacus|psoas major|piriformis|gemellus/.test(n)) return "hip";
	if (/rectus femoris|vastus |biceps femoris|semimembranosus|semitendinosus|popliteus/.test(n)) return "knee";
	if (/gastrocnemius|soleus|plantaris|calcaneal tendon|tibialis anterior|tibialis posterior|fibularis /.test(n)) return "ankle";
	return null;
}
function jointRegion(name) {
	const n = name.toLowerCase();
	if (/wrist|carpal|metacarpal|phalan|radiocarpal|hand/.test(n)) return null;
	if (/intervertebral disc|nucleus pulposus|longitudinal ligament|ligamenta flava|supraspinous|nuchal ligament|interspinous ligament/.test(n)) return "spine";
	if (/glenohumeral|glenoid|coracohumeral/.test(n)) return "shoulder";
	if (/elbow|annular ligament of radius|quadrate ligament|ulnar collateral ligament$|radial collateral ligament$/.test(n)) return "elbow";
	if (/hip joint|iliofemoral|pubofemoral|ischiofemoral|acetabular/.test(n)) return "hip";
	if (/cruciate|menisc|knee|patellar|tibial collateral|fibular collateral|popliteal ligament/.test(n)) return "knee";
	if (/talofibular|calcaneofibular|tibiotalar|tibionavicular|tibiocalcaneal/.test(n)) return "ankle";
	return null;
}
var FILES = [
	{
		file: "organs.glb",
		kind: "organs"
	},
	{
		file: "skeleton.glb",
		kind: "skeleton"
	},
	{
		file: "vessels.glb",
		kind: "vessels"
	},
	{
		file: "nerves.glb",
		kind: "nerves"
	}
];
async function loadAnatomyAtlas(cancelled, onVisible) {
	const loader = new GLTFLoader();
	const root = new Group();
	root.position.set(0, -1.15, 0);
	const heart = new Group();
	const lungs = new Group();
	const periVessels = new Group();
	const periNerves = new Group();
	const viscera = new Group();
	periVessels.visible = false;
	periNerves.visible = false;
	root.add(heart, lungs, periVessels, periNerves, viscera);
	const regions = /* @__PURE__ */ new Map();
	const frames = /* @__PURE__ */ new Map();
	let boneFrame = null;
	let lessonNow = null;
	const materials = [];
	const palette = /* @__PURE__ */ new Map();
	const surfaces = [];
	const noted = /* @__PURE__ */ new Set();
	const paint = (color, emissive) => {
		let mat = palette.get(color);
		if (!mat) {
			mat = new MeshStandardMaterial({
				color,
				emissive,
				emissiveIntensity: .08,
				roughness: .48,
				metalness: .04,
				side: 2
			});
			palette.set(color, mat);
			materials.push(mat);
		}
		return mat;
	};
	const heartMat = paint(10101808, 4853784);
	const arteryMat = paint(12863314, 5904416);
	const veinMat = paint(4085384, 1713992);
	const lungMat = paint(13666710, 5910584);
	const airwayMat = paint(14010046, 4866108);
	const liverMat = paint(8010284, 3806222);
	const gutMat = paint(13214570, 4864024);
	const kidneyMat = paint(10110524, 4003348);
	const brainMat = paint(14991564, 5910596);
	const nerveMat = paint(15127450, 4865048);
	const boneMat = paint(14998994, 3815476);
	const vaultMat = paint(15196890, 3815476);
	vaultMat.transparent = true;
	vaultMat.opacity = .14;
	vaultMat.depthWrite = false;
	const otherMat = paint(12886160, 3811364);
	const muscleMat = paint(10240060, 3806228);
	muscleMat.roughness = .62;
	const jointMat = paint(14135642, 6965776);
	jointMat.emissiveIntensity = .42;
	jointMat.roughness = .4;
	let shown = "";
	const note = (mat, system) => {
		if (noted.has(mat)) return;
		noted.add(mat);
		surfaces.push({
			mat,
			base: mat.color.clone(),
			system
		});
		shown = "";
	};
	const styleOf = (kind, name) => {
		const n = name.toLowerCase();
		if (kind === "skeleton") return {
			mat: /frontal bone|parietal bone|occipital bone|temporal bone|sphenoid bone/.test(n) ? vaultMat : boneMat,
			system: "xuong",
			gate: "always",
			pivot: ""
		};
		if (kind === "vessels") {
			const onHeart = /ventricle|atrium|papillary|coronary/.test(n);
			const vein = /vein|vena|sinus/.test(n);
			const core = onHeart || /aorta|vena cava|pulmonary trunk|pulmonary artery|pulmonary vein/.test(n);
			return {
				mat: onHeart && !vein ? heartMat : vein ? veinMat : arteryMat,
				system: "tim",
				gate: core ? "always" : "tim",
				pivot: onHeart ? "heart" : ""
			};
		}
		if (kind === "nerves") {
			const brain = /gyrus|insula|thalamus|hypothalamus|cerebell|midbrain|pons|medulla|corpus callosum|ventricle|aqueduct|falx|tentorium/.test(n);
			return {
				mat: brain ? brainMat : nerveMat,
				system: "thankinh",
				gate: brain ? "always" : "thankinh",
				pivot: ""
			};
		}
		const lobe = /lobe of (left|right) lung/.test(n);
		if (lobe || /lung|trachea|bronchus/.test(n)) return {
			mat: lobe ? lungMat : airwayMat,
			system: "hohap",
			gate: "always",
			pivot: lobe ? "lungs" : ""
		};
		if (/liver/.test(n)) return {
			mat: liverMat,
			system: "tieuhoa",
			gate: "always",
			pivot: ""
		};
		if (/stomach|colon|jejunum|duodenum|ileum|pancreas|gallbladder|oesophagus|appendix|rectum|spleen|mesocolon/.test(n)) return {
			mat: gutMat,
			system: "tieuhoa",
			gate: "always",
			pivot: ""
		};
		if (/kidney|bladder|ureter|urethra/.test(n)) return {
			mat: kidneyMat,
			system: "tietnieu",
			gate: "always",
			pivot: ""
		};
		return {
			mat: otherMat,
			system: "nen",
			gate: "always",
			pivot: ""
		};
	};
	const dim = (focus) => {
		periVessels.visible = focus === "tim";
		periNerves.visible = focus === "thankinh";
		if (focus === shown) return;
		shown = focus;
		for (const item of surfaces) {
			const scale = focus === "all" || item.system === focus ? 1 : item.system === "xuong" ? .62 : .4;
			item.mat.color.copy(item.base).multiplyScalar(scale);
		}
	};
	const applyLesson = (lesson) => {
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
		const seen = /* @__PURE__ */ new Set();
		root.traverse((obj) => {
			const mesh = obj;
			if (!mesh.isMesh || !mesh.geometry || seen.has(mesh.geometry)) return;
			seen.add(mesh.geometry);
			mesh.geometry.dispose();
		});
		for (const mat of materials) mat.dispose();
	};
	const api = {
		root,
		heart,
		lungs,
		pulse(beat, breath, focus, lesson) {
			applyLesson(lesson);
			if (lesson !== null) return;
			dim(focus);
			heart.scale.setScalar(1 + .045 * beat);
			lungs.scale.set(1 + .028 * breath, 1 + .04 * breath, 1 + .028 * breath);
			heartMat.emissiveIntensity = focus === "all" || focus === "tim" ? .1 + .5 * beat : .04;
			lungMat.emissiveIntensity = focus === "all" || focus === "hohap" ? .06 + .18 * breath : .03;
			brainMat.emissiveIntensity = focus === "thankinh" ? .16 : .05;
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
		dispose
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
	async function ingest(kind, file) {
		let gltf;
		try {
			gltf = await loader.loadAsync(`/anatomy/${file}`);
		} catch {
			return false;
		}
		if (cancelled()) return false;
		root.add(gltf.scene);
		root.updateMatrixWorld(true);
		const heartBatches = /* @__PURE__ */ new Map();
		const lungList = [];
		const buckets = /* @__PURE__ */ new Map();
		const ownedGeo = /* @__PURE__ */ new Set();
		const ownedMat = /* @__PURE__ */ new Set();
		gltf.scene.traverse((obj) => {
			const mesh = obj;
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
			const bucket = buckets.get(key) ?? {
				mat: style.mat,
				meshes: [],
				gate: style.gate,
				system: style.system
			};
			bucket.meshes.push(mesh);
			buckets.set(key, bucket);
		});
		if (heartBatches.size) {
			mountPivot(heart, [...heartBatches.entries()].map(([mat, meshes]) => ({
				mat,
				meshes
			})), root);
			for (const mat of heartBatches.keys()) note(mat, "tim");
		}
		if (lungList.length) {
			mountPivot(lungs, [{
				mat: lungMat,
				meshes: lungList
			}], root);
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
	function packFrame(box) {
		const size = box.getSize(new Vector3());
		return {
			center: box.getCenter(new Vector3()),
			radius: Math.max(.05, .5 * Math.max(size.x, size.y, size.z))
		};
	}
	function rememberBones() {
		root.updateMatrixWorld(true);
		const box = new Box3();
		root.traverse((obj) => {
			const mesh = obj;
			if (!mesh.isMesh) return;
			if (mesh.material !== boneMat && mesh.material !== vaultMat) return;
			box.expandByObject(mesh);
		});
		if (!box.isEmpty()) boneFrame = packFrame(box);
	}
	async function ingestLesson(file, kind, stop) {
		if (stop()) return;
		let gltf;
		try {
			gltf = await loader.loadAsync(`/anatomy/${file}`);
		} catch {
			return;
		}
		if (stop()) return;
		root.add(gltf.scene);
		root.updateMatrixWorld(true);
		const all = /* @__PURE__ */ new Map();
		const sided = /* @__PURE__ */ new Map();
		const ownedGeo = /* @__PURE__ */ new Set();
		const ownedMat = /* @__PURE__ */ new Set();
		const classify = kind === "muscle" ? muscleRegion : jointRegion;
		const mat = kind === "muscle" ? muscleMat : jointMat;
		gltf.scene.traverse((obj) => {
			const mesh = obj;
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
			if (new Box3().setFromObject(mesh).getCenter(new Vector3()).x >= -.02) {
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
				group = new Group();
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
			const box = new Box3().setFromObject(group);
			if (!box.isEmpty()) frames.set(region, packFrame(box));
		}
	}
}
function mergedMesh(meshes, material, space) {
	if (!meshes.length) return null;
	space.updateWorldMatrix(true, false);
	const inv = new Matrix4().copy(space.matrixWorld).invert();
	const parts = [];
	for (const mesh of meshes) {
		const geo = mesh.geometry.clone();
		for (const key of Object.keys(geo.attributes)) if (key !== "position" && key !== "normal") geo.deleteAttribute(key);
		geo.applyMatrix4(mesh.matrixWorld).applyMatrix4(inv);
		parts.push(geo);
	}
	const merged = mergeGeometries(parts, false);
	for (const part of parts) part.dispose();
	if (!merged) return null;
	merged.computeBoundingSphere();
	const out = new Mesh(merged, material);
	out.castShadow = false;
	out.receiveShadow = false;
	return out;
}
function mountPivot(group, batches, space) {
	const box = new Box3();
	for (const batch of batches) for (const mesh of batch.meshes) box.expandByObject(mesh);
	if (box.isEmpty()) return;
	const center = box.getCenter(new Vector3());
	space.worldToLocal(center);
	group.position.copy(center);
	const shift = new Matrix4().makeTranslation(-center.x, -center.y, -center.z);
	for (const batch of batches) {
		const mesh = mergedMesh(batch.meshes, batch.mat, space);
		if (!mesh) continue;
		mesh.geometry.applyMatrix4(shift);
		mesh.geometry.computeBoundingSphere();
		group.add(mesh);
	}
}
var FOCUS = [
	"all",
	"tim",
	"hohap",
	"thankinh",
	"tieuhoa",
	"tietnieu"
];
var FOCUS_LABEL = {
	all: "Đủ hệ",
	tim: "Tim mạch",
	hohap: "Hô hấp",
	thankinh: "Thần kinh",
	tieuhoa: "Tiêu hóa",
	tietnieu: "Tiết niệu"
};
function mountAnatomy(root) {
	const glCanvas = root.querySelector(".anatomy-gl");
	const ecgCanvas = root.querySelector(".anatomy-ecg");
	const vitals = root.querySelector("[data-vitals]");
	const teachBtn = root.querySelector("[data-teach]");
	const card = root.querySelector("[data-card]");
	const kicker = root.querySelector("[data-kicker]");
	const stepEl = root.querySelector("[data-step]");
	const titleEl = root.querySelector("[data-title]");
	const hookEl = root.querySelector("[data-hook]");
	const factEl = root.querySelector("[data-fact]");
	const tipEl = root.querySelector("[data-tip]");
	const dotsEl = root.querySelector("[data-dots]");
	if (!glCanvas || !ecgCanvas || !vitals) return { dispose() {} };
	let renderer = null;
	try {
		renderer = new WebGLRenderer({
			canvas: glCanvas,
			alpha: true,
			antialias: true,
			powerPreference: "default"
		});
	} catch {
		renderer = null;
	}
	if (!renderer || !renderer.getContext()) return mountFlat(glCanvas, ecgCanvas, vitals);
	renderer.setClearColor(0, 0);
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = 4;
	renderer.toneMappingExposure = 1.12;
	const scene = new Scene();
	const camera = new PerspectiveCamera(30, 1, .08, 40);
	const rig = new Group();
	const proxy = new Group();
	scene.add(rig);
	rig.add(proxy);
	const geos = /* @__PURE__ */ new Set();
	const mats = /* @__PURE__ */ new Set();
	const bone = material(14275528, 2763304, .12, .62);
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	scene.add(new HemisphereLight(14017781, 1708558, .55));
	const key = new DirectionalLight(16774376, 1.45);
	key.position.set(2.4, 3.2, 4);
	scene.add(key);
	const rim = new DirectionalLight(10473727, .7);
	rim.position.set(-3.2, 1.4, -2.2);
	scene.add(rim);
	const pulseLight = new PointLight(16729176, .6, 3.2, 1.4);
	pulseLight.position.set(.12, .58, .3);
	rig.add(pulseLight);
	const profile = [
		[.02, 1.78],
		[.16, 1.72],
		[.21, 1.56],
		[.17, 1.44],
		[.1, 1.3],
		[.26, 1.16],
		[.42, 1.02],
		[.4, .72],
		[.34, .4],
		[.3, .08],
		[.34, -.22],
		[.36, -.48],
		[.22, -.78],
		[.04, -.9]
	].map(([x, y]) => new Vector2(x, y));
	const shellGeo = new LatheGeometry(profile, 40);
	geos.add(shellGeo);
	const shellMat = new MeshStandardMaterial({
		color: 9351110,
		transparent: true,
		opacity: .07,
		roughness: .15,
		metalness: 0,
		depthWrite: false
	});
	mats.add(shellMat);
	const wireMat = new MeshBasicMaterial({
		color: 8304342,
		wireframe: true,
		transparent: true,
		opacity: .16,
		depthWrite: false
	});
	mats.add(wireMat);
	proxy.add(new Mesh(shellGeo, shellMat), new Mesh(shellGeo, wireMat));
	const vertGeo = new CylinderGeometry(.032, .036, .05, 8);
	geos.add(vertGeo);
	for (let i = 0; i < 20; i += 1) {
		const piece = new Mesh(vertGeo, bone);
		piece.position.set(0, -.62 + i * .085, -.2);
		proxy.add(piece);
	}
	for (let i = 0; i < 6; i += 1) {
		const y = .36 + i * .09;
		const rx = .3 - Math.abs(i - 3) * .012;
		proxy.add(rib(y, rx, .16));
	}
	const trachea = new Mesh(new CylinderGeometry(.035, .042, .28, 10), bone);
	geos.add(trachea.geometry);
	trachea.position.set(0, .98, .05);
	proxy.add(trachea);
	const brainMat = material(15188686, 6959176, .28, .55);
	const brainGeo = new IcosahedronGeometry(.16, 2);
	displaceBrain(brainGeo);
	geos.add(brainGeo);
	const brain = new Mesh(brainGeo, brainMat);
	brain.position.set(0, 1.55, .02);
	proxy.add(brain);
	const sparks = makePoints(18, 16765668, 2.2);
	brain.add(sparks.points);
	const heartMat = material(11673395, 6949912, .45, .38);
	const heart = new Group();
	heart.add(blob(.15, heartMat, .01, -.02, 0, 1, 1.18, .86));
	heart.add(blob(.11, heartMat, .11, .01, .02, .9, 1.05, .78));
	heart.add(blob(.075, heartMat, -.02, .1, 0, 1, .9, .85));
	heart.add(blob(.068, heartMat, .09, .1, .02, 1, .85, .8));
	const aortaMat = material(13781592, 5902368, .3, .4);
	heart.add(vessel([
		new Vector3(.02, .12, 0),
		new Vector3(.02, .28, .02),
		new Vector3(-.02, .4, .04),
		new Vector3(-.08, .34, .06)
	], .028, aortaMat));
	heart.position.set(.1, .56, .16);
	heart.rotation.z = .42;
	proxy.add(heart);
	const lungMat = material(13666710, 5910584, .2, .62);
	const lungs = new Group();
	lungs.add(blob(.16, lungMat, -.24, .08, 0, .85, 1.25, .62));
	lungs.add(blob(.11, lungMat, -.22, -.1, .02, .9, .85, .6));
	lungs.add(blob(.09, lungMat, -.16, .2, -.02, .8, .7, .55));
	lungs.add(blob(.15, lungMat, .22, .06, 0, .78, 1.15, .58));
	lungs.add(blob(.1, lungMat, .2, -.1, .02, .85, .8, .55));
	lungs.position.set(0, .58, .02);
	proxy.add(lungs);
	const diaMat = new MeshStandardMaterial({
		color: 12880774,
		roughness: .7,
		transparent: true,
		opacity: .45,
		side: 2,
		depthWrite: false
	});
	mats.add(diaMat);
	const diaphragm = new Mesh(new CircleGeometry(.34, 28), diaMat);
	geos.add(diaphragm.geometry);
	diaphragm.rotation.x = -Math.PI / 2.3;
	diaphragm.position.set(0, .32, .06);
	proxy.add(diaphragm);
	const liver = blob(.2, material(9060400, 3806222, .18, .55), -.2, .2, .12, 1.35, .7, .82);
	liver.rotation.z = .35;
	proxy.add(liver);
	const stomach = blob(.13, material(13807738, 5913112, .16, .5), .16, .16, .16, 1.15, .85, .75);
	proxy.add(stomach);
	const spleen = blob(.07, material(8011096, 3150880, .16, .5), .28, .22, .02, .7, 1.1, .6);
	proxy.add(spleen);
	const gutMat = material(13350282, 4864024, .12, .58);
	const gutPts = [];
	for (let i = 0; i <= 56; i += 1) {
		const t = i / 56;
		const a = t * Math.PI * 5.2;
		const rad = .2 - t * .08;
		gutPts.push(new Vector3(Math.cos(a) * rad, .02 - t * .4, .06 + Math.sin(a) * rad * .5));
	}
	const gutCurve = new CatmullRomCurve3(gutPts);
	const gut = new Mesh(new TubeGeometry(gutCurve, 80, .028, 6, false), gutMat);
	geos.add(gut.geometry);
	proxy.add(gut);
	const bolus = blob(.045, material(15783844, 6965792, .4, .4), 0, 0, 0, 1, 1, 1);
	proxy.add(bolus);
	const waveBalls = [];
	for (let i = 0; i < 12; i += 1) {
		const ball = blob(.02, gutMat, 0, 0, 0, 1, 1, 1);
		waveBalls.push(ball);
		proxy.add(ball);
	}
	const kidneyMat = material(10110524, 4003348, .2, .5);
	const kidneyL = blob(.09, kidneyMat, .16, .02, -.14, .72, 1.15, .55);
	const kidneyR = blob(.09, kidneyMat, -.16, 0, -.14, .72, 1.15, .55);
	kidneyL.rotation.z = -.3;
	kidneyR.rotation.z = .3;
	proxy.add(kidneyL, kidneyR);
	const bladder = blob(.09, material(14273464, 4866100, .15, .48), 0, -.5, .1, 1.05, .8, .85);
	proxy.add(bladder);
	const flowPts = [
		new Vector3(.12, .62, .2),
		new Vector3(.06, .95, .12),
		new Vector3(0, 1.35, .06),
		new Vector3(0, 1.58, .02),
		new Vector3(-.06, 1.3, .05),
		new Vector3(-.08, .85, .04),
		new Vector3(-.04, .4, .1),
		new Vector3(.02, .05, .14),
		new Vector3(.04, -.35, .1),
		new Vector3(.1, .15, .16),
		new Vector3(.12, .5, .18)
	];
	const flow = new CatmullRomCurve3(flowPts, true);
	const artery = new Mesh(new TubeGeometry(flow, 80, .012, 5, true), aortaMat);
	geos.add(artery.geometry);
	proxy.add(artery);
	const blood = makePoints(42, 16734824, 3.4);
	proxy.add(blood.points);
	const clock = new Clock();
	const tmp = new Vector3();
	const camCenter = new Vector3();
	const camOffset = new Vector3();
	let yaw = .62;
	let pitch = .12;
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
	let atlas = null;
	let atlasPending = true;
	const ecg = /* @__PURE__ */ new Float32Array(160);
	let ecgHead = 0;
	const paintTeach = () => {
		const lesson = LESSONS[teachIndex];
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
		if (dotsEl) dotsEl.textContent = LESSONS.map((_, i) => i === teachIndex ? "●" : "○").join(" ");
	};
	const onTeach = (event) => {
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
	const onDown = (event) => {
		if (event.button !== 0) return;
		dragging = true;
		moved = false;
		lastX = event.clientX;
		lastY = event.clientY;
		try {
			glCanvas.setPointerCapture(event.pointerId);
		} catch {}
	};
	const onMove = (event) => {
		if (!dragging) return;
		const dx = event.clientX - lastX;
		const dy = event.clientY - lastY;
		if (Math.hypot(dx, dy) > 5) moved = true;
		yaw += dx * .008;
		pitch = Math.max(-.45, Math.min(.55, pitch + dy * .005));
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
		const credit = root.querySelector(".anatomy-credit");
		if (credit) credit.style.display = h < 120 ? "none" : "";
		if (card && teachOn) card.hidden = h < 220;
		if (!teachOn) {
			if (atlas) {
				if (aspect > 2.4) {
					camera.position.set(.28, .04, 1.15);
					camera.lookAt(0, .02, 0);
					camera.fov = 26;
				} else if (aspect > 1.15) {
					camera.position.set(.4, -.1, 2.15);
					camera.lookAt(0, -.12, 0);
					camera.fov = 28;
				} else {
					camera.position.set(.55, -.28, 3.55);
					camera.lookAt(0, -.3, 0);
					camera.fov = 28;
				}
			} else if (aspect > 2.4) {
				camera.position.set(.35, .55, 1.7);
				camera.lookAt(.05, .5, 0);
				camera.fov = 34;
			} else if (aspect > 1.15) {
				camera.position.set(.15, .42, 3.5);
				camera.lookAt(0, .4, 0);
				camera.fov = 30;
			} else {
				camera.position.set(.05, .32, 4.15);
				camera.lookAt(0, .32, 0);
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
	const drawEcg = (sample) => {
		ecg[ecgHead] = sample;
		ecgHead = (ecgHead + 1) % ecg.length;
		const ctx = ecgCanvas.getContext("2d");
		if (!ctx || ecgCanvas.style.display === "none") return;
		const w = ecgCanvas.width;
		const h = ecgCanvas.height;
		ctx.clearRect(0, 0, w, h);
		ctx.beginPath();
		ctx.strokeStyle = "rgba(198,161,90,0.9)";
		ctx.lineWidth = Math.max(1, h * .04);
		for (let i = 0; i < ecg.length; i += 1) {
			const value = ecg[(ecgHead + i) % ecg.length] ?? 0;
			const x = i / (ecg.length - 1) * w;
			const y = h * .62 - value * h * .42;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	};
	const loop = () => {
		if (stopped) return;
		raf = window.requestAnimationFrame(loop);
		if (document.hidden) return;
		const dt = Math.min(.05, clock.getDelta());
		elapsed += dt * (reduced ? .35 : 1);
		idle += dt;
		if (teachOn && !dragging && !reduced && elapsed - teachAt > 11) {
			teachIndex = (teachIndex + 1) % LESSONS.length;
			teachAt = elapsed;
			paintTeach();
		}
		const lesson = LESSONS[teachIndex];
		if (teachOn && !dragging && idle > .5) {
			const glide = Math.min(1, dt * 1.8);
			yaw += (lesson.yaw - yaw) * glide;
			pitch += (.06 - pitch) * glide;
		} else if (!teachOn && !dragging && idle > .8 && !reduced) yaw += dt * .28;
		const heartPhase = elapsed * (72 / 60 * Math.PI * 2);
		const beat = Math.pow(Math.max(0, Math.sin(heartPhase)), 10);
		const breathPhase = elapsed * (15 / 60 * Math.PI * 2);
		const breath = .5 - .5 * Math.cos(breathPhase);
		const focus = elapsed < pinUntil ? FOCUS[pin] : FOCUS[Math.floor(elapsed / 6) % FOCUS.length];
		pulseLight.intensity = .25 + 1.5 * beat;
		if (atlas) atlas.pulse(beat, breath, focus, teachOn ? lesson.region ?? "" : null);
		else {
			heart.scale.setScalar(1 + .14 * beat);
			lungs.scale.set(1 + .05 * breath, 1 + .1 * breath, 1 + .07 * breath);
			diaphragm.position.y = .34 - .07 * breath;
			stomach.scale.set(1.15, .85 * (1 + .06 * Math.sin(elapsed * .8)), .75);
			bladder.scale.set(1.05, .72 + .16 * (.5 + .5 * Math.sin(elapsed * .23)), .85);
			const hot = (system) => focus === "all" || focus === system;
			heartMat.emissiveIntensity = hot("tim") ? .35 + .9 * beat : .12;
			aortaMat.emissiveIntensity = hot("tim") ? .28 + .4 * beat : .08;
			lungMat.emissiveIntensity = hot("hohap") ? .18 + .35 * breath : .06;
			brainMat.emissiveIntensity = hot("thankinh") ? .3 + .25 * Math.sin(elapsed * 3) : .08;
			gutMat.emissiveIntensity = hot("tieuhoa") ? .22 : .06;
			kidneyMat.emissiveIntensity = hot("tietnieu") ? .2 + .15 * Math.sin(elapsed * 1.4) : .06;
			for (let i = 0; i < sparks.count; i += 1) {
				const u = (i * .173 + elapsed * .15) % 1;
				const phi = Math.acos(2 * (i * .37 % 1) - 1);
				const theta = u * Math.PI * 2;
				const flash = Math.pow(Math.max(0, Math.sin(elapsed * 4 + i)), 8);
				tmp.set(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
				tmp.multiplyScalar(.17 + flash * .03);
				sparks.attr.setXYZ(i, tmp.x, tmp.y, tmp.z);
			}
			sparks.attr.needsUpdate = true;
			gutCurve.getPointAt(elapsed * .08 % 1, tmp);
			bolus.position.copy(tmp);
			for (let i = 0; i < waveBalls.length; i += 1) {
				const u = (i / waveBalls.length + elapsed * .07) % 1;
				gutCurve.getPointAt(u, tmp);
				const ball = waveBalls[i];
				ball.position.copy(tmp);
				const squeeze = 1 + .7 * Math.pow(Math.max(0, Math.sin(elapsed * 3 - i * .55)), 2);
				ball.scale.setScalar(squeeze);
			}
			for (let i = 0; i < blood.count; i += 1) {
				flow.getPointAt((i / blood.count + elapsed * .09) % 1, tmp);
				blood.attr.setXYZ(i, tmp.x, tmp.y, tmp.z);
			}
			blood.attr.needsUpdate = true;
		}
		rig.rotation.y = yaw;
		rig.rotation.x = pitch;
		if (teachOn && atlas) {
			const framed = atlas.focusBox(LESSONS[teachIndex].region);
			if (framed) {
				rig.updateMatrix();
				camCenter.copy(framed.center).applyQuaternion(rig.quaternion);
				const fov = viewAspect > 2.4 ? 24 : 30;
				const fit = framed.radius * 1.25 / Math.tan(MathUtils.degToRad(fov / 2));
				const dist = Math.max(fit, viewAspect > 2.4 ? .7 : .95);
				camOffset.set(dist * .38, dist * .03, dist).applyQuaternion(rig.quaternion);
				camera.position.copy(camCenter).add(camOffset);
				camera.lookAt(camCenter);
				camera.fov = fov;
				camera.aspect = viewAspect;
				camera.updateProjectionMatrix();
			}
		}
		renderer.render(scene, camera);
		const qrs = ecgSample(heartPhase / (Math.PI * 2) % 1);
		drawEcg(qrs);
		if (elapsed - hudAt > .25) {
			hudAt = elapsed;
			const hr = Math.round(70 + 4 * Math.sin(elapsed * .17) + beat * 2);
			const br = Math.round(14 + 2 * Math.sin(elapsed * .09));
			const current = LESSONS[teachIndex];
			vitals.textContent = teachOn ? `${teachIndex + 1}/${LESSONS.length} · ${current.hook}` : atlasPending ? "Đang nạp atlas giải phẫu" : `Tim ${hr} nhịp · Thở ${br} · ${FOCUS_LABEL[focus]}`;
		}
	};
	raf = window.requestAnimationFrame(loop);
	loadAnatomyAtlas(() => stopped, (loaded) => {
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
			pulseLight.position.set(0, .02, .08);
		} else {
			loaded.root.add(pulseLight);
			pulseLight.position.set(.02, 1.28, .1);
		}
		if (teachBtn) teachBtn.hidden = false;
		frame();
		loaded.loadMuscles(() => stopped).then(() => {
			if (!stopped) root.dataset.muscles = "1";
		});
	}).then((loaded) => {
		if (!loaded) atlasPending = false;
	});
	return { dispose() {
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
	} };
	function material(color, emissive, glow, roughness) {
		const mat = new MeshStandardMaterial({
			color,
			emissive,
			emissiveIntensity: glow,
			roughness,
			metalness: .04
		});
		mats.add(mat);
		return mat;
	}
	function blob(radius, mat, x, y, z, sx, sy, sz) {
		const geo = new SphereGeometry(radius, 28, 20);
		geos.add(geo);
		const mesh = new Mesh(geo, mat);
		mesh.position.set(x, y, z);
		mesh.scale.set(sx, sy, sz);
		return mesh;
	}
	function rib(y, rx, rz) {
		const pts = [];
		for (let i = 0; i <= 18; i += 1) {
			const a = Math.PI * (.12 + .76 * (i / 18));
			pts.push(new Vector3(Math.cos(a) * rx, y, -.02 + Math.sin(a) * rz));
		}
		return vessel(pts, .011, bone);
	}
	function vessel(pts, radius, mat) {
		const geo = new TubeGeometry(new CatmullRomCurve3(pts), 24, radius, 5, false);
		geos.add(geo);
		return new Mesh(geo, mat);
	}
	function makePoints(count, color, size) {
		const geo = new BufferGeometry();
		const positions = new Float32Array(count * 3);
		geo.setAttribute("position", new BufferAttribute(positions, 3));
		geos.add(geo);
		const mat = new PointsMaterial({
			color,
			size,
			sizeAttenuation: false,
			transparent: true,
			opacity: .95,
			depthWrite: false
		});
		mats.add(mat);
		const attr = geo.getAttribute("position");
		return {
			points: new Points(geo, mat),
			attr,
			count
		};
	}
}
function displaceBrain(geo) {
	const pos = geo.getAttribute("position");
	const v = new Vector3();
	for (let i = 0; i < pos.count; i += 1) {
		v.fromBufferAttribute(pos, i);
		const n = v.clone().normalize();
		const fold = Math.sin(n.x * 17) * Math.sin(n.y * 13) * Math.sin(n.z * 15) + .35 * Math.sin(n.x * 31 + n.y * 11);
		v.addScaledVector(n, .011 * fold);
		pos.setXYZ(i, v.x, v.y, v.z);
	}
	geo.computeVertexNormals();
}
function ecgSample(x) {
	const bump = (center, width, amp) => amp * Math.exp(-((x - center) ** 2) / width);
	return bump(.18, 9e-4, .15) + bump(.32, 12e-5, -.18) + bump(.36, 5e-5, 1) + bump(.42, 18e-5, -.28) + bump(.62, .0022, .26);
}
function mountFlat(canvas, ecgCanvas, vitals) {
	let stopped = false;
	let raf = 0;
	const started = performance.now();
	const loop = (now) => {
		if (stopped) return;
		raf = window.requestAnimationFrame(loop);
		const t = (now - started) / 1e3;
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		canvas.width = Math.max(1, Math.floor(rect.width * dpr));
		canvas.height = Math.max(1, Math.floor(rect.height * dpr));
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);
		const cx = w * .5;
		const cy = h * .46;
		const beat = Math.pow(Math.max(0, Math.sin(t * 7.5)), 10);
		const breath = .5 - .5 * Math.cos(t * 1.57);
		ctx.strokeStyle = "rgba(126,182,214,0.55)";
		ctx.lineWidth = Math.max(1, w * .004);
		ctx.beginPath();
		ctx.ellipse(cx, cy, w * .16, h * .38, 0, 0, Math.PI * 2);
		ctx.stroke();
		const organ = (x, y, rx, ry, color) => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
			ctx.fill();
		};
		organ(cx - w * .07, cy - h * .02, w * .055 * (1 + .08 * breath), h * .1 * (1 + .1 * breath), "#d08996");
		organ(cx + w * .07, cy - h * .01, w * .05 * (1 + .08 * breath), h * .09 * (1 + .1 * breath), "#c47d8b");
		organ(cx + w * .025, cy + h * .01, w * .035 * (1 + .16 * beat), h * .045 * (1 + .16 * beat), "#b21f33");
		organ(cx - w * .05, cy + h * .08, w * .05, h * .04, "#8a4030");
		organ(cx, cy - h * .28, w * .045, h * .04, "#e7c2ce");
		vitals.textContent = `Tim ${Math.round(70 + 4 * Math.sin(t * .17))} nhịp · Thở ${Math.round(14 + breath)} · Mô phỏng phẳng`;
		ecgCanvas.width = Math.floor(rect.width * dpr);
		ecgCanvas.height = Math.floor(42 * dpr);
		const eg = ecgCanvas.getContext("2d");
		if (!eg) return;
		eg.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
		eg.strokeStyle = "rgba(198,161,90,0.9)";
		eg.beginPath();
		for (let i = 0; i < 120; i += 1) {
			const sample = ecgSample((i / 120 + t * 1.2) % 1);
			const x = i / 119 * ecgCanvas.width;
			const y = ecgCanvas.height * .62 - sample * ecgCanvas.height * .4;
			if (i === 0) eg.moveTo(x, y);
			else eg.lineTo(x, y);
		}
		eg.stroke();
	};
	raf = window.requestAnimationFrame(loop);
	return { dispose() {
		stopped = true;
		window.cancelAnimationFrame(raf);
	} };
}
//#endregion
export { mountAnatomy };
