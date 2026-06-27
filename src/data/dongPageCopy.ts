/**
 * 동×과목 상세 페이지 카피 템플릿·변주 데이터(순수 함수 분리).
 *
 * 슬롯: {시군구} {동} {과목} {이웃동1} {이웃동2}. 지역 데이터는 sidoRegions.ts 에서만.
 * 도입 카피는 동 slug 해시로 A/B 고정(같은 동은 항상 같은 변형 → 중복 콘텐츠 회피·안정).
 * 톤: 차분한 동료 교사. 과장·느낌표·미확정 수치 금지.
 */
import { getSido } from "@/data/sidoRegions";
import type { SubjectCurriculumStep } from "@/data/subjects";

export const CONSULT_PHONE = "010-2177-2720";

const BASE = "/tutoring/by-region";
/** 동 링크. subject 있으면 동×과목 상세, 없으면 동 허브(과목 선택). */
export function dongHref(
  sido: string,
  sigungu: string,
  dong: string,
  subject?: string,
) {
  const base = `${BASE}/${sido}/${sigungu}/${dong}`;
  return subject ? `${base}/${subject}` : base;
}

/**
 * 후기 placeholder — 실제 후기로 교체 전까지 사용(수치·실명 없음).
 * ⚠️ 확정 후기가 들어오면 이 배열을 교체한다.
 */
export const REVIEW_PLACEHOLDERS = [
  {
    label: "중2 · 수학",
    text: "어디서 막히는지 먼저 짚어 주시니 아이가 모르는 걸 편하게 묻기 시작했어요. 진도보다 이해를 챙겨 주셔서 좋았습니다.",
    author: "○○ 학부모",
  },
  {
    label: "고1 · 영어",
    text: "성향까지 맞는 선생님을 추천해 주셔서 첫 수업부터 분위기가 편했습니다. 상담에서 충분히 들어 주신 점이 인상적이었어요.",
    author: "○○ 학부모",
  },
];

/** 정적 생성(파일럿) 대상 — 확장 시 이 상수만 수정. */
export const PILOT: { sido: string; sigungu: string[] }[] = [
  // 서울 4구
  { sido: "seoul", sigungu: ["gangnamgu", "seochogu", "songpagu", "yangcheongu"] },
  // 고양 3구
  {
    sido: "gyeonggi",
    sigungu: ["goyangsideogyanggu", "goyangsiilsandonggu", "goyangsiilsanseogu"],
  },
];

export type Slots = {
  sigungu: string;
  dong: string;
  subject: string;
  n1: string;
  n2: string;
};

/** 같은 시군구 내, 가나다 인접 2개 동 이름(현재 동 제외). */
export function neighborDongs(
  sidoSlug: string,
  sigunguSlug: string,
  dongSlug: string,
): string[] {
  const sg = getSido(sidoSlug)?.sigungu.find((s) => s.slug === sigunguSlug);
  if (!sg) return [];
  const sorted = [...sg.dong].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const idx = sorted.findIndex((d) => d.slug === dongSlug);
  if (idx < 0) return [];
  const picks: string[] = [];
  if (sorted[idx - 1]) picks.push(sorted[idx - 1].name);
  if (sorted[idx + 1]) picks.push(sorted[idx + 1].name);
  // 끝단 보정: 부족하면 가까운 다른 동으로 채움
  for (let off = 2; picks.length < 2 && off < sorted.length; off++) {
    const cand = sorted[idx - off] ?? sorted[idx + off];
    if (cand && !picks.includes(cand.name)) picks.push(cand.name);
  }
  return picks.slice(0, 2);
}

/** 동 slug 해시 → 'A' | 'B' (안정적 변형 선택). */
export function pickVariant(dongSlug: string): "A" | "B" {
  let h = 0;
  for (let i = 0; i < dongSlug.length; i++) h = (h * 31 + dongSlug.charCodeAt(i)) >>> 0;
  return h % 2 === 0 ? "A" : "B";
}

