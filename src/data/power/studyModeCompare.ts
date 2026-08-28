/**
 * 어학의참견(/power) — "학원과 1:1 과외" 비교 섹션 카피 빌더(신규, additive).
 *
 * 지역×회화(ByRegionDetail)·지역×시험(ByRegionExamDetail) 상세 본문에 학원 수업 방식 일반과
 * 1:1 과외의 진행 방식을 사실적으로 대비하는 섹션을 렌더한다. "{언어} 학원", "{지역} {언어} 학원",
 * "성인 {언어} 기초", "{언어} 학원 대신 과외" 검색 조합을 각 1회씩 커버(밀도 반복 금지 — 조합당 1회).
 *
 * 워딩 경계(지침서 ⑥ — 필수):
 *  - 특정 학원 상호를 실제 업체명으로 지칭·비교 금지. "학원"은 일반 형태(수업 방식 일반)로만 대비.
 *  - 학원을 깎아내리는 단정 금지("학원은 관리가 안 된다" 류). 사실 대비 서술만.
 *  - title·og·description 에는 "학원"을 넣지 않는다(어학원이 아님) — 본문 섹션만.
 *  - 느낌표·컨설턴트/멘토/강사·원어민 없음. 색은 accent 토큰(퍼플)만 — 컴포넌트에서 처리.
 */

/** /power 언어 키 → 표기 언어(조합의 "{언어}"). */
export type PowerLangKey = "english" | "japanese" | "chinese";

const LANG_LABEL: Record<PowerLangKey, string> = {
  english: "영어",
  japanese: "일본어",
  chinese: "중국어",
};

export interface CompareSection {
  /** h2. */
  heading: string;
  /** 본문 문단(사실 대비, 검색 조합 각 1회). */
  paragraphs: string[];
  /** 말미 상담 연결 1문장(섹션 내 CTA 버튼 없음 — 단일 CTA 원칙). */
  closing: string;
}

const HEADING = "학원과 1:1 과외, 무엇이 다를까요";

/**
 * 언어 + 지역명 → 비교 섹션 카피.
 * lang 이 대상 언어가 아니면 null(방어).
 */
export function buildCompareSection(lang: string, regionName: string): CompareSection | null {
  const L = LANG_LABEL[lang as PowerLangKey];
  if (!L) return null;

  const paragraphs = [
    // "{지역} {언어} 학원" 1회
    `${regionName}에서 ${L}를 시작할 때 ${regionName} ${L} 학원을 먼저 떠올리는 분이 많습니다.`,
    // 사실 대비(지침서 모델 문장) — 학원은 일반 형태, 깎아내림 없음
    `학원은 정해진 진도와 시간표로 여러 명이 함께 진행되고, 1:1 과외는 수강생의 수준과 일정에 맞춰 진행됩니다. 어느 쪽이 더 낫다기보다, 지금 필요한 진행 방식이 무엇인지에 달려 있습니다.`,
    // "{언어} 학원"·"성인 {언어} 기초" 각 1회 — 학원 장점도 사실 인정
    `${L} 학원은 이미 어느 정도 익힌 분이 정해진 커리큘럼을 따라가기에 좋고, 성인 ${L} 기초처럼 처음부터 천천히 잡아야 할 때는 1:1 과외로 속도와 분량을 맞추기가 수월합니다.`,
  ];

  // "{언어} 학원 대신 과외" 1회 + 상담 연결
  const closing = `${L} 학원 대신 과외를 고민 중이라면, 상담에서 지금 수준과 목표를 듣고 어떤 방식이 맞을지 함께 정리해 드립니다.`;

  return { heading: HEADING, paragraphs, closing };
}
