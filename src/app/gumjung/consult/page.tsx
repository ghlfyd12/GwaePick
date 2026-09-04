import type { Metadata } from "next";
import ConsultForm from "@/components/ConsultForm";
import { site } from "@/data/site";

/*
 * /gumjung/consult — 검고의참견 전용 무료 상담 신청 페이지.
 * /gumjung 헤더·플로팅 CTA 가 모이는 도착지. 폼은 공통 ConsultForm 재사용 —
 * /gumjung 스코프(.gumjung-theme)라 accent 가 청록으로, 옵션·라벨은 consultFormOptions 의
 * 검고 설정(급별·준비 유형)이 경로로 자동 선택된다. 제출은 기존 POST /api/consult → 노션.
 */
const PAGE_TITLE = "검정고시 1:1 무료 상담 신청 - 고졸 중졸 초졸";
const PAGE_DESCRIPTION =
  "고졸·중졸·초졸 검정고시 1:1 수업 무료 상담. 지금 상황과 목표 시기를 알려주시면 직접 가르쳐 온 선생님이 맞는 선생님을 연결해 드립니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/gumjung/consult" },
  // 색인 제외 — 폼만 있는 얇은 페이지(검색 유입 대상인 상세 페이지와 폼 경쟁 방지). 링크는 follow.
  robots: { index: false, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/gumjung/consult",
    type: "website",
    locale: "ko_KR",
    siteName: site.gumjung.name,
    images: [site.gumjung.ogImage],
  },
};

export default function GumjungConsultPage() {
  return (
    <>
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-accent">검고의참견</p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            검정고시 1:1 무료 상담
          </h1>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            고졸·중졸·초졸 가운데 준비하려는 급별과 지금 상황, 목표 시기를 알려주세요. 직접 가르쳐 온 선생님이 맞는 선생님을 연결해 드립니다. 상담은 무료입니다.
          </p>
        </div>
      </section>

      <ConsultForm showHeader={false} />
    </>
  );
}