function fill(tpl: string, s: Slots): string {
  return tpl
    .replaceAll("{시군구}", s.sigungu)
    .replaceAll("{동}", s.dong)
    .replaceAll("{과목}", s.subject)
    .replaceAll("{이웃동1}", s.n1)
    .replaceAll("{이웃동2}", s.n2);
}

const INTRO_A =
  "{시군구} {동}에서 1:1 {과목} 과외를 알아보고 계신가요? 같은 학년이라도 학생마다 {과목}에서 막히는 지점은 다릅니다. 아이에게 맞는 과외는 진도를 빨리 빼는 수업이 아니라, 지금 어디서 멈췄는지를 먼저 짚고 거기서부터 차근히 쌓아 올리는 수업입니다. 지식의참견은 {동}과 인근 {이웃동1}·{이웃동2}까지 방문이 가능한 선생님을 직접 연결합니다. 상담에서 아이의 현재 수준과 목표를 살핀 뒤, 성적뿐 아니라 호흡까지 맞는 선생님을 추천해 드립니다.";

const INTRO_B =
  "{동}에서 {과목} 1:1 과외 선생님을 찾고 계신가요? 우리 아이에게 정말 필요한 건 더 많은 문제가 아니라, 약점을 정확히 짚어 주는 한 사람일 때가 많습니다. 지식의참견은 직접 학생을 가르쳐 온 선생님이 상담을 맡아, {시군구} {동} 학생의 상황을 먼저 이해하고 가장 잘 맞는 {과목} 선생님을 연결합니다. {이웃동1}·{이웃동2} 등 인근 방문도 가능합니다.";

/** 도입 카피(변형 A/B + 슬롯 치환). 이웃동이 1개뿐이면 자연스럽게 처리. */
export function buildIntro(slots: Slots, dongSlug: string): string {
  const variant = pickVariant(dongSlug);
  // 이웃동 부족 시 두 번째 슬롯을 비우고 가운뎃점 정리
  const tpl = variant === "A" ? INTRO_A : INTRO_B;
  let out = fill(tpl, slots);
  if (!slots.n2) out = out.replaceAll(`·`, "").replaceAll("  ", " ");
  return out;
}

/** "왜 1:1 과외일까요?" 공통 문단. */
export const WHY_COMMON =
  "학원 한 반에서 여러 학생이 같은 진도를 나가는 동안, 정작 우리 아이가 어디서 멈췄는지는 지나치기 쉽습니다. 1:1 수업은 그 한 명에게 집중하기 때문에, 모르는 것을 모른다고 말할 수 있고 그 자리에서 바로 메울 수 있습니다.";

/** 상담·수업 진행 순서 STEP 01~04. */
export const STEPS = [
  { no: "01", title: "수업 문의 · 전화 상담", desc: "아이의 현재 상황을 편하게 들려주세요." },
  { no: "02", title: "학생 맞춤 선생님 배정", desc: "성향·목표·호흡까지 보고 연결합니다." },
  { no: "03", title: "1:1 체험 수업", desc: "첫 수업으로 호흡을 직접 확인합니다." },
  { no: "04", title: "수업 일정 조율 · 시작", desc: "잘 맞지 않으면 다른 선생님과 호흡을 맞춰 조율합니다." },
];

/** 우리를 믿어도 되는 이유 3가지. */
export const TRUST = [
  "직접 가르쳐 온 선생님이 상담합니다 — 선생님을 보는 눈은 선생님이 가장 정확합니다.",
  "성적뿐 아니라 아이와의 호흡까지 보고 연결합니다.",
  "첫 수업이 잘 맞지 않으면, 다른 선생님과 호흡을 맞춰볼 수 있도록 조율합니다.",
];

/* ───────── 동 허브(과목 선택) 카피 — 과목 미선택 상태(subject-agnostic) ───────── */

