/**
 * 어학의참견(/power) 어학시험 축 — 지역×어학시험 pSEO 페이지의 시험 데이터 단일 소스(신규).
 *
 * /power/by-region/[region]/[exam] 라우트가 쓴다. 지역 회화 축(byRegionSubject)이 회화·과외만
 * 다뤄 "지역명+어학시험명"(예: 관악구 토익, 고양시 덕양구 JLPT) 검색 수요를 받지 못하던 것을 보완한다.
 *
 * 워딩 규칙(CLAUDE.md·지침서): "선생님 / 상담 선생님 / 지도"로 통일. 금지 표현·과장 문장부호·
 *   성과 보장 문구 미사용. 회화 축 화자 표현과 달리 시험 지도 경험 중심으로 서술한다.
 *   색은 accent 토큰(퍼플)만 — 컴포넌트에서 처리(이 파일은 순수 데이터).
 */

export interface PowerExam {
  /** URL 세그먼트(영문 소문자). */
  slug: string;
  /** 표기명(토익, JLPT 등). */
  name: string;
  language: "english" | "japanese" | "chinese";
  /** "이런 분에게 필요합니다" 한 줄. */
  targetLine: string;
  /** 준비 포인트 3개. */
  prepPoints: { title: string; desc: string }[];
}

/** 시험별 메타(title/description) 데이터 — 13종 상수화. name 은 POWER_EXAMS 에서 참조. */
export interface ExamMeta {
  /** 영문약칭(TOEIC·IELTS·OPIc 등). name 과 같으면(JLPT·HSK 등) title 에서 중복 생략. */
  abbr: string;
  /** title 꼬리 키워드("800·900 단기" 등). 서비스어("매칭")·느낌표 없음. */
  titleKw: string;
  /** description 꼬리 — "{지역} {시험명}, " 뒤에 붙는 목표·대상 문장(첫 상담 무료 포함). */
  descTail: string;
}

/** slug → ExamMeta. 13종 전량. 표기·키워드는 사용자 확정본. */
export const EXAM_META: Record<string, ExamMeta> = {
  toeic: { abbr: "TOEIC", titleKw: "800·900 단기", descTail: "목표 점수(800·900)와 마감까지 남은 기간에 맞춰 성인·직장인·대학생을 일대일로 지도합니다. 첫 상담은 무료입니다." },
  "toeic-speaking": { abbr: "TOEIC Speaking", titleKw: "레벨6·7", descTail: "목표 레벨(6·7)에 맞춰 답변 구성과 발화를 성인·직장인 대상 일대일로 준비합니다. 첫 상담은 무료입니다." },
  opic: { abbr: "OPIc", titleKw: "IH·AL 스피킹", descTail: "목표 등급(IH·AL)에 맞춰 답변 전략과 발화를 성인·직장인·대학생 일대일로 준비합니다. 첫 상담은 무료입니다." },
  toefl: { abbr: "TOEFL", titleKw: "스피킹·라이팅", descTail: "목표 점수와 유학 일정에 맞춰 스피킹·라이팅까지 성인·대학생을 일대일로 지도합니다. 첫 상담은 무료입니다." },
  ielts: { abbr: "IELTS", titleKw: "스피킹·라이팅", descTail: "목표 밴드와 준비 기간에 맞춰 지도 경험이 있는 선생님이 성인·대학생을 일대일로 지도합니다. 첫 상담은 무료입니다." },
  teps: { abbr: "TEPS", titleKw: "청해·문법 집중", descTail: "목표 점수와 청해·문법을 성인·대학생·직장인 대상 일대일로 준비합니다. 첫 상담은 무료입니다." },
  gtelp: { abbr: "G-TELP", titleKw: "65점·32점", descTail: "목표 점수(65·32)와 자격·공무원 일정에 맞춰 성인·직장인을 일대일로 지도합니다. 첫 상담은 무료입니다." },
  jlpt: { abbr: "JLPT", titleKw: "N1·N2", descTail: "목표 급수(N1·N2)와 준비 기간에 맞춰 성인·대학생·직장인을 일대일로 지도합니다. 첫 상담은 무료입니다." },
  jpt: { abbr: "JPT", titleKw: "700·800", descTail: "목표 점수(700·800)에 맞춰 청해·독해를 성인·직장인 대상 일대일로 준비합니다. 첫 상담은 무료입니다." },
  sjpt: { abbr: "SJPT", titleKw: "레벨 5·6", descTail: "목표 레벨(5·6)에 맞춰 말하기를 성인·직장인 대상 일대일로 준비합니다. 첫 상담은 무료입니다." },
  hsk: { abbr: "HSK", titleKw: "5급·6급", descTail: "목표 급수(5급·6급)와 준비 기간에 맞춰 성인·대학생·직장인을 일대일로 지도합니다. 첫 상담은 무료입니다." },
  hskk: { abbr: "HSKK", titleKw: "중급·고급", descTail: "목표 등급(중급·고급) 말하기를 성인·대학생 대상 일대일로 준비합니다. 첫 상담은 무료입니다." },
  tsc: { abbr: "TSC", titleKw: "4급·5급", descTail: "목표 등급(4급·5급) 말하기를 성인·직장인 대상 일대일로 준비합니다. 첫 상담은 무료입니다." },
};

