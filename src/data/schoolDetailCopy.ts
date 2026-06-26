/**
 * 학교×과목 상세 페이지 카피(순수 함수). 학교명·과목명만 슬롯 주입.
 * 공통 섹션(STEP·믿는 이유·후기·진행순서)은 dongPageCopy.ts 의 데이터를 그대로 재사용한다.
 * 톤: 차분한 동료 교사. 과장·느낌표·미확정 수치 금지.
 */

/** 인트로 문단 — 학교 내신 맥락. */
export function buildSchoolIntro(schoolName: string, subjectLabel: string): string {
  return `${schoolName} 재학생을 위한 1:1 ${subjectLabel} 과외를 찾고 계신가요? 같은 학교 같은 학년이라도 학생마다 막히는 지점은 다릅니다. ${schoolName}의 내신 진도와 시험 범위에 맞춰, 지금 어디서 멈췄는지를 먼저 짚고 거기서부터 차근히 쌓아 올리는 수업을 설계합니다. 상담에서 아이의 현재 수준과 목표를 살핀 뒤, 성적뿐 아니라 호흡까지 맞는 선생님을 추천해 드립니다.`;
}

/** "왜 {학교}에서 1:1 {과목} 과외일까요?" 본문 — 학교 내신 맥락 변주. */
export function buildWhySchool(schoolName: string): string {
  return `학원 한 반에서는 학교마다 다른 내신 진도와 시험 범위를 일일이 맞추기 어렵습니다. 1:1 수업은 ${schoolName}의 진도와 출제 경향에 맞춰, 우리 아이가 어디서 멈췄는지를 그 자리에서 바로 메웁니다. 모르는 것을 모른다고 말할 수 있는 수업에서 내신과 실력이 함께 자랍니다.`;
}

/** FAQ — 학교 맥락 1~2문항 변형 + 공통 문항. 가격 단정 금지. */
export function buildSchoolFaq(schoolName: string): { q: string; a: string }[] {
  return [
    {
      q: `${schoolName} 근처도 개인과외(방문) 수업이 되나요?`,
      a: `${schoolName}과 인근 지역까지 방문이 가능합니다. 정확한 동선은 상담에서 확인해 연결해 드립니다.`,
    },
    {
      q: `${schoolName} 내신 대비도 봐주나요?`,
      a: `${schoolName}의 내신 진도와 기출 경향에 맞춰 시험 범위 중심으로 준비합니다. 학교 일정에 맞춰 1:1로 진행합니다.`,
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

/* ───────── SEO 콘텐츠 섹션(1단계) — 학습 전략 카드 · 관련 검색어 ───────── */

export type StrategyCard = { title: string; body: string };

/** 학교급(초·중·고) 단위 학습 목표 — 세부 학년(중1·중2·중3)은 쓰지 않는다. */
function levelGoal(levelLabel: string, subjectLabel: string): string {
  if (levelLabel === "초등학교")
    return `초등 시기에는 ${subjectLabel}의 기초 개념과 공부 습관을 탄탄히 잡아, 스스로 학습하는 힘을 기르는 것이 목표입니다.`;
  if (levelLabel === "고등학교")
    return `고등 시기에는 ${subjectLabel}의 내신과 수능을 함께 대비하며, 약한 단원을 집중 보완해 실전 적용력을 끌어올리는 것이 목표입니다.`;
  // 그 외(중학교)
  return `중등 시기에는 ${subjectLabel}의 개념 빈틈을 줄이고, 풀이 과정을 스스로 설명할 수 있는 힘을 기르는 것이 목표입니다. 내신을 관리하는 습관까지 함께 잡아 다음 단계로 무리 없이 이어 갑니다.`;
}

/** "학습 전략" 카드 4개 — 학교명·학교급·과목 메타만으로 구성. */
export function buildStrategyCards(
  schoolName: string,
  levelLabel: string,
  subjectLabel: string,
  subjectWhy: string,
): StrategyCard[] {
  return [
    {
      title: "학년별 학습 목표",
      body: levelGoal(levelLabel, subjectLabel),
    },
    {
      title: "과목별 학습 포인트",
      body: `${subjectWhy} 지금 어디서 막히는지부터 짚어, 그 지점을 메우는 데 수업의 초점을 둡니다.`,
    },
    {
      title: "학교 시험 대응",
      body: `${schoolName}의 내신 진도와 시험 범위, 출제 경향에 맞춰 시험 대비를 준비합니다. 학교 일정에 맞춰 약한 단원을 먼저 짚고 1:1로 보완해 드립니다.`,
    },
    {
      title: "1:1 과외의 강점",
      body: "여러 학생이 같은 진도를 나가는 수업과 달리, 1:1은 우리 아이가 어디서 멈췄는지에 집중합니다. 모르는 것을 바로 묻고 그 자리에서 메우며, 성향과 호흡에 맞춰 진도를 조절합니다.",
    },
  ];
}

/**
 * "관련 검색어" 태그 — 실제 페이지가 있는 것만 링크, 나머지는 장식(non-link).
 * 죽은 링크(가짜 href) 금지. "다른 과목" 링크는 (라) 내부링크 섹션과 중복되므로 넣지 않는다.
 */
export function buildRelatedKeywords(
  schoolName: string,
  sigunguName: string,
  sidoSlug: string,
  subjectLabel: string,
): { links: { label: string; href: string }[]; plain: string[] } {
  return {
    links: [
      { label: `${sigunguName} 학교`, href: `/tutoring/by-school/${sidoSlug}` },
    ],
    plain: [
      `${schoolName} ${subjectLabel}과외`,
      `${schoolName} 기출`,
      `${schoolName} 내신`,
      `${schoolName} 시험`,
      `${schoolName} 과외 추천`,
      `${sigunguName} ${subjectLabel} 과외`,
    ],
  };
}
