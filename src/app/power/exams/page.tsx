import type { Metadata } from "next";
import Link from "next/link";
import { POWER_EXAMS, LANGUAGE_LABEL, type PowerExam } from "@/data/power/exams";
import { examRegions } from "@/data/byRegionExam";
import { site } from "@/data/site";

/*
 * /power/exams — 어학의참견 어학시험 인덱스 허브(내부 링크 허브, 신규).
 *
 * 어학시험 13종(영어7·일본어3·중국어3)을 언어별로 나열하고, 각 시험의 지역별 허브
 * (/power/exams/[exam])로 텍스트 링크를 흘려보낸다. 시험 축(지역×시험) 상세로 가는
 * "회화 역링크" 외의 두 번째 독립 경로를 제공한다(단일 스레드 의존 해소).
 * 단일 세그(/power/exams)라 /power/[region] catch-all 보다 정적 라우트가 우선 → 충돌 없음.
 * 색은 accent 토큰만(퍼플, /power 스코프). 워딩: 느낌표·금지어 없음, 전화·화상 표현.
 */
export const dynamicParams = false;

const LANG_ORDER: PowerExam["language"][] = ["english", "japanese", "chinese"];

const PAGE_TITLE = "어학시험 지역별 1:1 과외 안내 | 어학의참견";
const PAGE_DESCRIPTION =
  "토익·토플·아이엘츠·JLPT·HSK 등 어학시험 13종을 지역별로 준비하는 1:1 과외 안내. 시험을 고르면 전국 지역별 준비 페이지로 이어집니다. 전화·화상으로 진행합니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/power/exams" },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/power/exams",
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

export default function PowerExamsIndexPage() {
  const regionCount = examRegions.length;
  const byLang = LANG_ORDER.map((lang) => ({
    lang,
    label: LANGUAGE_LABEL[lang],
    exams: POWER_EXAMS.filter((e) => e.language === lang),
  }));

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            어학의참견 · 어학시험
          </p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            어학시험 지역별 1:1 과외 안내
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            전국 {regionCount}개 지역에서 어학시험 {POWER_EXAMS.length}종을 준비하는 1:1
            과외를 안내합니다. 시험을 고르면 지역별 준비 페이지로 이어집니다. 전화·화상으로
            진행합니다.
          </p>
        </div>
      </section>

      {/* 언어별 시험 목록 */}
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <ul className="space-y-10">
          {byLang.map((group) => (
            <li key={group.lang}>
              <h2 className="break-keep border-b border-line pb-2 text-xl font-bold text-ink sm:text-2xl">
                {group.label} 시험
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.exams.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/power/exams/${e.slug}`}
                      className="block break-keep rounded-2xl border border-line bg-white p-5 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span className="text-lg font-bold text-accent">{e.name}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">
                        {e.targetLine}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* 지역별 회화 안내로 교차 링크 */}
        <div className="mt-12 text-center">
          <Link
            href="/power/regions"
            className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent bg-accent/5 px-6 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 sm:text-base"
          >
            지역별 어학 회화 안내 보기
          </Link>
        </div>
      </div>
    </>
  );
}
