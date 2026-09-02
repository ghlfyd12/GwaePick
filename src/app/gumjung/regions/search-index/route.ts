import { buildGumjungRegionSearchIndex } from "@/data/gumjungSearch";

/*
 * /gumjung/regions/search-index — 지역 검색 인덱스(경량 JSON) 정적 라우트.
 * 빌드 시 1회 생성(force-static)해 정적 자산으로 서빙. 클라이언트 검색창이 첫 상호작용 때 지연 fetch.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildGumjungRegionSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
