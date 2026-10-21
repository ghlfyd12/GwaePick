/**
 * 학교×과목 title A안 파일럿 — 범위·문구 단일 소스.
 *
 * 배경(2026-10-07 진단): 학교×과목 96,776장의 title 꼬리가 **고유 20종**뿐이라 한 꼬리를
 * 2,457~12,097장이 공유한다. 변별 요소가 학교 약칭 하나뿐이고 지역 토큰은 동명이교(36.3%)에만
 * 붙어, 유사문서 판정에 취약하다. A안은 **소속 시군구를 전 학교 title 접두로 주입**해 꼬리 조합을
 * 시군구(234종) 축으로 분산하고, 동시에 "{시군구} {과목}과외" 검색어를 학교 페이지가 함께 잡게 한다.
 *
 * **2026-10-21 전면 확대** — 10/20 조기 판독에서 실험군(신탄진고)은 A안 title 이 네이버 SERP 에
 * 반영되고 순위도 유지됐고, 무처치군(가평고)은 하락이 관찰됐다. 방치 비용이 실재하므로 파일럿을
 * 조기 종결하고 **전 학교 12,097교 × 8과목 = 96,776장**으로 확대한다.
 *
 * description 은 **의도적으로 무변경** — title 효과만 분리 측정하기 위한 변수 통제다.
 */
import { resolveTitlePhrase, type TitleLevel } from "@/data/seoTitlePhrases";

/** 파일럿 식별용(이력 보존) — 2026-10-09 통지한 실험군 범위. 지금은 범위 판정에 쓰지 않는다. */
export const TITLE_PILOT_SIDO_SLUG = "daejeon";
export const TITLE_PILOT_LEVEL: TitleLevel = "high";
/**
 * 브랜드 꼬리를 뺀 본문 title 길이 상한.
 * **full 타입 과목(논술·코딩)은 이 상한에서 제외**한다 — 아래 buildPilotTitleCore 주석 참고.
 */
export const TITLE_PILOT_MAX_LEN = 40;

/**
 * 학교급별 평가·학년 토큰 — title 용(띄어쓰기 분리로 부분일치 검색 폭을 넓힌다).
 *
 * 파일럿(고교)은 "내신 기출 고1 고2 고3" 한 벌이었는데, 전국 확대에는 초·중까지 들어온다.
 * 초등에 "내신 기출"을 붙이면 사실과 맞지 않아(초등은 단원평가 체계) 학교급별로 평가어를 갈랐다.
 */
const TITLE_LEVEL_TOKENS: Record<TitleLevel, string> = {
  high: "내신 기출 고1 고2 고3",
  middle: "내신 수행평가 중1 중2 중3",
  elem: "단원평가 초4 초5 초6",
};

/** A안 적용 대상인가 — 2026-10-21 부터 **전 학교**다(파일럿 종료). */
export function isTitlePilot(): boolean {
  return true;
}

/**
 * A안 본문 title(브랜드 꼬리 제외).
 *   "{시군구} {학교} {과목}과외 - {학교급 평가어} {학년구} 1:1"
 *
 * 시군구를 접두로 쓰므로 동명이교용 지역 접두(regionShort)는 **붙이지 않는다**(이중 접두 방지).
 * 상한(40자)을 넘으면 학년구를, 그래도 넘으면 평가어까지 떼어 안전하게 줄인다(2단 폴백).
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
  const full = `${head} - ${TITLE_LEVEL_TOKENS[p.level]} 1:1`;
  if (full.length <= TITLE_PILOT_MAX_LEN) return full;
  // 상한 초과 시 학년 토큰을 떼고, 그래도 넘으면 평가어까지 뗀다(긴 시군구+긴 교명 조합 대비).
  const evalWord = TITLE_LEVEL_TOKENS[p.level].split(" ").slice(0, p.level === "elem" ? 1 : 2).join(" ");
  const short = `${head} - ${evalWord} 1:1`;
  return short.length <= TITLE_PILOT_MAX_LEN ? short : head;
}
