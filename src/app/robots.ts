import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { TOTAL_SITEMAP_COUNT } from "@/lib/schoolSitemap";

/*
 * 동적 robots.txt — /robots.txt 로 노출.
 * 전체 색인 허용(학교 페이지 포함) + 분할 사이트맵 전부(/sitemap/[id].xml)를 명시한다.
 * Next.js 는 generateSitemaps 사용 시 인덱스(/sitemap.xml)를 자동 제공하지 않으므로,
 * 각 사이트맵 파일 URL 을 robots 에 직접 나열해 구글봇·네이버가 모두 발견하게 한다.
 */
export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  // id 0(코어) + 학교 청크 1..N. 분할 수가 늘어도 자동 반영(단일 소스).
  const sitemaps = Array.from(
    { length: TOTAL_SITEMAP_COUNT },
    (_, i) => `${base}/sitemap/${i}.xml`,
  );
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 추적 파라미터가 붙은 중복 URL 은 색인에서 제외(정규 URL = canonical).
      disallow: ["/*?*utm_", "/*?*fbclid", "/*?*gclid"],
    },
    sitemap: sitemaps,
    host: base,
  };
}
