/**
 * 학교×과목 상세 페이지 카피(순수 함수). 학교명·과목명만 슬롯 주입.
 * 공통 섹션(STEP·믿는 이유·후기·진행순서)은 dongPageCopy.ts 의 데이터를 그대로 재사용한다.
 * 톤: 차분한 동료 교사. 과장·느낌표·미확정 수치 금지.
 */

/* ───────── 학교급 분기 유틸 ─────────
 * School.level 라벨(초등학교/중학교/고등학교)을 카피 레벨 키로 변환한다.
 *  - 초등(elem): 내신·중간·기말·모의고사·등급 표현을 쓰지 않고 단원평가·수행평가·학습 습관 프레이밍.
 *  - 중·고(middle/high): 내신 프레이밍을 공유(중등은 등급·수능 미사용).
 *  - 미지의 라벨은 중등으로 폴백(내신 프레이밍 = 기존 동작).
 */
export type CopyLevel = "elem" | "middle" | "high";
const LEVEL_KEY: Record<string, CopyLevel> = {
  초등학교: "elem",
  중학교: "middle",
  고등학교: "high",
};
function toLevel(levelLabel: string): CopyLevel {
  return LEVEL_KEY[levelLabel] ?? "middle";
}

/* 중·고 공통(내신 프레이밍) 본문 — elem 과 분기해 재사용. */
function introSecondary(schoolName: string, subjectLabel: string): string {
  return `${schoolName} 재학생을 위한 1:1 ${subjectLabel} 과외를 찾고 계신가요? 같은 학교 같은 학년이라도 학생마다 막히는 지점은 다릅니다. ${schoolName}의 내신 진도와 시험 범위에 맞춰, 지금 어디서 멈췄는지를 먼저 짚고 거기서부터 차근히 쌓아 올리는 수업을 설계합니다. 상담에서 아이의 현재 수준과 목표를 살핀 뒤, 성적뿐 아니라 호흡까지 맞는 선생님을 추천해 드립니다.`;
}
function whySecondary(schoolName: string): string {
  return `학원 한 반에서는 학교마다 다른 내신 진도와 시험 범위를 일일이 맞추기 어렵습니다. 1:1 수업은 ${schoolName}의 진도와 출제 경향에 맞춰, 우리 아이가 어디서 멈췄는지를 그 자리에서 바로 메웁니다. 모르는 것을 모른다고 말할 수 있는 수업에서 내신과 실력이 함께 자랍니다.`;
}

/** 인트로 문단 — 학교급별 프레이밍(초등=학교 진도·단원평가·학습 습관 / 중·고=내신). */
const INTRO_BUILDERS: Record<CopyLevel, (schoolName: string, subjectLabel: string) => string> = {
  elem: (schoolName, subjectLabel) =>
    `${schoolName} 재학생을 위한 1:1 ${subjectLabel} 과외를 찾고 계신가요? 같은 학교 같은 학년이라도 학생마다 막히는 지점은 다릅니다. ${schoolName}의 학교 진도와 단원평가·수행평가에 맞춰, 지금 어디서 멈췄는지를 먼저 짚고 기초부터 차근히 쌓아 올리는 수업을 설계합니다. 상담에서 아이의 현재 수준과 학습 습관을 살핀 뒤, 눈높이와 호흡까지 맞는 선생님을 추천해 드립니다.`,
  middle: introSecondary,
  high: introSecondary,
};
export function buildSchoolIntro(
  schoolName: string,
  subjectLabel: string,
  levelLabel: string,
): string {
  return INTRO_BUILDERS[toLevel(levelLabel)](schoolName, subjectLabel);
}

