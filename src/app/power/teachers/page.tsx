import type { Metadata } from "next";
import ConsultForm from "@/components/ConsultForm";
import TeacherCard from "@/components/power/TeacherCard";
import { site } from "@/data/site";
import {
  languageTeachers,
  LANGUAGE_LABEL,
  TYPE_LABEL,
  TEACHER_GROUP_ORDER,
} from "@/data/languageTeachers";

/*
 * /power/teachers — 어학의참견 교사진.
 *
 * languageTeachers.ts 를 언어×유형으로 그룹핑해, 데이터가 있는 그룹만 섹션으로 렌더한다.
 * (현재: 영어·원어민 14명. 다른 언어/유형은 데이터 추가 시 자동으로 섹션이 생긴다.)
 * 헤더(어학의참견)·푸터·플로팅 CTA 는 루트 layout 에서 상속. 상담 폼은 공통 ConsultForm 재사용.
 */

const PAGE_TITLE = "어학 원어민·전문 선생님 교사진 | 어학의참견";
const PAGE_DESCRIPTION =
  "영어·일본어·중국어 1:1 선생님을 소개합니다. 원어민·교포·한국인 선생님 중에서 학생 수준과 목표에 맞는 한 분을 상담으로 연결해 드립니다.";

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

// 데이터가 있는 그룹만(빈 그룹은 렌더하지 않음).
const groups = TEACHER_GROUP_ORDER.map((g) => ({
  ...g,
  teachers: languageTeachers.filter(
    (t) => t.language === g.language && t.type === g.type,
  ),
})).filter((g) => g.teachers.length > 0);

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
            학생 수준과 목표에 맞춰 연결해 드리는 선생님들입니다.
          </p>
        </div>
      </section>

      {/* 그룹별 교사 카드 */}
      <div className="mx-auto max-w-6xl space-y-14 px-5 py-14 sm:px-6 sm:py-16">
        {groups.map((g) => (
          <section
            key={`${g.language}-${g.type}`}
            aria-labelledby={`grp-${g.language}-${g.type}`}
          >
            <h2
              id={`grp-${g.language}-${g.type}`}
              className="break-keep text-2xl font-bold text-ink sm:text-3xl"
            >
              {LANGUAGE_LABEL[g.language]} · {TYPE_LABEL[g.type]} 선생님
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {g.teachers.map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </ul>
          </section>
        ))}
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
