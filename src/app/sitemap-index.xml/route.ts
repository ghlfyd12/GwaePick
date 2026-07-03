import { site } from "@/data/site";
import { TOTAL_SITEMAP_COUNT } from "@/lib/schoolSitemap";

/*
 * 사이트맵 인덱스(<sitemapindex>) — 분할된 /sitemap/[id].xml 청크 전부를 한 곳에 나열한다.
 *
 * Next.js 는 generateSitemaps 사용 시 /sitemap.xml 인덱스를 자동 제공하지 않으므로,
 * 이 라우트가 인덱스 XML 을 만들고 next.config.ts 의 rewrite 가 /sitemap.xml → 이 경로로 연결한다.
 * (검색엔진에 제출하는 대표 URL 은 /sitemap.xml 하나면 된다.)
 */
export const dynamic = "force-static";

export function GET() {
  const base = site.url.replace(/\/$/, "");
  const lastmod = new Date().toISOString();

  const entries = Array.from({ length: TOTAL_SITEMAP_COUNT }, (_, i) =>
    `  <sitemap>\n    <loc>${base}/sitemap/${i}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