/** "왜 {학교}에서 1:1 {과목} 과외일까요?" 본문 — 학교급별 변주. */
const WHY_BUILDERS: Record<CopyLevel, (schoolName: string) => string> = {
  elem: (schoolName) =>
    `학원 한 반에서는 학교마다 다른 진도와 단원평가 범위를 일일이 맞추기 어렵습니다. 1:1 수업은 ${schoolName}의 학교 진도에 맞춰, 우리 아이가 어디서 멈췄는지를 그 자리에서 바로 메웁니다. 모르는 것을 모른다고 말할 수 있는 수업에서 기초와 학습 습관이 함께 자랍니다.`,
  middle: whySecondary,
  high: whySecondary,
};
export function buildWhySchool(schoolName: string, levelLabel: string): string {
  return WHY_BUILDERS[toLevel(levelLabel)](schoolName);
}

/** 학교급별 시험 대비 FAQ 1문항 — 초등=단원평가·수행평가 / 중·고=내신. */
function examFaq(schoolName: string, level: CopyLevel): { q: string; a: string } {
  if (level === "elem")
    return {
      q: `${schoolName} 단원평가·수행평가 대비도 해주시나요?`,
      a: `${schoolName}의 학교 진도에 맞춰 단원평가와 수행평가 범위를 중심으로 준비합니다. 학교 일정에 맞춰 기초와 학습 습관까지 1:1로 함께 잡아갑니다.`,
    };
  return {
    q: `${schoolName} 내신 대비도 봐주나요?`,
    a: `${schoolName}의 내신 진도와 기출 경향에 맞춰 시험 범위 중심으로 준비합니다. 학교 일정에 맞춰 1:1로 진행합니다.`,
  };
}

/* ───────── 학교급×과목 FAQ 분화(게이트 2 — 레버 3) ─────────
 * 기존엔 전 학교×과목이 "학교명만 치환된 동일 5문항"이라 FAQ 블록이 중복을 가중했다.
 * A/B축(고교·중학 × 핵심6과목)만 급×과목 고유 세트로 교체해 유사도를 낮춘다.
 *   - 대상: level ∈ {high, middle} × subject ∈ {국·영·수·과·사·역} = 12세트.
 *   - 초등(C2 동결)·논술·코딩·학교급 미상 → 기존 generic 세트 그대로(해당 축 diff 0).
 *   - 어학(/power)·검고(/gumjung)는 이 함수를 쓰지 않으므로 영향 0.
 * 각 세트 = 급×과목 고유 3문항 + 공통 비용 1문항(운영 문항). 학교명(S)만 슬롯 치환.
 * 금지: 느낌표·성과/점수 보장·컨설턴트. 호칭은 선생님/상담.
 */
type Faq = { q: string; a: string };
const CORE_FAQ_SUBJECTS = new Set(["math", "english", "korean", "science", "social", "history"]);
const FAQ_COST: Faq = {
  q: "비용은 어떻게 되나요?",
  a: "학년·과목·수업 횟수에 따라 다르며, 상담에서 자세히 안내해 드립니다.",
};

