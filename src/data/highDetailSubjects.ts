/**
 * 고교 세부과목(과탐 4) 데이터 — 지식의참견 본체. subjects.ts 무수정 원칙 유지를 위한 별도 레지스트리.
 *
 * 라우트(/tutoring/by-school/[학교]/[subject])의 resolve 가 **고교(level=high)일 때만** 이 레지스트리를
 * 조회한다(중·초는 404 유지). Subject 형태를 그대로 재사용해 SchoolSubjectDetail·buildSchoolMeta 가
 * 기존 8과목과 동일 경로로 렌더한다. by-subject 단독·지역 페이지·SubjectTabs 기본은 subjects.ts(8)만
 * 쓰므로 이 파일을 읽지 않는다(기존 출력 diff 0).
 *
 * 절대 규칙: 느낌표·성과 보장·후기·수치·특정 학교 비교 금지, 호칭은 선생님/상담만.
 * 교육과정·수능 구체 명칭("물리학 I·II" 등)은 검증 전 미사용 — "학교·학년에 따라 범위가 다르므로
 * 상담에서 확인" 위임 톤 유지.
 */
import type { Subject } from "@/data/subjects";

const DIAGNOSE = (s: string) => ({
  step: "STEP 1",
  title: "진단",
  desc: `${s} 현재 수준과 어디서 막히는지를 먼저 확인합니다.`,
});
const REVIEW = (desc: string) => ({ step: "STEP 4", title: "점검", desc });

/** 고교 세부과목 4종(과탐). slug 는 라우트 [subject] 세그먼트로 쓰인다. */
export const highDetailSubjects: Subject[] = [
  {
    slug: "physics",
    label: "물리",
    why: "고등 물리는 개념을 이해하고 상황에 적용하는 힘이 핵심입니다. 공식을 외우기보다 왜 그렇게 되는지를 잡으면 문제 유형이 바뀌어도 흔들리지 않습니다.",
    curriculum: [
      DIAGNOSE("물리"),
      { step: "STEP 2", title: "기초", desc: "핵심 개념의 원리를 정리하고, 단위와 기본 상황부터 다시 세웁니다." },
      { step: "STEP 3", title: "심화", desc: "개념을 문제 상황에 적용하는 유형과 서술형까지 단계적으로 다룹니다." },
      REVIEW("틀린 문제의 개념을 다시 짚어 반복 실수를 줄입니다."),
    ],
  },
  {
    slug: "chemistry",
    label: "화학",
    why: "화학은 개념 이해와 계산이 함께 가는 과목입니다. 원리를 먼저 잡고 계산 유형을 익히면 실수를 줄이고 응용에서 흔들리지 않습니다.",
    curriculum: [
      DIAGNOSE("화학"),
      { step: "STEP 2", title: "기초", desc: "개념과 기본 계산(몰·농도 등 유형)을 원리부터 다집니다." },
      { step: "STEP 3", title: "심화", desc: "계산 유형과 자료 해석, 서술형을 단계적으로 확장합니다." },
      REVIEW("계산 실수 지점을 함께 점검하고 보완합니다."),
    ],
  },
  {
    slug: "biology",
    label: "생명과학",
    why: "생명과학은 개념을 정확히 잡고 자료·그래프를 해석하는 힘이 중요합니다. 용어를 따로 외우기보다 흐름으로 이해하면 오래 남습니다.",
    curriculum: [
      DIAGNOSE("생명과학"),
      { step: "STEP 2", title: "기초", desc: "핵심 개념과 용어를 흐름으로 이해하도록 정리합니다." },
      { step: "STEP 3", title: "심화", desc: "자료·그래프 해석과 사고형 문제, 서술형까지 다룹니다." },
      REVIEW("헷갈리는 개념을 주기적으로 점검합니다."),
    ],
  },
  {
    slug: "earth-science",
    label: "지구과학",
    why: "지구과학은 현상을 원리로 이해하면 암기 부담이 줄어듭니다. 개념을 그림·자료와 연결해 정리하면 문제에서 바로 떠올릴 수 있습니다.",
    curriculum: [
      DIAGNOSE("지구과학"),
      { step: "STEP 2", title: "기초", desc: "주요 현상과 개념을 그림·자료와 연결해 이해합니다." },
      { step: "STEP 3", title: "심화", desc: "자료 해석과 유형별 문제, 서술형까지 단계적으로 다룹니다." },
      REVIEW("자주 나오는 자료 유형을 점검하고 보완합니다."),
    ],
  },
  // ── 사탐 5과목(2단계) — 한국사 제외(history 담당) ──
  {
    slug: "life-ethics",
    label: "생활과윤리",
    why: "생활과 윤리는 개념을 실생활 사례에 적용하는 힘이 중요합니다. 쟁점을 흐름으로 잡으면 논술형에서 흔들리지 않습니다.",
    curriculum: [
      DIAGNOSE("생활과 윤리"),
      { step: "STEP 2", title: "기초", desc: "핵심 개념과 쟁점을 흐름으로 정리합니다." },
      { step: "STEP 3", title: "심화", desc: "쟁점을 사례에 적용하고 논술형까지 단계적으로 다룹니다." },
      REVIEW("헷갈리는 쟁점을 비교하며 점검합니다."),
    ],
  },
  {
    slug: "social-culture",
    label: "사회문화",
    why: "사회문화는 개념 이해와 도표·자료 해석이 함께 갑니다. 자료를 읽는 훈련을 하면 실전에서 흔들리지 않습니다.",
    curriculum: [
      DIAGNOSE("사회문화"),
      { step: "STEP 2", title: "기초", desc: "핵심 개념을 정리하고 도표 읽는 기본기를 다집니다." },
      { step: "STEP 3", title: "심화", desc: "도표·자료 해석과 서술형까지 단계적으로 다룹니다." },
      REVIEW("자주 나오는 자료 유형을 점검하고 보완합니다."),
    ],
  },
  {
    slug: "korean-geography",
    label: "한국지리",
    why: "한국지리는 개념을 지도·자료와 연결해 이해하면 오래 남습니다. 자료 해석 유형을 익히는 것이 핵심입니다.",
    curriculum: [
      DIAGNOSE("한국지리"),
      { step: "STEP 2", title: "기초", desc: "핵심 개념을 지도·자료와 연결해 이해합니다." },
      { step: "STEP 3", title: "심화", desc: "자료 해석 유형과 서술형까지 단계적으로 다룹니다." },
      REVIEW("자주 나오는 자료를 점검하고 보완합니다."),
    ],
  },
  {
    slug: "politics-law",
    label: "정치와법",
    why: "정치와 법은 개념을 사례에 적용하는 힘이 중요합니다. 원리를 잡고 사례로 확인하면 응용에서 무너지지 않습니다.",
    curriculum: [
      DIAGNOSE("정치와 법"),
      { step: "STEP 2", title: "기초", desc: "핵심 개념과 원리를 정리합니다." },
      { step: "STEP 3", title: "심화", desc: "사례 적용과 서술형까지 단계적으로 다룹니다." },
      REVIEW("헷갈리는 개념을 점검하고 보완합니다."),
    ],
  },
  {
    slug: "ethics-thought",
    label: "윤리와사상",
    why: "윤리와 사상은 사상가의 관점과 개념을 흐름으로 이해하는 과목입니다. 비교하며 정리하면 헷갈림이 줄어듭니다.",
    curriculum: [
      DIAGNOSE("윤리와 사상"),
      { step: "STEP 2", title: "기초", desc: "주요 사상과 개념을 흐름으로 정리합니다." },
      { step: "STEP 3", title: "심화", desc: "사상가별 관점을 비교하고 논술형까지 다룹니다." },
      REVIEW("사상가별 관점을 점검하며 정리합니다."),
    ],
  },
];

