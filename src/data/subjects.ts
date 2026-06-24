/**
 * 동×과목 상세용 과목 메타(영문 slug). pseo.ts/categories.ts 와 별개(라우팅 slug 체계가 다름).
 *
 * slug: korean/english/math/social/science. 하드코딩 금지 — 이 파일에서만.
 * why: 과목 한 줄. curriculum: 진단→기초→심화→점검 4단계(수치·허위 없음).
 */
export interface SubjectCurriculumStep {
  step: string;
  title: string;
  desc: string;
}
export interface Subject {
  slug: string;
  label: string;
  why: string;
  curriculum: SubjectCurriculumStep[];
}

const DIAGNOSE = (s: string): SubjectCurriculumStep => ({
  step: "STEP 1",
  title: "진단",
  desc: `${s} 현재 수준과 어디서 막히는지를 먼저 확인합니다.`,
});
const REVIEW = (desc: string): SubjectCurriculumStep => ({
  step: "STEP 4",
  title: "점검",
  desc,
});

export const subjects: Subject[] = [
  {
    slug: "korean",
    label: "국어",
    why: "글의 구조를 스스로 짚어내는 훈련이 쌓일 때 독해가 실력이 됩니다.",
    curriculum: [
      DIAGNOSE("국어"),
      { step: "STEP 2", title: "기초", desc: "어휘와 문장 단위 독해로 글을 읽는 기본기를 다집니다." },
      { step: "STEP 3", title: "심화", desc: "지문 구조를 분석하고 서술형까지 단계적으로 적용합니다." },
      REVIEW("틀린 문제의 이유를 함께 짚고 다음 수업의 디딤돌로 삼습니다."),
    ],
  },
  {
    slug: "english",
    label: "영어",
    why: "문장을 끊어 읽고 구조를 보는 기본기에서 독해와 내신이 함께 트입니다.",
    curriculum: [
      DIAGNOSE("영어"),
      { step: "STEP 2", title: "기초", desc: "구문 독해와 어휘를 매일 누적해 읽는 힘을 만듭니다." },
      { step: "STEP 3", title: "심화", desc: "지문 독해와 내신 문법·서술형을 함께 다룹니다." },
      REVIEW("약점 단원을 주기적으로 점검하고 보완합니다."),
    ],
  },
  {
    slug: "math",
    label: "수학",
    why: "공식을 외우기 전에 왜 그런지를 이해해야 응용에서 무너지지 않습니다.",
    curriculum: [
      DIAGNOSE("수학"),
      { step: "STEP 2", title: "기초", desc: "개념의 원리부터 다시 세워 빈틈을 메웁니다." },
      { step: "STEP 3", title: "심화", desc: "유형별 문제와 오답을 통해 응용력을 키웁니다." },
      REVIEW("오답을 다음 수업의 디딤돌로 삼아 반복을 줄입니다."),
    ],
  },
  {
    slug: "social",
    label: "사회",
    why: "단순 암기가 아니라 원인과 결과의 흐름으로 엮을 때 오래 남습니다.",
    curriculum: [
      DIAGNOSE("사회"),
      { step: "STEP 2", title: "기초", desc: "핵심 개념을 흐름으로 이해하도록 정리합니다." },
      { step: "STEP 3", title: "심화", desc: "자료·그래프 해석과 서술형까지 확장합니다." },
      REVIEW("헷갈리는 개념을 주기적으로 점검합니다."),
    ],
  },
  {
    slug: "science",
    label: "과학",
    why: "현상을 먼저 관찰하고 설명해 본 학생이 문제 적용에 강합니다.",
    curriculum: [
      DIAGNOSE("과학"),
      { step: "STEP 2", title: "기초", desc: "현상을 관찰하고 원리로 설명하는 습관을 들입니다." },
      { step: "STEP 3", title: "심화", desc: "실험·그래프 데이터 해석을 단계별로 다룹니다." },
      REVIEW("단원별로 이해도를 점검하고 보완합니다."),
    ],
  },
];

export const subjectBySlug: Record<string, Subject> = Object.fromEntries(
  subjects.map((s) => [s.slug, s]),
);
