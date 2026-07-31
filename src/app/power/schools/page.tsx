import type { Metadata } from "next";
import Link from "next/link";
import { powerSchoolsBySido } from "@/data/powerSchoolsIndex";
import { site } from "@/data/site";

/*
 * /power/schools — 어학의참견 학교별 안내 인덱스(내부 링크 허브).
 *
 * 외고·국제중·국제고 41교를 시도별로 나열하고, 각 학교의 수행평가(언어별)·어학과목(과목별)
 * 페이지로 텍스트 링크를 흘려보낸다(크롤·탐색용). offered && verified 조합만 노출.
 * 단일 세그(/power/schools)라 /power/[region] catch-all 보다 정적 라우트가 우선 → 충돌 없음.
 * 색은 accent 토큰만(퍼플, /power 스코프). 과도한 디자인 없이 세로 목록.
 */
export const dynamicParams = false;

const PAGE_TITLE = "외고 국제중 국제고 어학 수업 수행평가 안내 | 어학의참견";
const PAGE_DESCRIPTION =
  "외국어고·국제중·국제고 재학생과 입학 준비생을 위한 어학 수업·수행평가 안내. 학교별로 영어·중국어·일본어 1:1 과외와 언어별 수행평가 대비 페이지를 모았습니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/power/schools" },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/power/schools",
    type: "website",
    locale: "ko_KR",
    siteName: site.power.name,
    images: [site.power.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [site.power.ogImage],
  },
};

export default function PowerSchoolsIndexPage() {
  const groups = powerSchoolsBySido();
  const totalSchools = groups.reduce((n, g) => n + g.schools.length, 0);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            어학의참견 · 학교별 안내
          </p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            외고·국제중·국제고 어학 수업·수행평가 안내
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            전국 {totalSchools}개 외국어고·국제중·국제고의 학교별 어학 1:1 과외와 언어별
            수행평가 대비 페이지를 모았습니다. 학교를 찾아 필요한 수업으로 바로 이동하세요.
          </p>
        </div>
      </section>

      {/* 시도별 학교 목록 */}
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <ul className="space-y-10">
          {groups.map((group) => (
            <li key={group.sidoLabel}>
              <h2 className="break-keep border-b border-line pb-2 text-xl font-bold text-ink sm:text-2xl">
                {group.sidoLabel}
              </h2>
              <ul className="mt-5 space-y-6">
                {group.schools.map((s) => (
                  <li key={s.slug} className="rounded-2xl border border-line bg-white p-5">
                    <p className="break-keep text-base font-bold text-ink sm:text-lg">
                      {s.name}
                      <span className="ml-2 text-sm font-normal text-muted">{s.regionName}</span>
                    </p>

                    {s.performanceLinks.length > 0 && (
                      <div className="mt-3">
                        <p className="break-keep text-xs font-semibold text-muted">수행평가</p>
                        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                          {s.performanceLinks.map((l) => (
                            <li key={l.href}>
                              <Link
                                href={l.href}
                                className="break-keep text-[13px] font-medium text-accent transition-colors hover:underline"
                              >
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {s.subjectLinks.length > 0 && (
                      <div className="mt-3">
                        <p className="break-keep text-xs font-semibold text-muted">어학 수업</p>
                        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                          {s.subjectLinks.map((l) => (
                            <li key={l.href}>
                              <Link
                                href={l.href}
                                className="break-keep text-[13px] font-medium text-accent transition-colors hover:underline"
                              >
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
