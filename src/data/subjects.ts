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
  /** 이런 학생에게(선택) — 있으면 상세 페이지에 노출. */
  forWhom?: string[];
  /** 수업 방식 한 단락(선택) — 있으면 상세 페이지에 노출. */
  teaching?: string;
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
  {
    slug: "history",
    label: "역사",
    why: "역사는 사건을 따로따로 외우면 금방 잊지만, 원인과 결과의 흐름으로 꿰면 오래 남습니다. 1:1 과외는 학생이 헷갈려 하는 시대와 사건을 짚어 큰 흐름으로 이어주고, 학년과 수준에 맞게 깊이를 조절합니다.",
    curriculum: [
      DIAGNOSE("역사"),
      { step: "STEP 2", title: "기초", desc: "주요 시대 구분과 큰 흐름을 잡고, 사건의 앞뒤 인과를 연결하는 기초를 다집니다." },
      { step: "STEP 3", title: "심화", desc: "사료와 연표를 활용해 사건을 깊이 이해하고, 학교 시험과 출제 경향에 맞춰 대비합니다." },
      REVIEW("배운 시대의 흐름을 스스로 설명할 수 있는지 점검하고, 약한 부분을 보완합니다."),
    ],
  },
  {
    slug: "essay",
    label: "논술",
    why: "논술과 글쓰기는 정답을 외우는 게 아니라, 읽고 생각한 것을 논리적으로 표현하는 힘입니다. 초등·중등의 기초 글쓰기부터 고등·대입 논술까지, 1:1 과외는 학생이 쓴 글을 함께 읽고 다듬으며 사고력과 표현력을 단계에 맞게 길러줍니다.",
    curriculum: [
      DIAGNOSE("논술"),
      { step: "STEP 2", title: "기초", desc: "글을 정확히 읽고 핵심을 파악하는 힘과, 생각을 순서대로 정리해 문장으로 쓰는 기초를 다집니다." },
      { step: "STEP 3", title: "심화", desc: "글의 짜임(처음·가운데·끝)을 갖춰 자기 생각과 근거를 함께 쓰는 연습을 하고, 첨삭으로 표현을 다듬습니다." },
      REVIEW("스스로 쓴 글을 다시 읽고 고쳐보며, 글쓰기에 대한 자신감을 키웁니다."),
    ],
  },
  {
    slug: "coding",
    label: "코딩",
    why: "직접 만들어 보며 익힐 때 코딩이 진짜 사고력이 됩니다.",
    forWhom: [
      "논리적으로 생각하는 힘을 기르고 싶은 학생",
      "학교 정보·SW 수업을 따라가기 어려운 학생",
      "직접 만들면서 배우는 걸 좋아하는 학생",
    ],
    teaching:
      "문법을 외우는 수업이 아니라, 직접 만들어 보며 원리를 익히는 방식입니다. 작은 결과물을 스스로 완성하는 경험을 통해 논리적 사고력과 자신감을 함께 키웁니다. 초·중·고 정보·SW 교육과 학생 수준에 맞춰 진도를 조절합니다.",
    curriculum: [
      { step: "STEP 1", title: "진단", desc: "흥미와 현재 수준을 먼저 파악해 어떤 도구가 맞는지 확인합니다." },
      { step: "STEP 2", title: "기초", desc: "블록코딩·스크래치로 프로그래밍의 원리와 절차를 이해합니다." },
      { step: "STEP 3", title: "심화", desc: "파이썬 기초 문법과 알고리즘적 사고를 단계적으로 훈련합니다." },
      { step: "STEP 4", title: "점검", desc: "작은 프로젝트를 스스로 완성하며 배운 것을 정리합니다." },
    ],
  },
];

export const subjectBySlug: Record<string, Subject> = Object.fromEntries(
  subjects.map((s) => [s.slug, s]),
);
