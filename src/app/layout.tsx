import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
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

const TITLE = "맞춤 과외 상담 | 직접 가르쳐 본 선생님이 찾아드립니다";
const DESCRIPTION =
  "직접 가르쳐 온 선생님이 1:1 상담으로 우리 아이에게 가장 잘 맞는 선생님을 연결해 드립니다. 무료 상담 신청.";

/*
 * Metadata API — 페이지별 동적 주입 가능한 구조(pSEO 대비).
 * 하위 페이지는 자체 metadata 를 export 해 title.template 으로 덮어쓸 수 있다.
 */
export const metadata: Metadata = {
  // 배포 도메인 확정 시 교체 — OG/canonical 절대경로 생성 기준
  metadataBase: new URL("https://example.com"),
  title: {
    default: TITLE,
    template: `%s | ${site.name}`,
  },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
