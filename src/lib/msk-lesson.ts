export type LessonRegion = "spine" | "shoulder" | "elbow" | "hip" | "knee" | "ankle";

export type Lesson = {
  title: string;
  region: LessonRegion | null;
  hook: string;
  fact: string;
  tip: string;
  yaw: number;
};

export const LESSONS: Lesson[] = [
  {
    title: "Chìa khóa",
    region: null,
    hook: "Khung · Bản lề · Dây kéo",
    fact: "Xương chịu lực. Khớp cho chuyển động. Cơ kéo xương.",
    tip: "Mỗi vùng chỉ hỏi ba câu: xương nào, khớp nào, cơ nào.",
    yaw: 0.45,
  },
  {
    title: "Cột sống",
    region: "spine",
    hook: "7 cổ · 12 ngực · 5 lưng",
    fact: "Đĩa đệm là miếng đệm giữa các đốt. Cơ dựng sống giữ người thẳng.",
    tip: "Nhấc đồ thì hạ gối, lưng thẳng. Không vừa cúi vừa xoay.",
    yaw: 0.85,
  },
  {
    title: "Vai",
    region: "shoulder",
    hook: "Vai rộng nhưng lỏng",
    fact: "Khớp cầu, cử động nhiều nhất. Cơ delta nâng tay. Chóp xoay giữ khớp.",
    tip: "Khuân quá đầu dễ làm lỏng vai. Khuỷu thấp hơn vai thì an toàn hơn.",
    yaw: 1.05,
  },
  {
    title: "Khuỷu",
    region: "elbow",
    hook: "Khuỷu chỉ gấp, cẳng tay mới xoay",
    fact: "Khuỷu là bản lề. Sấp ngửa là xương quay xoay trên xương trụ.",
    tip: "Đau mặt ngoài khi vặn vít hay bê xô: nghỉ đúng động tác đó.",
    yaw: 1.15,
  },
  {
    title: "Háng",
    region: "hip",
    hook: "Háng chịu cả người",
    fact: "Khớp cầu. Cơ mông duỗi háng. Cơ thắt lưng-chậu đưa đùi lên.",
    tip: "Đau bẹn lúc bước dài thì bước ngắn lại, đừng ép dạng mạnh.",
    yaw: 0.7,
  },
  {
    title: "Gối",
    region: "knee",
    hook: "Bản lề, có đệm, có dây",
    fact: "Sụn chêm là đệm. Dây chằng chéo giữ khớp không trượt trước sau.",
    tip: "Bàn chân đang bám đất thì đừng xoay người. Dễ rách đệm hoặc dây.",
    yaw: 0.55,
  },
  {
    title: "Cổ chân",
    region: "ankle",
    hook: "Hay lật vào trong",
    fact: "Mắt cá ngoài xuống thấp hơn, nên chân hay lật vào trong và đau phía ngoài.",
    tip: "Đường gồ ghề thì nhìn xuống. Lật rồi thì nghỉ và kê cao chân.",
    yaw: 0.6,
  },
];

export function muscleRegion(name: string): LessonRegion | null {
  const n = name.toLowerCase();
  if (/iliocostalis|longissimus|spinalis|multifidus|semispinalis|splenius|rotatores|quadratus lumborum|sternocleidomastoid/.test(n)) return "spine";
  if (/coracobrachialis|deltoid|supraspinatus|infraspinatus|subscapularis|teres minor|teres major/.test(n)) return "shoulder";
  if (/biceps brachii|triceps brachii|brachialis|brachioradialis|anconeus/.test(n)) return "elbow";
  if (/gluteus|iliacus|psoas major|piriformis|gemellus/.test(n)) return "hip";
  if (/rectus femoris|vastus |biceps femoris|semimembranosus|semitendinosus|popliteus/.test(n)) return "knee";
  if (/gastrocnemius|soleus|plantaris|calcaneal tendon|tibialis anterior|tibialis posterior|fibularis /.test(n)) return "ankle";
  return null;
}

export function jointRegion(name: string): LessonRegion | null {
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
