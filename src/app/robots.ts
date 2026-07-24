import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { TOTAL_SITEMAP_COUNT } from "@/lib/powerRegionSitemap";

/*
 * 동적 robots.txt — /robots.txt 로 노출.
 * 전체 색인 허용(학교 페이지 포함) + 사이트맵 지시자를 절대 URL 로 명시한다.
 *  - /sitemap.xml            : 인덱스(next.config rewrite 로 /sitemap-index.xml 서빙).
 *  - /sitemap-0.xml ~ N.xml  : 슬래시 없는 루트 별칭(next.config rewrite 로 /sitemap/[id].xml 로 연결).
 *    네이버 서치어드바이저가 경로에 슬래시가 든 "sitemap/0.xml" 을 거부하므로 별칭을 함께 노출한다.
 * 인덱스만 제출해도 청크가 나열되지만, 네이버 호환을 위해 별칭도 모두 명시한다.
 */
export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");

  // 청크 파일 개수(코어 1 + 학교 청크)만큼 슬래시 없는 별칭을 나열 — sitemap.ts 와 동일 소스.
  const chunkAliases = Array.from(
    { length: TOTAL_SITEMAP_COUNT },
    (_, i) => `${base}/sitemap-${i}.xml`,
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 추적 파라미터가 붙은 중복 URL 은 색인에서 제외(정규 URL = canonical).
      disallow: ["/*?*utm_", "/*?*fbclid", "/*?*gclid"],
    },
    sitemap: [`${base}/sitemap.xml`, ...chunkAliases],
    host: base,
  };
}
