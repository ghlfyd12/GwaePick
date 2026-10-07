/**
 * 학교×과목 title A안 파일럿 — 범위·문구 단일 소스.
 *
 * 배경(2026-10-07 진단): 학교×과목 96,776장의 title 꼬리가 **고유 20종**뿐이라 한 꼬리를
 * 2,457~12,097장이 공유한다. 변별 요소가 학교 약칭 하나뿐이고 지역 토큰은 동명이교(36.3%)에만
 * 붙어, 유사문서 판정에 취약하다. A안은 **소속 시군구를 전 학교 title 접두로 주입**해 꼬리 조합을
 * 시군구(234종) 축으로 분산하고, 동시에 "{시군구} {과목}과외" 검색어를 학교 페이지가 함께 잡게 한다.
 *
 * 전면 교체(96,776장)는 재통지만 194 chunk(13회차+)라, **대전 고교 65교 × 8과목 = 520장**
 * 파일럿으로 먼저 적용하고 2주 관찰 후 확대를 판정한다. 그 외 학교·타 축은 현행 title 그대로다.
 *
 * description 은 **의도적으로 무변경** — title 효과만 분리 측정하기 위한 변수 통제다.
 */
import { resolveTitlePhrase, type TitleLevel } from "@/data/seoTitlePhrases";

/** 파일럿 대상 시도(schools.ts 의 sido slug). */
export const TITLE_PILOT_SIDO_SLUG = "daejeon";
/** 파일럿 대상 학교급. */
export const TITLE_PILOT_LEVEL: TitleLevel = "high";
/**
 * 브랜드 꼬리를 뺀 본문 title 길이 상한.
 * **full 타입 과목(논술·코딩)은 이 상한에서 제외**한다 — 아래 buildPilotTitleCore 주석 참고.
 */
export const TITLE_PILOT_MAX_LEN = 40;

/** 학교급별 학년 토큰 — title 용(띄어쓰기 분리로 부분일치 검색 폭을 넓힌다). */
const PILOT_GRADE_TOKENS: Record<TitleLevel, string> = {
  high: "고1 고2 고3",
  middle: "중1 중2 중3",
  elem: "초4 초5 초6",
};

/** 이 조합이 파일럿 대상인가. 범위를 넓힐 때 이 함수만 고친다. */
export function isTitlePilot(sidoSlug?: string, level?: TitleLevel): boolean {
  return sidoSlug === TITLE_PILOT_SIDO_SLUG && level === TITLE_PILOT_LEVEL;
}

/**
 * A안 본문 title(브랜드 꼬리 제외).
 *   "{시군구} {학교} {과목}과외 - 내신 기출 {학년구} 1:1"
 *
 * 시군구를 접두로 쓰므로 동명이교용 지역 접두(regionShort)는 **붙이지 않는다**(이중 접두 방지).
 * 상한(40자)을 넘으면 학년구를 떼어 안전하게 줄인다 — 전수 점검상 대전 고교에서는 발생하지 않지만,
 * 범위를 넓혔을 때 긴 시군구·학교명 조합에서 title 이 터지지 않도록 둔 폴백이다.
 *
 * **예외 — full 타입 과목(논술·코딩)**: 이 두 과목은 문구 자체에 과목 고유 롱테일이 들어 있다
 * ("파이썬 자바스크립트 웹개발 게임제작 정보내신", "독서 첨삭"). A안 공통 꼬리로 덮으면 그 키워드를
 * 통째로 잃으므로, **기존 full 문구를 그대로 두고 {시군구} 접두만 주입**한다. 원래 40자를 넘는
 * 문구라 이 두 과목에 한해 상한을 적용하지 않는다(현행 길이 유지 허용). 유사문서 분산 목적은
 * 시군구 접두만으로도 달성된다.
 */
export function buildPilotTitleCore(p: {
  sigunguName: string;
  schoolName: string;
  subjectLabel: string;
  subjectSlug?: string;
  level: TitleLevel;
}): string {
  // full 타입(논술·코딩): 기존 문구 유지 + 시군구 접두만. 상한 미적용.
  const phrase = resolveTitlePhrase({ slug: p.subjectSlug, label: p.subjectLabel, level: p.level });
  if (phrase.type === "full") {
    return `${p.sigunguName} ${p.schoolName} ${phrase.text}`;
  }
  const head = `${p.sigunguName} ${p.schoolName} ${p.subjectLabel}과외`;
  const full = `${head} - 내신 기출 ${PILOT_GRADE_TOKENS[p.level]} 1:1`;
  if (full.length <= TITLE_PILOT_MAX_LEN) return full;
  const short = `${head} - 내신 기출 1:1`;
  return short.length <= TITLE_PILOT_MAX_LEN ? short : head;
}