/**
 * /power 시험 title/description 조립(사용자 확정 형식).
 * title: "{지역} {시험명} 과외 | [{약칭} ]1:1 개인과외 {키워드}" (약칭=시험명이면 생략)
 * desc:  "{지역} {시험명}, {descTail}"
 */
export function buildExamTitle(regionName: string, exam: PowerExam): string {
  const m = EXAM_META[exam.slug];
  const abbrPart = m.abbr === exam.name ? "" : `${m.abbr} `;
  return `${regionName} ${exam.name} 과외 | ${abbrPart}1:1 개인과외 ${m.titleKw}`;
}
export function buildExamDescription(regionName: string, exam: PowerExam): string {
  return `${regionName} ${exam.name}, ${EXAM_META[exam.slug].descTail}`;
}

export const POWER_EXAMS: PowerExam[] = [
  /* ── 영어 ─────────────────────────────────────────────────────────── */
  {
    slug: "toeic",
    name: "토익",
    language: "english",
    targetLine: "취업·승진·졸업 요건으로 공인 점수가 필요한 분",
    prepPoints: [
      { title: "파트별 진단", desc: "LC·RC 파트별 정답률을 먼저 확인하고 취약 파트부터 채웁니다." },
      { title: "기본기 보강", desc: "빈출 어휘와 문법을 수준에 맞는 분량으로 누적 관리합니다." },
      { title: "시간 관리", desc: "실전 기출로 파트별 시간 배분을 몸에 익힙니다." },
    ],
  },
  {
    slug: "toeic-speaking",
    name: "토익스피킹",
    language: "english",
    targetLine: "사내 평가·이직 준비로 말하기 등급이 필요한 분",
    prepPoints: [
      { title: "유형별 답변 틀", desc: "문항 유형마다 바로 쓰는 답변 구성을 만듭니다." },
      { title: "발음·억양 교정", desc: "감점 요인을 짚어 자연스러운 소리로 다듬습니다." },
      { title: "실전 모의", desc: "실제 시험 흐름 그대로 연습하고 피드백을 받습니다." },
    ],
  },
  {
    slug: "opic",
    name: "오픽",
    language: "english",
    targetLine: "자기 이야기 중심의 말하기 평가를 준비하는 분",
    prepPoints: [
      { title: "서베이 전략", desc: "답변하기 유리한 주제 조합을 함께 설계합니다." },
      { title: "소재 정리", desc: "내 경험을 답변 소재로 미리 정리해 둡니다." },
      { title: "콤보 대응", desc: "연속 질문과 롤플레이 유형을 반복 연습합니다." },
    ],
  },
  {
    slug: "toefl",
    name: "토플",
    language: "english",
    targetLine: "유학·편입·대학원 진학을 준비하는 분",
    prepPoints: [
      { title: "아카데믹 독해", desc: "학술 지문의 구조를 읽는 훈련부터 시작합니다." },
      { title: "노트테이킹", desc: "듣고 요약하는 과정을 단계별로 익힙니다." },
      { title: "말하기·쓰기 틀", desc: "통합형 문항의 답변 구조를 잡고 첨삭합니다." },
    ],
  },
  {
    slug: "ielts",
    name: "아이엘츠",
    language: "english",
    targetLine: "해외 대학·이민·취업 요건을 준비하는 분",
    prepPoints: [
      { title: "평가 기준 이해", desc: "밴드별 채점 기준에 맞춰 목표를 정합니다." },
      { title: "라이팅 첨삭", desc: "과제 유형별로 쓰고 고치는 과정을 반복합니다." },
      { title: "스피킹 인터뷰", desc: "실제 인터뷰 형식으로 연습하고 다듬습니다." },
    ],
  },
  {
    slug: "teps",
    name: "텝스",
    language: "english",
    targetLine: "국내 대학원·편입·기관 요건 점수가 필요한 분",
    prepPoints: [
      { title: "청해 적응", desc: "빠른 청해 속도에 단계적으로 적응합니다." },
      { title: "정밀 문법", desc: "텝스 특유의 문법·어휘 출제를 집중 정리합니다." },
      { title: "독해 배분", desc: "지문 난도별 시간 배분 전략을 연습합니다." },
    ],
  },
  {
    slug: "gtelp",
    name: "지텔프",
    language: "english",
    targetLine: "공무원·군무원 등 요건 등급이 필요한 분",
    prepPoints: [
      { title: "핵심 문법", desc: "출제 범위가 좁은 문법 핵심을 우선 정리합니다." },
      { title: "빈출 반복", desc: "자주 나오는 유형을 반복해 정답률을 올립니다." },
      { title: "최소 시간 전략", desc: "목표 등급 기준으로 학습 범위를 최적화합니다." },
    ],
  },
  /* ── 일본어 ───────────────────────────────────────────────────────── */
  {
    slug: "jlpt",
    name: "JLPT",
    language: "japanese",
    targetLine: "일본어 실력을 급수로 증명하려는 분",
    prepPoints: [
      { title: "급수 진단", desc: "현재 수준을 확인하고 목표 급수를 함께 정합니다." },
      { title: "단계 학습", desc: "문자·어휘·문법을 급수 기준으로 쌓아 갑니다." },
      { title: "실전 훈련", desc: "독해·청해 기출 유형으로 실전 감각을 만듭니다." },
    ],
  },
  {
    slug: "jpt",
    name: "JPT",
    language: "japanese",
    targetLine: "취업·인사 평가용 점수가 필요한 분",
    prepPoints: [
      { title: "파트 분석", desc: "파트별 출제 유형과 내 취약점을 먼저 확인합니다." },
      { title: "실무 표현", desc: "비즈니스 장면의 표현을 함께 익힙니다." },
      { title: "시간 관리", desc: "청해·독해의 실전 시간 배분을 연습합니다." },
    ],
  },
  {
    slug: "sjpt",
    name: "SJPT",
    language: "japanese",
    targetLine: "일본어 말하기 등급이 필요한 분",
    prepPoints: [
      { title: "답변 구성", desc: "문항별로 바로 쓰는 답변 틀을 만듭니다." },
      { title: "발음·억양", desc: "전달력을 떨어뜨리는 습관을 짚어 교정합니다." },
      { title: "모의 인터뷰", desc: "실전 형식 그대로 연습하고 피드백을 받습니다." },
    ],
  },
  /* ── 중국어 ───────────────────────────────────────────────────────── */
  {
    slug: "hsk",
    name: "HSK",
    language: "chinese",
    targetLine: "중국어 급수 취득이 필요한 분",
    prepPoints: [
      { title: "필수 어휘", desc: "목표 급수의 필수 어휘를 계획적으로 누적합니다." },
      { title: "균형 학습", desc: "듣기·독해·쓰기를 급수 기준으로 고르게 준비합니다." },
      { title: "기출 점검", desc: "기출 유형으로 실전 감각을 확인합니다." },
    ],
  },
  {
    slug: "hskk",
    name: "HSKK",
    language: "chinese",
    targetLine: "중국어 말하기 등급이 필요한 분",
    prepPoints: [
      { title: "성조·발음", desc: "소리의 기본기를 먼저 바로잡습니다." },
      { title: "유형 연습", desc: "낭독·묘사·응답 유형을 단계별로 연습합니다." },
      { title: "녹음 훈련", desc: "실전처럼 녹음하고 함께 다듬습니다." },
    ],
  },
  {
    slug: "tsc",
    name: "TSC",
    language: "chinese",
    targetLine: "취업·인사 평가용 중국어 말하기가 필요한 분",
    prepPoints: [
      { title: "답변 틀", desc: "문항 유형별 답변 구성을 만들어 둡니다." },
      { title: "성조 교정", desc: "평가에 영향을 주는 성조 습관을 교정합니다." },
      { title: "실전 모의", desc: "실제 진행 방식 그대로 모의 연습을 합니다." },
    ],
  },
];

