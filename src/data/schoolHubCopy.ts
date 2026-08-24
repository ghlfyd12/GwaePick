/**
 * 학교 단위 허브(/tutoring/by-school/{학교}, 과목 없음) 카피 단일 소스(신규).
 *
 * 과목 중립 문안 — 과목별 상세로 내부 링크를 뿌리는 노드. 고교 파일럿.
 * 워딩 규칙: 컨설턴트/멘토/강사 금지, 느낌표 금지, 과장·성과 보장 금지,
 *   키워드 나열 줄(태그 라인) 금지. "선생님/상담/준비합니다" 톤.
 */

/** 허브 과목 카드 대상 — 고교 핵심 5과목(국·영·수·사·과) slug. */
export const HUB_SUBJECT_SLUGS: readonly string[] = [
  "korean",
  "english",
  "math",
  "social",
  "science",
];

/** 과목 중립 도입 문단 — {displayName}=정식명(없으면 약칭), {sigunguName}=시군구. */
export function buildHubIntro(displayName: string, sigunguName: string): string {
  return `${displayName} 재학생을 위한 1:1 맞춤 과외 안내입니다. 아래에서 과목을 고르면 해당 과목 상세로 이동합니다. 직접 가르쳐 온 선생님이 ${sigunguName}의 학교 진도와 시험 범위를 상담에서 확인해, ${displayName} 학생에게 맞는 선생님을 연결해 드립니다.`;
}

/** 과목 카드 아래 안내 문단 — 과목 선택을 돕는 과목 중립 문장. */
export function buildHubGuide(displayName: string): string {
  // displayName 은 …고/…고등학교로 끝나 받침이 없다 → 조사 "는".
  return `${displayName}는 과목마다 시험 범위와 준비 방식이 다릅니다. 어떤 과목의 어떤 선생님이 맞을지 막막하다면, 상담에서 현재 상황을 듣고 함께 정합니다.`;
}
