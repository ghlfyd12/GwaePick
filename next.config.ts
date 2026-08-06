import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 동적 썸네일 라우트(/api/thumb)가 서버리스 함수 번들에 Pretendard 서브셋 폰트·배경
  // 이미지를 포함하도록 파일 추적에 명시(process.cwd() 기준 fs 읽기 대상). 없으면 Vercel 에서
  // ENOENT 로 렌더 실패할 수 있어 로컬 검증과 동일하게 배포에서도 파일을 확보한다.
  outputFileTracingIncludes: {
    "/api/thumb/[type]/[slug]/[subject]": [
      "./src/fonts/Pretendard-Bold-subset.ttf",
      "./public/images/school-students.png",
    ],
  },
  // 네이버 블로그 RSS 썸네일 호스트 허용(next/image). 썸네일은 unoptimized 로도 렌더하지만
  // 호스트 허용을 함께 두어 안전하게 처리한다. (blogthumb.pstatic.net, *.phinf.naver.net 등)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.pstatic.net" },
      { protocol: "https", hostname: "**.naver.net" },
    ],
  },
  async redirects() {
    return [
      // 어학의참견: 빈 "수업후기"(/power/reviews) 라우트 제거 → /power 학습사례 섹션으로 통합.
      // [region] 동적 라우트(dynamicParams)가 /power/reviews 를 지역 페이지로 오인 렌더하지 않도록
      // 명시적으로 학습사례 앵커로 영구 리다이렉트한다(기존 유입·색인 URL 보존).
      { source: "/power/reviews", destination: "/power#cases", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // 파일시스템 라우팅보다 먼저 적용 — /sitemap.xml 을 사이트맵 인덱스 라우트로 서빙.
      // (generateSitemaps 는 /sitemap/[id].xml 청크만 만들고 /sitemap.xml 은 제공하지 않음)
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
        // 슬래시 없는 루트 별칭 → 청크로 연결. 네이버 서치어드바이저가 "sitemap/0.xml"
        // 형식(경로 슬래시)을 거부하므로 /sitemap-0.xml ~ 형태를 함께 제공한다.
        // 파라메트릭: 모든 id 를 동적 매핑 → shard 수(TOTAL_SITEMAP_COUNT) 증가에도 동기화 불필요.
        { source: "/sitemap-:id(\\d+).xml", destination: "/sitemap/:id.xml" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
