/**
 * 학교 학교급(level) 오배정 교정 오버라이드 — 동명 학교 dedup 과정에서 산발적으로 잘못 배정된
 * level 을 slug 단위로 바로잡는다. schools.ts(자동 생성)는 직접 수정하지 않고 이 맵으로 덮어쓴다.
 *
 * 적용 지점: lib/findSchool.ts 의 findSchoolBySlug 반환 직전. 교정된 level 이
 * LEVEL_LABEL(라벨)·isElem(히어로 이미지)·메타·FAQ·JSON-LD·배너 문구까지 일괄 반영된다.
 *
 * 근거: 교명 접미사(초/중/고)와 level 불일치 전수 검사(12,097교)에서 확인된 5건.
 *   각 항목은 동명 학교의 정상 level 형제가 따로 존재한다(예: gyeongbukgwahakgo-pohangsi=high).
 * 근본 수정(생성기 재실행)은 별도 후속 과제. "서초호"·"공부방" 등 비학교 노이즈는
 *   정답 level 이 없어 여기 포함하지 않는다(임의 배정 금지).
 */
import type { SchoolLevel } from "@/data/schools";

export const SCHOOL_LEVEL_OVERRIDES: Record<string, SchoolLevel> = {
  gyeongbukgwahakgo: "high", // 경북과학고(경북 김천시) — elem 오배정 → high
  hangukmiraenongeopgo: "high", // 한국미래농업고(경북 상주시) — middle 오배정 → high
  "nammyeonjung-seogu": "middle", // 남면중(광주 서구) — elem 오배정 → middle
  yongsancho2: "elem", // 용산초(전남 장흥군) — middle 오배정 → elem
  yuchicho2: "elem", // 유치초(전남 장흥군) — middle 오배정 → elem
};

/** slug 의 교정 level(있으면), 없으면 undefined. */
export function overrideSchoolLevel(slug: string): SchoolLevel | undefined {
  return SCHOOL_LEVEL_OVERRIDES[slug];
}