const CORE_FAQ: Record<"high" | "middle", Record<string, (S: string) => Faq[]>> = {
  high: {
    math: (S) => [
      { q: `${S} 수학 내신과 모의고사를 함께 준비할 수 있나요?`, a: `${S}의 내신 진도와 기출을 먼저 확인하고, 모의고사 유형까지 한 선생님이 균형 있게 끌고 가도록 1:1로 설계합니다.` },
      { q: "미적분·확률과 통계처럼 특정 단원만 보완해도 되나요?", a: "지금 막힌 단원부터 시작합니다. 상담에서 약한 단원을 확인해 개념과 유형을 그 지점부터 다시 쌓습니다." },
      { q: "계산 실수와 서술형 감점이 잦은데 봐주시나요?", a: "틀리는 지점을 유형별로 모아 오답을 점검하고, 서술형 풀이 과정을 함께 다듬어 반복 실수를 줄입니다." },
    ],
    english: (S) => [
      { q: `${S} 영어 내신과 모의고사를 함께 대비하나요?`, a: `${S}의 내신 범위와 지문을 먼저 보고, 모의고사 독해·듣기 유형까지 1:1로 함께 준비합니다.` },
      { q: "어법과 서술형이 약한데 그 부분만 집중해도 되나요?", a: "약한 어법과 서술형 유형을 먼저 진단해 그 지점부터 구문 독해와 함께 보완합니다." },
      { q: "독해 속도가 느린데 어떻게 수업하나요?", a: "문장을 끊어 읽는 구문 훈련부터 지문 구조 파악까지 단계적으로 쌓아 읽는 속도를 올립니다." },
    ],
    korean: (S) => [
      { q: `${S} 국어 내신과 모의고사를 함께 준비하나요?`, a: `${S}의 내신 지문과 출제 경향을 확인하고, 문학·독서·화법과 작문을 모의고사 유형까지 1:1로 다룹니다.` },
      { q: "비문학 독해가 약한데 그 부분만 봐주시나요?", a: "지문 구조를 스스로 짚는 훈련을 중심으로, 약한 제재부터 독해법을 다시 세웁니다." },
      { q: "서술형과 문법이 헷갈리는데 어떻게 하나요?", a: "자주 틀리는 문법 개념을 정리하고 서술형 답안을 함께 고쳐 쓰며 감점 요인을 줄입니다." },
    ],
    science: (S) => [
      { q: `${S} 과학 내신 대비가 되나요? 선택과목도 봐주시나요?`, a: `${S}의 내신 진도에 맞춰 준비하며, 학교·학년에 따라 과목 범위가 다르므로 어떤 과목을 볼지는 상담에서 확인해 연결해 드립니다.` },
      { q: "개념은 아는데 자료·그래프 문제에서 막혀요.", a: "개념을 문제 상황에 적용하는 훈련과 자료·그래프 해석 유형을 단계적으로 다룹니다." },
      { q: "실험·서술형 문항도 대비하나요?", a: "학교 시험에 나오는 실험 과정과 서술형 유형을 함께 정리해 답안 쓰는 법까지 봐 드립니다." },
    ],
    social: (S) => [
      { q: `${S} 사회 내신 대비가 되나요? 선택과목도 봐주시나요?`, a: `${S}의 내신 범위에 맞춰 준비하며, 학교·학년에 따라 선택 과목이 다르므로 어떤 과목을 볼지는 상담에서 확인해 연결해 드립니다.` },
      { q: "개념 암기는 되는데 자료·도표 해석이 약해요.", a: "개념을 흐름으로 정리한 뒤 도표·자료를 읽는 유형을 반복해 실전에서 흔들리지 않도록 돕습니다." },
      { q: "서술형 답안 쓰는 법도 봐주시나요?", a: "쟁점을 사례에 적용하는 연습과 서술형 답안 작성을 함께 다듬어 감점 요인을 줄입니다." },
    ],
    history: (S) => [
      { q: `${S} 한국사 내신 대비가 되나요?`, a: `${S}의 내신 범위와 출제 경향에 맞춰, 시대의 큰 흐름과 사건의 인과를 잡아 1:1로 준비합니다.` },
      { q: "사건을 자꾸 따로 외우게 돼요. 어떻게 하나요?", a: "연표와 사료를 활용해 사건을 흐름으로 꿰도록 정리해, 외우는 부담을 줄이고 오래 남게 돕습니다." },
      { q: "서술형 문항도 대비하나요?", a: "자주 나오는 서술형 주제를 흐름 속에서 정리하고 답안 쓰는 법을 함께 연습합니다." },
    ],
  },
  middle: {
    math: (S) => [
      { q: `${S} 수학 내신과 서술형·수행평가를 대비하나요?`, a: `${S}의 시험 범위와 서술형 유형을 확인해 그 형식에 맞춰 1:1로 준비합니다.` },
      { q: "앞 학년 개념이 비어 있는데 선행부터 해도 되나요?", a: "현재 수준을 진단해 빈 개념을 먼저 메운 뒤, 필요하면 선행 속도를 아이에게 맞춰 조절합니다." },
      { q: "단원평가 전에 집중해서 봐주시나요?", a: "학교 일정에 맞춰 약한 단원을 먼저 짚고 유형 문제로 점검하며 시험을 준비합니다." },
    ],
    english: (S) => [
      { q: `${S} 영어 내신과 수행평가·서술형을 대비하나요?`, a: `${S}의 시험 범위와 수행평가 형식을 확인해 그 유형에 맞춰 1:1로 준비합니다.` },
      { q: "문법 기초가 약한데 독해와 같이 할 수 있나요?", a: "현재 수준을 진단해 기초 문법과 구문 독해를 함께 쌓는 순서로 설계합니다." },
      { q: "단어 암기가 안 되는데 어떻게 하나요?", a: "시험 범위 어휘를 매일 조금씩 누적하는 방법을 잡아 주고 수업에서 함께 점검합니다." },
    ],
    korean: (S) => [
      { q: `${S} 국어 내신과 서술형을 대비하나요?`, a: `${S}의 시험 지문과 서술형 유형을 확인해 그 형식에 맞춰 1:1로 준비합니다.` },
      { q: "독해가 약한데 어떻게 수업하나요?", a: "어휘와 문장 단위 독해부터 글의 구조를 짚는 훈련까지 단계적으로 읽는 힘을 키웁니다." },
      { q: "문법이 자꾸 헷갈려요.", a: "자주 틀리는 문법 개념을 정리하고 문제로 확인하며 단원평가에 대비합니다." },
    ],
    science: (S) => [
      { q: `${S} 과학 내신과 수행평가를 대비하나요?`, a: `${S}의 시험 범위와 수행평가 유형을 확인해 그 형식에 맞춰 1:1로 준비합니다.` },
      { q: "개념 이해가 약한데 어떻게 하나요?", a: "현상을 관찰하고 원리로 설명하는 습관부터 들여 개념을 흐름으로 이해하도록 돕습니다." },
      { q: "실험·관찰 수행평가도 도와주시나요?", a: "학교에서 진행하는 실험·관찰 수행평가 유형에 맞춰 과정을 정리하고 보고서 쓰는 법까지 함께 봐 드립니다." },
    ],
    social: (S) => [
      { q: `${S} 사회 내신과 수행평가를 대비하나요?`, a: `${S}의 시험 범위와 수행평가 형식을 확인해 그 유형에 맞춰 1:1로 준비합니다.` },
      { q: "외울 게 많아 흐름을 못 잡아요.", a: "핵심 개념을 원인과 결과의 흐름으로 정리해 암기 부담을 줄이고 오래 남도록 돕습니다." },
      { q: "자료·그래프 문제가 약해요.", a: "자료와 그래프를 읽는 기본기를 다지고 유형 문제로 반복해 점검합니다." },
    ],
    history: (S) => [
      { q: `${S} 역사 내신과 수행평가를 대비하나요?`, a: `${S}의 시험 범위에 맞춰 시대의 큰 흐름과 사건의 인과를 잡아 1:1로 준비합니다.` },
      { q: "시대 순서가 자꾸 헷갈려요.", a: "연표로 시대 구분과 앞뒤 흐름을 먼저 잡고, 사건을 흐름 속에서 이해하도록 정리합니다." },
      { q: "수행평가 과제도 도와주시나요?", a: "학교 수행평가 유형에 맞춰 자료를 정리하고 글로 쓰는 과정을 함께 봐 드립니다." },
    ],
  },
};

