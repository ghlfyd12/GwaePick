import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import FooterSwitch from "@/components/layout/FooterSwitch";
import FloatingButtons from "@/components/layout/FloatingButtons";
import RootShell from "@/components/layout/RootShell";
import UtmCapture from "@/components/UtmCapture";
import { site } from "@/data/site";

/*
 * Pretendard 가변 폰트(self-hosted).
 * next/font/local 이 --font-pretendard 변수를 <html> 에 주입하고,
 * globals.css 의 --font-sans 가 이를 참조한다.
 */
const pretendard = localFont({
  // KS X 1001 완성형(2,350) + 영문·숫자·라틴확장·기호 + 사이트/DB 실존 학교·지역명 문자 서브셋.
  // 원본 대비 ~77% 경량(2.0MB→452KB). 가변 weight 축(45~920) 유지 → 굵기 사용처 불변.
  // KS X 1001 밖 미래 입력만 시스템 한글폰트(--font-sans 폴백)로 렌더(토푸 없음).
  // 롤백용 원본 PretendardVariable.woff2 는 보존.
  src: "../fonts/Pretendard-subset.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

// 브랜드명을 맨 앞에 둬 '지식의참견' 단독 검색 노출을 강화한다(핵심 서비스는 뒤에 직관적으로).
const TITLE = `${site.name} | 직접 가르친 선생님의 1:1 맞춤 과외 매칭`;
/*
 * description 본문에는 띄어쓴 표기('지식의 참견')를 쓴다.
 * title 은 붙여쓰기(site.name), description 은 띄어쓰기로 두 검색 표기를 함께 커버하려는 의도이므로
 * 어느 한쪽으로 통일하지 않는다.
 */
const DESCRIPTION =
  `지식의 참견은 직접 가르쳐 온 선생님이 상담하고 검증된 선생님을 연결하는 1:1 맞춤 과외 매칭 서비스입니다. ${site.slogan}`;

/* URL 공유 미리보기(OG/트위터) 이미지 — site.ogImage 단일 소스(절대 URL 변환). */
const OG_IMAGE = site.ogImage;

/*
 * Metadata API — 페이지별 동적 주입 가능한 구조(pSEO 대비).
 * 하위 페이지는 자체 metadata 를 export 해 title.template 으로 덮어쓸 수 있다.
 */
export const metadata: Metadata = {
  // 절대경로(OG/canonical) 기준 — 도메인은 site.url 한 곳에서 관리
  metadataBase: new URL(site.url),
  title: {
    default: TITLE,
    template: `%s | ${site.name}`,
  },
  description: DESCRIPTION,
  /*
   * 루트 canonical — 자체 metadata 가 없는 유일한 페이지인 메인(/)에만 적용된다.
   * (하위 페이지는 모두 각자 alternates.canonical 을 정의하므로 상속되지 않는다.)
   * 값은 metadataBase(site.url) 기준 절대 URL 로 렌더된다 — 한글 도메인은 punycode 표기.
   */
  alternates: { canonical: "/" },
  // 파비콘: 딥네이비 배경 + 코랄 "참" 모노그램(app/icon.svg 마스터). 구 주황 마크 캐시 무력화(?v=4)
  icons: {
    icon: [
      { url: "/icon.svg?v=4", type: "image/svg+xml" },
      { url: "/icon.png?v=4", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/apple-icon.png?v=4",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  // 검색엔진 사이트 소유확인 (구글 서치 콘솔 + 네이버 서치어드바이저)
  verification: {
    google: "hfkp_kAxEHCCREYFvXyIolwrMGIGGj1VEkFwvwvKAKk",
    other: {
      "naver-site-verification": "edb0b89102c54ee579acfa4243748c94587ba857",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      {/* pb-* : 모바일 하단 고정 상담 바(FloatingButtons) 높이 + iOS 홈바 safe-area 만큼
          바닥 여백을 둬 푸터 마지막 내용이 바에 가려지지 않게 한다. lg 이상은 바가 없어 0. */}
      <body className="flex min-h-dvh flex-col bg-white pb-[calc(5rem+env(safe-area-inset-bottom))] text-ink lg:pb-0">
        {/* 유입 UTM first-touch 캡처(화면 비노출) — 홈·/apply 등 모든 진입점 커버 */}
        <UtmCapture />
        <RootShell>
          <Header />
          <main className="flex-1">{children}</main>
          <FooterSwitch />
          <FloatingButtons />
        </RootShell>
      </body>
    </html>
  );
}
