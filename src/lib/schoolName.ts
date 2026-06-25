/**
 * 학교 약칭 → 정식명 변환(안전 목록 방식).
 * 확신할 때만 변환하고, 위험하거나 규칙 밖이면 null(정식명 없음 → 약칭만 사용).
 *
 * 검사 순서가 핵심이다 — 반드시 [1] → [2] → [3] 순서로 검사한다:
 *  [1] 위험 접미사(사대부고·대부고·상고)는 변환하지 않고 null.
 *  [2] 구체 접미사는 "긴 것부터"(예: "항공고"가 "공고"보다 먼저).
 *  [3] 일반 변환(초/중/고).
 * 예) "강남여고"를 [3]의 "고"로 먼저 처리하면 "강남여고등학교"가 되므로,
 *     반드시 [2]의 "여고"를 먼저 만나 "강남여자고등학교"가 되어야 한다.
 */
export function expandSchoolName(name: string): string | null {
  // [1단계] 위험 접미사 → 약칭만 사용(정식명 null)
  const ABBR_ONLY = ["사대부고", "대부고", "상고"];
  for (const s of ABBR_ONLY) if (name.endsWith(s)) return null;

  // [2단계] 구체 접미사(긴 것부터) — "항공고"는 "공고"보다 먼저여야 한다
  const SPECIFIC: [string, string][] = [
    ["항공고", "항공고등학교"],
    ["여중", "여자중학교"],
    ["여고", "여자고등학교"],
    ["외고", "외국어고등학교"],
    ["과고", "과학고등학교"],
    ["예고", "예술고등학교"],
    ["공고", "공업고등학교"],
  ];
  for (const [suf, full] of SPECIFIC)
    if (name.endsWith(suf)) return name.slice(0, name.length - suf.length) + full;

  // [3단계] 일반 변환
  const GENERAL: [string, string][] = [
    ["초", "초등학교"],
    ["중", "중학교"],
    ["고", "고등학교"],
  ];
  for (const [suf, full] of GENERAL)
    if (name.endsWith(suf)) return name.slice(0, name.length - suf.length) + full;

  return null; // 규칙 밖 → 정식명 없음(약칭만 사용)
}
