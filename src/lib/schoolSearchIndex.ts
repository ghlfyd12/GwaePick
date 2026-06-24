import { SCHOOLS, LEVEL_LABEL } from "@/data/schools";
import { schoolHref } from "@/lib/schoolHref";
import type { HeroSearchItem } from "@/lib/heroSearch";

/*
 * 전국 학교 검색 인덱스(약 1.2만 개). schools.ts(730KB)를 끌어오므로 이 모듈은
 * QuickSearch 에서 **동적 import** 로만 로드(초기 클라이언트 번들 비대화 방지).
 */
export function buildSchoolSearchIndex(): HeroSearchItem[] {
  const items: HeroSearchItem[] = [];
  for (const sido of SCHOOLS) {
    for (const sg of sido.sigungu) {
      for (const sc of sg.schools) {
        items.push({
          kind: "school",
          label: sc.name,
          sub: `${sg.name} · ${sido.label} · ${LEVEL_LABEL[sc.level]}`,
          href: schoolHref(sido.slug, sg.slug, sc),
          key: `school:${sido.slug}:${sg.slug}:${sc.slug}`,
        });
      }
    }
  }
  return items;
}
