import type { Metadata } from "next";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import GumjungHero from "@/components/gumjung/GumjungHero";
import { StepList, CompareTable, FaqList } from "@/components/gumjung/parts";
import { site } from "@/data/site";
import { GUMJUNG_LEVELS, GUMJUNG_FAQ } from "@/data/gumjung/levels";
import { GUMJUNG_GUIDES } from "@/data/gumjung/guides";
import { GUMJUNG_STEPS, GUMJUNG_METHOD_COMPARE } from "@/data/gumjung/detailContent";
import { examRegions } from "@/data/byRegionExam";

/*
 * /gumjung — 검고의참견 허브 랜딩(축 메인). 지식의참견 메인(/) 구도 기준.
 * 히어로(개편분 유지) 아래: 급별 3카드 · 시험 정보 3카드 · 수업 방식+4단계 · 유형 가이드 7 ·
 * 준비 방법 비교 · 지역 진입(주요 시군구+전체 보기) · FAQ+CTA. 헤더·푸터·플로팅은 검고 스코프(청록).
 * 수업 방식: 방문·화상 1:1, 대부분 화상. 화상 장점은 사실 서술만(비교·보장 금지).
 */

const SITE_URL = site.url.replace(/\/$/, "");
const abs = (p: string) => `${SITE_URL}${p}`;
const CONSULT_ANCHOR = "#consult";

const PAGE_TITLE =
  "검정고시 과외 - 고졸 중졸 초졸 화상 1:1 개인과외 공부법 시험 일정";
const PAGE_DESCRIPTION =
  "고졸·중졸·초졸 검정고시를 방문·화상 1:1 개인과외로 준비합니다. 급별 안내·시험 정보·공부법과 무료 상담을 한곳에 모았습니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/gumjung" },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/gumjung",
    type: "website",
    locale: "ko_KR",
    siteName: site.gumjung.name,
    images: [site.gumjung.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [site.gumjung.ogImage],
  },
};

/* 한눈에 보는 시험 정보(사실 축약, GUMJUNG_EXAM_FACTS 기반). */
const EXAM_INFO_CARDS = [
  { label: "시행", value: "연 2회 (통상 4월·8월)" },
  { label: "합격", value: "전 과목 평균 60점 이상" },
  { label: "과목합격제", value: "60점 이상 과목 다음 회차 면제" },
];

/* 화상 수업 장점 — 사실 서술만(효과·성과 비교/보장 없음). */
const ONLINE_POINTS = ["전국 어디서나", "이동 시간 없음", "일정 조율 용이", "필요한 과목만 선택"];

/* 지역 칩 — 수도권·광역시 대표 후보 중 examRegions(253) 검증 slug만(404 원천 차단), 최대 12. */
const EXAM_NAME_SLUG = new Map(examRegions.map((r) => [r.name, r.slug]));
const CHIP_CANDIDATES = [
  "강남구", "서초구", "송파구", "관악구", "노원구",
  "고양시 덕양구", "성남시 분당구", "수원시 영통구",
  "부산진구", "해운대구", "수성구", "남동구", "연수구",
];
const REGION_CHIPS = CHIP_CANDIDATES.filter((n) => EXAM_NAME_SLUG.has(n))
  .slice(0, 12)
  .map((n) => ({ name: n, slug: EXAM_NAME_SLUG.get(n) as string }));

