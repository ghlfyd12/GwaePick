import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import RootShell from "@/components/layout/RootShell";
import { site } from "@/data/site";

/*
 * Pretendard 가변 폰트(self-hosted).
 * next/font/local 이 --font-pretendard 변수를 <html> 에 주입하고,
 * globals.css 의 --font-sans 가 이를 참조한다.
 */
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
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
  // 구버전 favicon.ico 제거 후 icon.png 를 명시적으로 등록 + 캐시 무력화(?v=3)
  icons: {
    icon: "/icon.png?v=3",
    shortcut: "/icon.png?v=3",
    apple: "/icon.png?v=3",
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
      <body className="flex min-h-dvh flex-col bg-white text-ink">
        <RootShell>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingButtons />
        </RootShell>
      </body>
    </html>
  );
}
