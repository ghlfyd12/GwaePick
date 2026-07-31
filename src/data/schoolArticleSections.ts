/**
 * 학교×과목 상세의 아티클형 목차 섹션 카피 단일 소스(신규).
 *
 * 전환 우선 지역 고등학교(articlePilotSchools) × 핵심 5과목 페이지에만 렌더된다.
 * 상단 앵커 목차 + 소제목(H2) 4개 + 섹션 본문 구조로, 네이버가 소제목을 목차 칩으로
 * 추출하도록 돕는다. 목차 링크 텍스트는 각 섹션 heading 과 정확히 일치한다(파생).
 *
 * 워딩 규칙: "선생님 / 상담 선생님"로 통일. 금지 표현·과장 문장부호·성과 보장·기간 단정 미사용.
 *   학교명은 아래 확정 카피의 삽입 위치(섹션 3)에만 사용하며, 학교별 출제 경향을 단정하지 않는다.
 *   색은 accent 토큰(코랄) — 컴포넌트에서 처리(이 파일은 순수 데이터).
 */

export interface ArticleSection {
  /** 앵커 id(영문 소문자). 목차 링크와 섹션 heading 을 잇는다. */
  id: string;
  /** 소제목(H2) 텍스트 — 목차 링크 텍스트와 동일. */
  heading: string;
  /** 섹션 본문(단락). */
  body: string;
}

export interface SchoolArticle {
  toc: { id: string; label: string }[];
  sections: ArticleSection[];
}

/** 섹션 1 — 과목별 "고등학교 {과목} 1:1 과외의 장점" 본문(핵심 5과목). */
const ADVANTAGE_BY_SUBJECT: Record<string, string> = {
  korean:
    "고등학교 국어는 문학·독서·화법과 작문까지 범위가 넓고, 내신은 교과서와 부교재 중심으로 출제됩니다. 1:1 과외는 다니는 학교의 진도와 범위에 맞춰 필요한 부분부터 준비할 수 있습니다. 지문을 함께 분석하고 자기 언어로 정리하는 훈련을 반복하면 서술형까지 대비가 됩니다.",
  english:
    "고등학교 영어 내신은 교과서·부교재·모의고사 변형까지 학교마다 출제 범위가 다릅니다. 1:1 과외는 학교 진도와 시험 범위에 맞춰 구문 독해와 어휘를 필요한 순서로 채웁니다. 수능과 내신을 병행해야 하는 시기에는 학습 균형을 함께 설계합니다.",
  math:
    "고등학교 수학은 단원 간 연결이 강해서 한 번 놓친 개념이 다음 단원까지 이어집니다. 1:1 과외는 취약 단원을 먼저 진단하고 개념의 원리부터 다시 쌓습니다. 틀린 문제를 다음 수업의 출발점으로 삼아 같은 유형에서 다시 무너지지 않게 관리합니다.",
  social:
    "고등학교 사회는 암기량이 많아 보이지만, 실제 시험은 개념 간 흐름과 자료 해석을 묻습니다. 1:1 과외는 단원 구조를 먼저 잡고 원인과 결과의 흐름으로 정리합니다. 서술형과 수행평가까지 학교 일정에 맞춰 준비합니다.",
  science:
    "고등학교 과학은 개념 이해와 자료·그래프 해석이 함께 요구됩니다. 1:1 과외는 현상을 먼저 설명하게 하는 방식으로 개념을 다지고, 실험·자료 해석 문제를 단계별로 훈련합니다. 선택 과목과 학교 진도에 맞춰 범위를 조정합니다.",
};

/** 섹션 2 — 공통 "고등학교 내신 시험 대비 시기". */
const EXAM_TIMING_BODY =
  "고등학교 내신은 시험 3~4주 전부터 범위 정리를 시작하는 경우가 많지만, 1:1 수업은 평소 진도 관리가 함께 이루어져 시험 기간의 부담이 줄어듭니다. 시험 2~3주 전에는 범위 안의 취약 부분을 집중 보강하고, 마지막 주에는 실전 형식의 점검으로 마무리합니다. 시작 시점이 늦었더라도 남은 기간에 맞춰 우선순위를 정해 준비합니다.";

/** 섹션 4 — 공통 "무료 상담에서 확인하는 것". */
const CONSULT_CHECK_BODY =
  "무료 상담에서는 현재 성적대와 목표, 학습 습관, 선호하는 수업 방식을 확인합니다. 상담 후 맞는 선생님을 소개해 드리고, 잘 맞지 않으면 다시 연결해 드립니다. 상담만 받아도 부담이 없습니다.";

/** 핵심 5과목 slug 여부 — 이 과목만 아티클 섹션을 만든다. */
export function hasSchoolArticle(subjectSlug: string): boolean {
  return subjectSlug in ADVANTAGE_BY_SUBJECT;
}

/**
 * (학교명, 과목) → 아티클(목차 + 4섹션). 핵심 5과목이 아니면 null.
 * 목차 링크 텍스트는 각 섹션 heading 을 그대로 써 정확히 일치시킨다.
 */
export function buildSchoolArticle(
  schoolName: string,
  subjectLabel: string,
  subjectSlug: string,
): SchoolArticle | null {
  const advantage = ADVANTAGE_BY_SUBJECT[subjectSlug];
  if (!advantage) return null;

  const sections: ArticleSection[] = [
    {
      id: "advantages",
      heading: `고등학교 ${subjectLabel} 1:1 과외의 장점`,
      body: advantage,
    },
    {
      id: "exam-timing",
      heading: "고등학교 내신 시험 대비 시기",
      body: EXAM_TIMING_BODY,
    },
    {
      id: "process",
      heading: `${schoolName} ${subjectLabel} 과외 진행 방식`,
      body: `${schoolName} 재학 중이라면, 상담에서 학교 진도와 시험 범위, 최근 시험에서 어려웠던 부분을 먼저 확인합니다. 직접 가르쳐 온 상담 선생님이 상황을 듣고, ${subjectLabel} 지도 경험과 성향이 맞는 선생님을 연결해 드립니다. 수업이 시작되면 학교 일정에 맞춰 진도와 시험 대비를 함께 계획합니다.`,
    },
    {
      id: "consult-check",
      heading: "무료 상담에서 확인하는 것",
      body: CONSULT_CHECK_BODY,
    },
  ];

  return {
    toc: sections.map((s) => ({ id: s.id, label: s.heading })),
    sections,
  };
}
