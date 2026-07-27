import { buildPowerRegionSearchIndex } from "@/data/powerRegionSearch";

/*
 * /power/regions/search-index — 지역 검색 인덱스(경량 JSON) 정적 라우트.
 *
 * 빌드 시 1회 생성(force-static)해 정적 자산으로 서빙한다. 클라이언트 검색창이
 * 첫 상호작용 때 지연 fetch 한다(초기 번들에 대량 데이터 미포함).
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildPowerRegionSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