/** title 접미 키워드(과목별 검색 결). composeTitle 이 detail/기본보다 우선 적용. */
export const HIGH_DETAIL_TITLE_KEYWORD: Record<string, string> = {
  physics: "- 물리학 내신 수능 기출 서술형 1:1",
  chemistry: "- 화학 내신 수능 기출 계산 1:1",
  biology: "- 생명과학 내신 수능 기출 자료해석 1:1",
  "earth-science": "- 지구과학 내신 수능 기출 개념 1:1",
  // 사탐 — title 키워드엔 정식 표기(띄어쓰기) 병기.
  "life-ethics": "- 생활과 윤리 내신 수능 기출 논술형 1:1",
  "social-culture": "- 사회문화 내신 수능 기출 자료해석 1:1",
  "korean-geography": "- 한국지리 내신 수능 기출 자료해석 1:1",
  "politics-law": "- 정치와 법 내신 수능 기출 개념 1:1",
  "ethics-thought": "- 윤리와 사상 내신 수능 기출 개념 1:1",
};

const bySlug: Record<string, Subject> = Object.fromEntries(
  highDetailSubjects.map((s) => [s.slug, s]),
);

/** 고교 세부과목 slug 목록(sitemap·탭·그리드 재사용). */
export const HIGH_DETAIL_SLUGS: string[] = highDetailSubjects.map((s) => s.slug);

/** slug → 세부과목(없으면 null). */
export function getHighDetailSubject(slug: string): Subject | null {
  return bySlug[slug] ?? null;
}

export function isHighDetailSubjectSlug(slug: string): boolean {
  return slug in bySlug;
}

/** title 키워드(세부과목이면 반환, 아니면 null) — composeTitle 우선 적용용. */
export function getHighDetailTitleKeyword(slug?: string): string | null {
  return (slug && HIGH_DETAIL_TITLE_KEYWORD[slug]) || null;
}
