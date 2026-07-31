import type { Metadata } from "next";
import ConsultForm from "@/components/ConsultForm";
import { site } from "@/data/site";

/*
 * /power/consult — 어학의참견 전용 무료 상담 신청 페이지.
 *
 * /power 및 하위의 헤더·플로팅 CTA 가 모이는 상담 도착지다.
 * (이전에는 메인 지식의참견 폼 /#consult 로 이동해 어학 맥락·브랜드색이 어긋났다.)
 *
 * 폼은 공통 ConsultForm 재사용 — /power 스코프(.power-theme)라 accent 토큰이 퍼플로 렌더되고,
 * 옵션·라벨(학년 초·중·고·성인 / "희망 언어" 영어·일본어·중국어)은 consultFormOptions.ts 의
 * 어학 설정이 경로로 자동 선택된다. 제출은 기존 POST /api/consult → 노션 저장 그대로.
 * 페이지가 h1 으로 제목을 이미 말하므로 폼 자체 헤더는 끈다(showHeader={false}).
 */

const PAGE_TITLE = "어학 전문 1:1 무료 상담 신청 | 어학의참견";
const PAGE_DESCRIPTION =
  "영어·일본어·중국어 1:1 수업 무료 상담. 지금 수준과 목표를 알려주시면 직접 가르쳐 온 선생님이 맞는 선생님을 연결해 드립니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/power/consult" },
  /*
   * 색인 제외 — 폼만 있는 얇은 페이지라, 검색 유입 대상인 /power(및 언어·지역 상세)와
   * 같은 상담 폼을 두고 경쟁할 이유가 없다. 내부 CTA 로만 도달한다(링크는 따라가게 follow).
   */
  robots: { index: false, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/power/consult",
    type: "website",
    locale: "ko_KR",
    siteName: site.power.name,
    images: [site.power.ogImage],
  },
};

export default function PowerConsultPage() {
  return (
    <>
      {/* Hero — 폼 헤더를 대신하는 페이지 제목 (h1 은 페이지당 1개) */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-accent">어학의참견</p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            어학 전문 1:1 무료 상담
          </h1>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            영어·일본어·중국어 가운데 원하는 언어와 지금 수준을 알려주세요. 직접
            가르쳐 온 선생님이 목표에 맞는 선생님을 연결해 드립니다. 상담은
            무료입니다.
          </p>
        </div>
      </section>

      {/* 상담 폼 — 전화·카톡 채널과 폼 일체. 공통 컴포넌트 재사용(제출 → /api/consult → 노션). */}
      <ConsultForm showHeader={false} />
    </>
  );
}
