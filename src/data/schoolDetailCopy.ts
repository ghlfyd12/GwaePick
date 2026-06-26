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

/**
 * 학교급(초·중·고) 단위 학습 목표.
 * 중·고는 1/2/3학년 목표를 자연스러운 한 문단으로(키워드 나열 금지). 약칭·정식명을 문맥 속에 한 번씩 섞는다.
 * 정식명(fullName)이 없으면(대부고/상고/사대부고) 양쪽 모두 약칭 사용. 초등은 학년 구분 없이 단일 문장.
 */
function levelGoal(
  schoolName: string,
  fullName: string | null,
  levelLabel: string,
  subjectLabel: string,
): string {
  const formal = fullName ?? schoolName; // 정식명 없으면 약칭으로 대체
  if (levelLabel === "초등학교")
    return `초등 시기에는 ${subjectLabel}의 기초 개념과 공부 습관을 탄탄히 잡아, 스스로 학습하는 힘을 기르는 것이 목표입니다.`;
  if (levelLabel === "고등학교")
    return `${schoolName} 1학년은 고등 ${subjectLabel}의 내신 기반을 다지며 학습 습관을 자리잡는 시기이고, 2학년은 모의고사와 내신을 함께 끌고 가는 균형이 중요합니다. ${formal} 3학년은 약한 단원을 집중 보완하고 수능과 내신을 마무리하는 데 집중합니다. 학년에 따라 달라지는 목표를 1:1로 맞춰 갑니다.`;
  // 그 외(중학교)
  return `${schoolName} 1학년은 ${subjectLabel}의 기초 개념을 빠짐없이 다지는 시기이고, 2학년은 범위가 넓어지는 만큼 빈틈이 생기지 않도록 관리하는 것이 중요합니다. ${formal} 3학년은 고등 과정과 이어지는 내용을 단단히 마무리하며 내신과 진학을 함께 준비합니다. 학년마다 달라지는 목표에 맞춰, 지금 단계에 꼭 필요한 부분부터 1:1로 채워 갑니다.`;
}

/** "학습 전략" 카드 4개 — 학교명·정식명·학교급·과목 메타만으로 구성. */
export function buildStrategyCards(
  schoolName: string,
  schoolFullName: string | null,
  levelLabel: string,
  subjectLabel: string,
  subjectWhy: string,
): StrategyCard[] {
  return [
    {
      title: "학년별 학습 목표",
      body: levelGoal(schoolName, schoolFullName, levelLabel, subjectLabel),
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
export type KeywordTag = { label: string; href?: string };

/**
 * 관련 검색어 15개 — 전부 장식 태그(non-link). 실제 내부 링크는 (라) "다른 과목/다른 학교"에만 둔다.
 * 죽은 링크(가짜 href) 금지 — 여기서는 href 자체를 만들지 않는다.
 */
export function buildRelatedKeywords(schoolName: string): KeywordTag[] {
  return [
    "기출",
    "내신",
    "시험",
    "과외 추천",
    "과외 비용",
    "1:1 과외 선생님",
    "수학과외",
    "영어과외",
    "국어과외",
    "과학과외",
    "사회과외",
    "수학 기출",
    "영어 기출",
    "전문과외",
    "내신대비",
  ].map((s) => ({ label: `${schoolName} ${s}` }));
}