export default function GumjungHomePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ① 히어로 (개편분 유지) */}
      <GumjungHero
        eyebrow="검고의참견"
        title="검정고시, 나에게 맞는 속도로"
        sub="방향이 정해지면 준비는 단순해집니다. 1:1로 시작합니다."
        ctaHref={CONSULT_ANCHOR}
        ctaLabel={site.cta.label}
      />

      <div className="mx-auto max-w-3xl space-y-16 px-5 py-14 sm:px-6 sm:py-20">
        {/* 도입 본문(SEO 텍스트 보존) */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">
          학교 밖에서 공부하는 이유는 저마다 다릅니다. 검정고시는 출제 범위가 정해져 있어 방향만 잡으면 혼자보다 빠르게 준비할 수 있습니다. 직접 가르쳐 온 선생님이 상담으로 맞는 선생님을 1:1로 연결해 드립니다.
        </p>

        {/* ② 급별 진입 3카드 */}
        <section aria-labelledby="levels-heading">
          <h2 id="levels-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            급별로 준비하기
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {GUMJUNG_LEVELS.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/gumjung/${l.slug}`}
                  className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-sm transition-colors hover:border-accent"
                >
                  <span className="break-keep text-lg font-bold text-accent">
                    {l.name} 검정고시
                  </span>
                  <span className="mt-2 break-keep text-sm leading-relaxed text-muted">
                    필수 {l.requiredCount} + 선택 {l.electiveCount}과목 · {l.questionShort}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ③ 한눈에 보는 시험 정보 3카드 */}
        <section aria-labelledby="examinfo-heading">
          <h2 id="examinfo-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            한눈에 보는 시험 정보
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {EXAM_INFO_CARDS.map((c) => (
              <li key={c.label} className="rounded-3xl border border-line bg-white p-6 text-center shadow-sm">
                <p className="break-keep text-sm font-semibold text-accent">{c.label}</p>
                <p className="mt-2 break-keep text-base font-bold text-ink">{c.value}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 break-keep text-sm leading-relaxed text-muted">
            전 과목 평균 60점 이상이면 합격이며, 결시한 과목이 있으면 합격으로 인정되지 않습니다. 회차·기준은 시행 공고에 따라 달라질 수 있습니다.
          </p>
        </section>

        {/* ④ 수업 방식 + 4단계 */}
        <section aria-labelledby="lesson-heading">
          <h2 id="lesson-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            방문·화상 1:1로 준비합니다
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            검고의참견은 방문과 화상 1:1 수업으로 진행하며, 대부분 화상으로 진행됩니다. 화상 수업은 이렇게 준비합니다.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ONLINE_POINTS.map((p) => (
              <li key={p} className="break-keep rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <StepList heading={GUMJUNG_STEPS.heading} steps={GUMJUNG_STEPS.steps} />
          </div>
        </section>

        {/* ⑤ 유형 가이드 7 (#guides) */}
        <section id="guides" aria-labelledby="guides-heading" className="scroll-mt-24">
          <h2 id="guides-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            이런 경우에 준비합니다
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GUMJUNG_GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/gumjung/guide/${g.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 transition-colors hover:border-accent"
                >
                  <span className="break-keep text-base font-semibold text-ink">{g.navLabel}</span>
                  <span aria-hidden className="text-accent">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ⑥ 준비 방법 비교표 요약 */}
        <CompareTable heading={GUMJUNG_METHOD_COMPARE.heading} rows={GUMJUNG_METHOD_COMPARE.rows} />

        {/* ⑦ 지역 진입 — 주요 시군구 + 전체 보기 */}
        <section aria-labelledby="region-heading" className="rounded-3xl bg-accent/10 px-6 py-10">
          <h2 id="region-heading" className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl">
            우리 지역에서 준비하기
          </h2>
          <p className="mx-auto mt-3 max-w-xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
            전국 시·군·구별 검정고시 안내를 모았습니다. 방문·화상 1:1로 준비할 수 있습니다.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
            {REGION_CHIPS.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/gumjung/by-region/${encodeURIComponent(r.slug)}`}
                  className="inline-flex min-h-11 items-center break-keep rounded-full border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/5"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center">
            <Link
              href="/gumjung/regions"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-accent bg-white px-6 text-base font-bold text-accent transition-colors hover:bg-accent/5"
            >
              지역별 검정고시 전체 보기 →
            </Link>
          </div>
        </section>

        {/* ⑧ FAQ */}
        <FaqList heading="자주 묻는 질문" items={GUMJUNG_FAQ} />
      </div>

      <ConsultForm defaultMessage="검정고시 1:1 상담 문의드립니다." />
    </>
  );
}