/** slug → PowerExam 조회 맵. */
export const examBySlug: Map<string, PowerExam> = new Map(
  POWER_EXAMS.map((e) => [e.slug, e]),
);

/** 시험 slug 여부. */
export function isExamSlug(slug: string): boolean {
  return examBySlug.has(slug);
}

/** 언어 → 해당 언어 시험 목록. */
export function examsOfLanguage(language: PowerExam["language"]): PowerExam[] {
  return POWER_EXAMS.filter((e) => e.language === language);
}

/** 말하기 시험 slug(제목 문구 차별화: "1:1 말하기 시험 준비"). */
export const SPEAKING_EXAM_SLUGS: ReadonlySet<string> = new Set([
  "toeic-speaking",
  "opic",
  "sjpt",
  "hskk",
  "tsc",
]);

/** 언어 대표 시험(다른 언어 교차 링크용): 토익/JLPT/HSK. */
export const REPRESENTATIVE_EXAM_SLUG: Record<PowerExam["language"], string> = {
  english: "toeic",
  japanese: "jlpt",
  chinese: "hsk",
};

/** 언어 → 회화 과목 slug(같은 지역 회화 페이지 교차 링크용). */
export const LANGUAGE_CONVERSATION_SLUG: Record<PowerExam["language"], string> = {
  english: "english-conversation",
  japanese: "japanese-conversation",
  chinese: "chinese-conversation",
};