/** 동 허브 도입 문단 — 특정 과목 없이 동 맥락만. */
export function buildHubIntro(sigungu: string, dong: string): string {
  return `${sigungu} ${dong}에서 1:1 과외 선생님을 찾고 계신가요? 같은 학년이라도 학생마다 막히는 지점은 다릅니다. 아이에게 맞는 과외는 진도를 빨리 빼는 수업이 아니라, 지금 어디서 멈췄는지를 먼저 짚고 거기서부터 차근히 쌓아 올리는 수업입니다. 지식의참견은 ${dong}과 인근 지역까지 방문이 가능한 선생님을 직접 연결합니다. 아래에서 과목을 선택하면 해당 과목 1:1 과외를 자세히 안내해 드립니다.`;
}

/** 동 허브 커리큘럼 4단계 — 과목 공통(진단·기초·심화·점검). */
export const HUB_CURRICULUM: SubjectCurriculumStep[] = [
  { step: "STEP 1", title: "진단", desc: "지금 어디서 막히는지, 현재 수준과 약한 부분을 먼저 확인합니다." },
  { step: "STEP 2", title: "기초", desc: "과목의 기본 개념과 공부 습관을 다져 흔들리지 않는 토대를 만듭니다." },
  { step: "STEP 3", title: "심화", desc: "유형별 문제와 응용으로 확장하고, 학교 진도와 시험 범위에 맞춰 깊이를 더합니다." },
  { step: "STEP 4", title: "점검", desc: "틀린 문제의 이유를 함께 짚고 다음 수업의 디딤돌로 삼아 반복을 줄입니다." },
];

/** 동 허브 학습 전략 카드 4개 — 동 맥락, 과목 공통. */
export function buildHubStrategy(dong: string): { title: string; body: string }[] {
  return [
    {
      title: "학년별 학습 목표",
      body: "초등은 기초 개념과 공부 습관을, 중등은 넓어지는 범위의 빈틈 관리를, 고등은 내신과 수능의 균형을 목표로 합니다. 학년에 따라 달라지는 목표를 1:1로 맞춰 갑니다.",
    },
    {
      title: "과목별 학습 포인트",
      body: "국어·영어·수학·과학·사회부터 역사·논술·코딩까지, 과목마다 막히는 지점이 다릅니다. 지금 어디서 멈췄는지부터 짚어 그 지점을 메우는 데 수업의 초점을 둡니다.",
    },
    {
      title: "학교 시험 대응",
      body: `${dong} 인근 학교의 내신 진도와 시험 범위, 출제 경향에 맞춰 시험 대비를 준비합니다. 학교 일정에 맞춰 약한 단원을 먼저 짚고 1:1로 보완해 드립니다.`,
    },
    {
      title: "1:1 과외의 강점",
      body: "여러 학생이 같은 진도를 나가는 수업과 달리, 1:1은 우리 아이가 어디서 멈췄는지에 집중합니다. 모르는 것을 바로 묻고 그 자리에서 메우며, 성향과 호흡에 맞춰 진도를 조절합니다.",
    },
  ];
}

/** FAQ(동명 슬롯). 가격 단정 금지. */
export function buildFaq(dong: string): { q: string; a: string }[] {
  return [
    {
      q: `${dong}도 개인과외(방문) 수업이 되나요?`,
      a: `${dong}과 인근 지역까지 방문이 가능합니다. 정확한 동선은 상담에서 확인해 연결해 드립니다.`,
    },
    {
      q: "선생님이 아이와 안 맞으면 어떻게 하나요?",
      a: "첫 수업 후 잘 맞지 않으면, 다른 선생님과 호흡을 맞춰볼 수 있도록 조율해 드립니다.",
    },
    {
      q: "상담은 어떻게 진행되나요?",
      a: "전화나 메신저로 아이의 현재 상황을 듣고, 맞는 선생님을 추천해 드립니다.",
    },
    {
      q: "비용은 어떻게 되나요?",
      a: "학년·과목·수업 횟수에 따라 다르며, 상담에서 자세히 안내해 드립니다.",
    },
  ];
}
