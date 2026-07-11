/**
 * 시/도의 전체 학교를 가나다순 평탄 목록으로. 학교 브라우저(기본 목록)와 페이지네이션 페이지가
 * 동일한 순서를 공유하도록 단일 함수로 둔다(page 1 과 /p/[n] 슬라이스 경계 일치 보장).
 * 타입만 import — 클라이언트 번들 안전.
 */
import type { SchoolSido, SchoolLevel } from "@/data/schools";

export type FlatSchool = {
  name: string;
  slug: string;
  level: SchoolLevel;
  /** 시군구 이름(카드 보조 표기). */
  sigungu: string;
  sigunguSlug: string;
};

export function flatSchoolsOfSido(sido: SchoolSido): FlatSchool[] {
  return [...sido.sigungu]
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .flatMap((sg) =>
      sg.schools.map((s) => ({
        name: s.name,
        slug: s.slug,
        level: s.level,
        sigungu: sg.name,
        sigunguSlug: sg.slug,
      })),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