/** generic 세트(초등·논술·코딩·학교급 미상) — 기존 5문항 그대로 유지(해당 축 출력 불변). */
function genericSchoolFaq(schoolName: string, levelLabel: string): Faq[] {
  return [
    {
      q: `${schoolName} 근처도 개인과외(방문) 수업이 되나요?`,
      a: `${schoolName}과 인근 지역까지 방문이 가능합니다. 정확한 동선은 상담에서 확인해 연결해 드립니다.`,
    },
    examFaq(schoolName, toLevel(levelLabel)),
    {
      q: "선생님이 아이와 안 맞으면 어떻게 하나요?",
      a: "첫 수업 후 잘 맞지 않으면, 다른 선생님과 호흡을 맞춰볼 수 있도록 조율해 드립니다.",
    },
    {
      q: "상담은 어떻게 진행되나요?",
      a: "전화나 메신저로 아이의 현재 상황을 듣고, 맞는 선생님을 추천해 드립니다.",
    },
    FAQ_COST,
  ];
}

/**
 * FAQ — A/B축(고교·중학 × 핵심6) 은 급×과목 고유 세트, 그 외는 generic 세트.
 * page.tsx 의 faqJsonLd(buildSchoolFaq(...)) 와 **반드시 동일 인자**(schoolName·levelLabel·subjectSlug)로
 * 호출해 화면 Q&A 와 FAQPage JSON-LD 가 1:1 로 일치해야 한다. 가격 단정 금지.
 */
