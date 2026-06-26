import { buildRegionSearchIndex } from "@/lib/regionSearch";
import { subjects } from "@/data/subjects";

/*
 * 히어로 빠른 검색의 탭별 인덱스 빌더. 검색 매칭은 공통 함수 searchRegions(regionSearch.ts) 재사용.
 * searchKind 에 따라 인덱스 소스만 교체한다(중복 구현 금지).
 */

export type HeroSearchKind = "region" | "school" | "subject";

export interface HeroSearchItem {
  kind: string;
  label: string;
  sub: string;
  href: string;
  key: string;
}

/** 과목 인덱스 — subjects.ts 8과목. 목적지 = 과목별 독립 상세 페이지(/by-subject/{slug}). */
function buildSubjectSearchIndex(): HeroSearchItem[] {
  return subjects.map((s) => ({
    kind: "subject",
    label: s.label,
    sub: "과목",
    href: `/tutoring/by-subject/${s.slug}`,
    key: `subject:${s.slug}`,
  }));
}

/**
 * 학교 인덱스 — 개별 학교 데이터가 아직 프로젝트에 없어 비워 둔다(가짜 학교명 금지).
 * 학교 데이터가 생기면 이 함수만 실제 인덱스로 교체하면 된다.
 */
function buildSchoolSearchIndex(): HeroSearchItem[] {
  return [];
}

export function buildHeroIndex(kind: HeroSearchKind): HeroSearchItem[] {
  if (kind === "region") return buildRegionSearchIndex();
  if (kind === "subject") return buildSubjectSearchIndex();
  return buildSchoolSearchIndex();
}

/** 드롭다운 우측 종류 태그. */
export const KIND_TAG: Record<string, string> = {
  dong: "동",
  sigungu: "시·군·구",
  sido: "시·도",
  subject: "과목",
  school: "학교",
};
