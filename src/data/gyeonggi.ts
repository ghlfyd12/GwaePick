/**
 * 경기 지역(시/군/구 → 동) 헬퍼.
 *
 * 데이터는 gyeonggi-regions.json 에서만 가져온다(하드코딩 금지).
 * slug 는 한글(시군구는 공백→하이픈, 동은 한글명 그대로). 추후 영문 슬러그는 JSON 교체로 대응.
 */
import regions from "./gyeonggi-regions.json";

export type Dong = { name: string; slug: string };
export type Sigungu = { name: string; slug: string; dongs: Dong[] };

export const gyeonggi = regions as {
  sido: string;
  sidoLabel: string;
  sigungu: Sigungu[];
};

export const sigunguBySlug: Record<string, Sigungu> = Object.fromEntries(
  gyeonggi.sigungu.map((s) => [s.slug, s]),
);

export function findDong(sigunguSlug: string, dongSlug: string): Dong | undefined {
  return sigunguBySlug[sigunguSlug]?.dongs.find((d) => d.slug === dongSlug);
}
