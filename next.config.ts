import type { NextConfig } from "next";

/*
 * 슬래시 없는 사이트맵 별칭 개수 — 사이트맵 파일 수(코어 1 + 학교 청크)와 같아야 한다.
 * 값은 src/lib/schoolSitemap.ts 의 TOTAL_SITEMAP_COUNT 와 동기화한다(현재 4: id 0~3).
 * next.config 는 @/ 별칭 import 를 해석하지 못하므로 상수로 명시한다.
 */
const SITEMAP_ALIAS_COUNT = 4;

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // 파일시스템 라우팅보다 먼저 적용 — /sitemap.xml 을 사이트맵 인덱스 라우트로 서빙.
      // (generateSitemaps 는 /sitemap/[id].xml 청크만 만들고 /sitemap.xml 은 제공하지 않음)
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
        // 슬래시 없는 루트 별칭 → 기존 청크로 연결. 네이버 서치어드바이저가 "sitemap/0.xml"
        // 형식(경로 슬래시)을 거부하므로 /sitemap-0.xml ~ 형태를 함께 제공한다.
        ...Array.from({ length: SITEMAP_ALIAS_COUNT }, (_, i) => ({
          source: `/sitemap-${i}.xml`,
          destination: `/sitemap/${i}.xml`,
        })),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
