import type { Metadata } from "next";
import ConsultForm from "@/components/ConsultForm";
import TeacherList from "@/components/power/TeacherList";
import { site } from "@/data/site";
import { languageTeachers } from "@/data/languageTeachers";

/*
 * /power/teachers — 어학의참견 교사진.
 *
 * languageTeachers.ts 데이터를 클라이언트 리스트(TeacherList)에 넘겨, 영역 필터 칩 +
 * 콤팩트 카드 + 더보기로 렌더한다(필터·더보기 상태는 리스트 컴포넌트만 client).
 * 헤더(어학의참견)·푸터·플로팅 CTA 는 루트 layout 에서 상속. 상담 폼은 공통 ConsultForm 재사용.
 */

const PAGE_TITLE = "어학 원어민·전문 선생님 교사진 | 어학의참견";
const PAGE_DESCRIPTION =
  "영어·일본어·중국어 1:1 선생님을 소개합니다. 원어민·교포·한국인 선생님 중에서 지금 수준과 목표에 맞는 한 분을 상담으로 연결해 드립니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/power/teachers" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/power/teachers",
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    images: [site.ogImage],
  },
};

const CONSULT_ANCHOR = "#consult";

export default function PowerTeachersPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            어학의참견 교사진
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            지금 수준과 목표에 맞춰 연결해 드리는 선생님들입니다.
          </p>
        </div>
      </section>

      {/* 교사 리스트 — 영역 필터 + 콤팩트 카드 + 더보기(클라이언트) */}
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-14">
        <TeacherList teachers={languageTeachers} />
      </div>

      {/* 하단 상담 CTA */}
      <section className="px-5 pb-4 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            어떤 선생님이 우리 아이에게 맞을지 막막하다면, 상담부터 시작하세요.
            직접 가르쳐 온 선생님이 함께 찾아 드립니다.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label} →
            </a>
          </div>
        </div>
      </section>

      {/* 상담 폼(#consult) — 공통 컴포넌트 재사용 */}
      <ConsultForm defaultMessage="어학 선생님 상담 문의드립니다." />
    </>
  );
}
