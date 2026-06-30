import { SCHOOLS } from "@/data/schools";
import { subjects as detailSubjects } from "@/data/subjects";

/*
 * 학교×과목 사이트맵 분할 공용 로직(sitemap.ts·robots.ts 공유 단일 소스).
 *
 * 전국 학교(약 12,097개) × 과목(8) ≈ 9.6만 URL → 사이트맵 1개 5만 한도를 넘으므로
 * URLS_PER_FILE 단위로 청크 분할한다. 사이트맵 id 0=코어, 1..N=학교 청크.
 */

/** 사이트맵 1개당 URL 상한(스펙 한도 50,000 보다 보수적으로). */
export const SITEMAP_URLS_PER_FILE = 40_000;

/** 전국 학교 평탄화(시도→시군구→학교). 모듈 1회 계산. */
const ALL_SCHOOLS = SCHOOLS.flatMap((sido) =>
  sido.sigungu.flatMap((sg) => sg.schools),
);

/** 학교 × 과목 조합 총 개수. */
export const SCHOOL_PAIR_COUNT = ALL_SCHOOLS.length * detailSubjects.length;

/** 학교 청크 수(최소 1). */
export const SCHOOL_SITEMAP_CHUNKS = Math.max(
  1,
  Math.ceil(SCHOOL_PAIR_COUNT / SITEMAP_URLS_PER_FILE),
);

/** 전체 사이트맵 파일 개수(코어 1 + 학교 청크). */
export const TOTAL_SITEMAP_COUNT = SCHOOL_SITEMAP_CHUNKS + 1;

/** 평탄화된 (학교,과목) 쌍 인덱스 → 실제 학교·과목. */
export function schoolPairAt(p: number) {
  const subjectCount = detailSubjects.length;
  return {
    school: ALL_SCHOOLS[Math.floor(p / subjectCount)],
    subject: detailSubjects[p % subjectCount],
  };
}
