/**
 * /power/schools(학교별 안내 인덱스) 데이터 — 41교를 시도별 그룹으로 묶고,
 * 각 학교의 수행평가(언어별) + 어학과목(과목별) 링크를 생성한다.
 *
 * offered && verified 조합만 링크를 만든다(미개설·제외 학교는 자동 배제 — powerSchoolDepts 게이트).
 * 콘텐츠·라우트는 기존 단일 소스 재사용(하드코딩 금지).
 */
import {
  powerSchoolDepts,
  getPowerSchoolEntry,
  offeredLangs,
  POWER_LANG_LABEL,
} from "@/data/powerSchoolDepts";
import { POWER_SUBJECTS, isBySchoolAllowed } from "@/data/bySchoolSubject";
import { findSchoolBySlug } from "@/lib/findSchool";

export type SchoolIndexLink = { label: string; href: string };
export type SchoolIndexItem = {
  slug: string;
  name: string;
  regionName: string;
  /** 수행평가(유형 B) 언어별 링크. */
  performanceLinks: SchoolIndexLink[];
  /** 어학과목(유형 A) 과목별 링크. */
  subjectLinks: SchoolIndexLink[];
};
export type SchoolIndexGroup = { sidoLabel: string; schools: SchoolIndexItem[] };

/** 41교를 시도별 그룹으로. 시도 순서·학교 순서는 powerSchoolDepts 등장 순서 유지. */
export function powerSchoolsBySido(): SchoolIndexGroup[] {
  const groups: SchoolIndexGroup[] = [];
  const bySido = new Map<string, SchoolIndexItem[]>();

  for (const entry of powerSchoolDepts) {
    if (!getPowerSchoolEntry(entry.schoolSlug)) continue; // 제외 학교 방어
    const ctx = findSchoolBySlug(entry.schoolSlug);
    if (!ctx) continue;

    const performanceLinks: SchoolIndexLink[] = offeredLangs(entry.schoolSlug).map(
      (lang) => ({
        label: `${POWER_LANG_LABEL[lang]} 수행평가`,
        href: `/power/performance/${entry.schoolSlug}/${lang}`,
      }),
    );
    const subjectLinks: SchoolIndexLink[] = POWER_SUBJECTS.filter((s) =>
      isBySchoolAllowed(entry.schoolSlug, s.slug),
    ).map((s) => ({
      label: s.label,
      href: `/power/by-school/${entry.schoolSlug}/${s.slug}`,
    }));

    const item: SchoolIndexItem = {
      slug: entry.schoolSlug,
      name: ctx.school.name,
      regionName: ctx.sigunguName,
      performanceLinks,
      subjectLinks,
    };

    if (!bySido.has(ctx.sidoLabel)) {
      const arr: SchoolIndexItem[] = [];
      bySido.set(ctx.sidoLabel, arr);
      groups.push({ sidoLabel: ctx.sidoLabel, schools: arr });
    }
    bySido.get(ctx.sidoLabel)!.push(item);
  }

  return groups;
}
