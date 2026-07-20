/**
 * 지역 상세(by-region/[sido])의 과목 탭 목록 — subjects.ts 에서 파생(라벨 단일 소스).
 *
 * 순서·후보는 아래 REGION_SUBJECT_TAB_SLUGS 로만 관리하고, 라벨은 subjects.ts 에서 읽는다.
 * subjects.ts 에 없는 slug 는 자동 제외된다. 이 slug 체계는 지역×과목 상세 라우트
 * (by-region/[sido]/[시군구]/[동]/[과목] 의 sidoRegions 분기)가 받는 영문 slug 와 같으므로,
 * 탭 선택 시 유효한 동×과목 URL 이 만들어진다.
 */
import { subjectBySlug } from "@/data/subjects";

/** 탭 노출 순서(존재하는 과목만). 과학은 이 목록에 없으므로 탭에 노출하지 않는다. */
const REGION_SUBJECT_TAB_SLUGS = [
  "korean",
  "english",
  "math",
  "social",
  "history",
  "essay",
  "coding",
] as const;

export type RegionSubjectTab = { slug: string; label: string };

/** 존재하는 과목만 순서대로 — 라벨은 subjects.ts 기준. */
export const regionSubjectTabs: RegionSubjectTab[] = REGION_SUBJECT_TAB_SLUGS.map(
  (slug) => subjectBySlug[slug],
)
  .filter((s): s is NonNullable<typeof s> => Boolean(s))
  .map((s) => ({ slug: s.slug, label: s.label }));