export function buildSchoolFaq(
  schoolName: string,
  levelLabel: string,
  subjectSlug?: string,
): Faq[] {
  const level = toLevel(levelLabel);
  if (
    (level === "high" || level === "middle") &&
    subjectSlug &&
    CORE_FAQ_SUBJECTS.has(subjectSlug)
  ) {
    return [...CORE_FAQ[level][subjectSlug](schoolName), FAQ_COST];
  }
  return genericSchoolFaq(schoolName, levelLabel);
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

/** "학교 시험 대응" 카드 본문 — 초등=단원평가·수행평가·학습 습관 / 중·고=내신. */
function examStrategyBody(schoolName: string, level: CopyLevel): string {
  if (level === "elem")
    return `${schoolName}의 학교 진도와 단원평가·수행평가 범위에 맞춰 준비합니다. 학교 일정에 맞춰 약한 부분을 먼저 짚고 기초와 학습 습관까지 1:1로 보완해 드립니다.`;
  return `${schoolName}의 내신 진도와 시험 범위, 출제 경향에 맞춰 시험 대비를 준비합니다. 학교 일정에 맞춰 약한 단원을 먼저 짚고 1:1로 보완해 드립니다.`;
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
      body: examStrategyBody(schoolName, toLevel(levelLabel)),
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
 * 관련 검색어 — 전부 장식 태그(non-link). 실제 내부 링크는 (라) "다른 과목/다른 학교"에만 둔다.
 * 죽은 링크(가짜 href) 금지. 초등(elem)은 약칭6+정식명8 (14개), 중·고등은 약칭 기반 15개.
 */
export function buildRelatedKeywords(
  schoolName: string,
  displayName: string,
  isElem: boolean,
): KeywordTag[] {
  if (isElem) {
    const abbr = ["사고력수학", "영어에세이", "파닉스", "논술수업", "저학년", "고학년"].map(
      (s) => ({ label: `${schoolName} ${s}` }),
    );
    const formal = ["국어", "수학", "영어", "과학", "사회", "역사", "논술", "코딩"].map(
      (s) => ({ label: `${displayName} ${s}` }),
    );
    return [...abbr, ...formal];
  }
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

/**
 * "과목별 1:1 과외" — 표시명(정식명, 없으면 약칭)으로 과목 태그 구성.
 * 초등(elem)은 8과목(+역사·논술·코딩), 중·고등은 5과목. 전부 장식(non-link).
 * 실제 과목 내부 링크는 (라) "다른 과목"에만 둔다(중복 회피).
 */
export function buildSubjectOverview(
  displayName: string,
  isElem: boolean,
): { title: string; tags: string[] } {
  const base = ["국어과외", "수학과외", "영어과외", "과학과외", "사회과외"];
  const subjects = isElem ? [...base, "역사과외", "논술과외", "코딩과외"] : base;
  return {
    title: `${displayName} 과목별 1:1 과외`,
    tags: subjects.map((s) => `${displayName} ${s}`),
  };
}
