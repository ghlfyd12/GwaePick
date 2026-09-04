/**
 * 고교 세부과목(과탐 4) 사이트맵 — 고교 2,457 × 4 = 9,828 URL(1 chunk).
 * 항상 사이트맵 맨 뒤 id 로 append → 기존 shard id 불변. schools/HIGH_SCHOOL_HUB_SLUGS 재사용.
 */
import { SITEMAP_URLS_PER_FILE, HIGH_SCHOOL_HUB_SLUGS } from "@/lib/schoolSitemap";
import { HIGH_DETAIL_SLUGS } from "@/data/highDetailSubjects";

export const HIGH_DETAIL_URL_COUNT =
  HIGH_SCHOOL_HUB_SLUGS.length * HIGH_DETAIL_SLUGS.length;

export const HIGH_DETAIL_SITEMAP_CHUNKS = Math.max(
  1,
  Math.ceil(HIGH_DETAIL_URL_COUNT / SITEMAP_URLS_PER_FILE),
);

/** 평탄화된 (고교, 세부과목) 쌍 인덱스 → slug 쌍. */
export function highDetailPairAt(p: number): { school: string; subject: string } {
  const n = HIGH_DETAIL_SLUGS.length;
  return {
    school: HIGH_SCHOOL_HUB_SLUGS[Math.floor(p / n)],
    subject: HIGH_DETAIL_SLUGS[p % n],
  };
}