/** 언어 한글 표기(링크 그룹 라벨용). */
export const LANGUAGE_LABEL: Record<PowerExam["language"], string> = {
  english: "영어",
  japanese: "일본어",
  chinese: "중국어",
};

/**
 * 빌드시 title/description 길이 검증(모듈 로드 1회, 위반 시 빌드 실패).
 * 규칙: 앞 25자 안에 "{지역} {시험명} 과외", title ≤ 60자, desc ≤ 160자.
 * 최장 지역명(보수적 상한)으로 검사 — 실제 시험 지역(시군구, ≤7자)보다 길게 잡는다.
 */
const ASSERT_MAX_REGION = "전농답십리뉴타운"; // 8자(보수적 상한)
for (const e of POWER_EXAMS) {
  if (!EXAM_META[e.slug]) throw new Error(`[exams] EXAM_META 누락: ${e.slug}`);
  const front = `${ASSERT_MAX_REGION} ${e.name} 과외`;
  const title = buildExamTitle(ASSERT_MAX_REGION, e);
  const desc = buildExamDescription(ASSERT_MAX_REGION, e);
  if ([...front].length > 25) throw new Error(`[exams] "{지역} {시험명} 과외" >25자(${[...front].length}): ${front}`);
  if ([...title].length > 60) throw new Error(`[exams] title >60자(${[...title].length}): ${title}`);
  if ([...desc].length > 160) throw new Error(`[exams] desc >160자(${[...desc].length}): ${desc}`);
}
