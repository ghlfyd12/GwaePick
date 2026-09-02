import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import GumjungHero from "@/components/gumjung/GumjungHero";
import { site } from "@/data/site";
import {
  buildGumjungRegionData,
  gumjungNearbyRegions,
} from "@/data/byRegionGumjung";
import { GUMJUNG_GUIDES } from "@/data/gumjung/guides";
import {
  GUMJUNG_STEPS,
  gumjungRegionFaq,
  gumjungRegionLessonBody,
  gumjungRegionTags,
} from "@/data/gumjung/detailContent";
import { StepList, FaqList, TagCloud, LinkChips } from "@/components/gumjung/parts";

/*
 * GumjungRegionDetail — /gumjung/by-region/[region] 지역×검정고시(253장) 보강 템플릿.
 * 급별 요약 + 수업 4단계 + 수업 형태 + FAQ + 관련 검색어 + 내부링크 클러스터(인근 시군구·급별·가이드) + CTA.
 * 시험 전문 정보는 급별 상세 전용(지역=요약). accent 토큰만(청록).
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

// 지역 페이지 내부링크: 대표 유형 가이드 4종.
const GUIDE_HUB = GUMJUNG_GUIDES.filter((g) =>
  ["fast-daeip", "gap", "adult", "goip"].includes(g.slug),
).map((g) => ({ label: g.navLabel, href: `/gumjung/guide/${g.slug}` }));

export default function GumjungRegionDetail({ regionParam }: { regionParam: string }) {
  const data = buildGumjungRegionData(regionParam);
  if (!data) return null;

  const canonical = `/gumjung/by-region/${encodeURIComponent(data.regionSlug)}`;
  const nearby = gumjungNearbyRegions(data.regionSlug, 6);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
        { "@type": "ListItem", position: 2, name: `${data.head} 과외`, item: abs(canonical) },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero (개편) — h1 유지, 서브 교체. 인트로 본문은 아래로 이동 */}
      <GumjungHero
        eyebrow={`검고의참견 · ${data.regionName}`}
        title={`${data.head} 과외`}
        sub="지역과 일정에 맞는 선생님을 1:1로 연결합니다."
        ctaHref={CONSULT_ANCHOR}
        ctaLabel={site.cta.label}
      />

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
        {/* 인트로 본문(히어로 아래로 이동) */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">
          {data.intro}
        </p>

        {/* 급별 요약 링크 */}
        <LinkChips heading={`${data.regionName}에서 준비하는 급별`} links={data.levelLinks.map((l) => ({ label: `${l.label} (${l.note})`, href: l.href }))} />

        {/* 수업 진행 4단계 */}
        <StepList heading={GUMJUNG_STEPS.heading} steps={GUMJUNG_STEPS.steps} />

        {/* 수업 형태 (방문·화상) */}
        <section aria-labelledby="lesson-heading">
          <h2 id="lesson-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {data.regionName} 수업 형태
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {gumjungRegionLessonBody(data.regionName)}
          </p>
        </section>

        {/* FAQ 3 */}
        <FaqList heading="자주 묻는 질문" items={gumjungRegionFaq(data.regionName)} />

        {/* 관련 검색어 */}
        <TagCloud tags={gumjungRegionTags(data.regionName)} />

        {/* 내부링크 클러스터 — 인근 시군구 */}
        <LinkChips heading={`${data.regionName} 인근 지역 검정고시`} links={nearby} />

        {/* 유형 가이드 대표 */}
        <LinkChips heading="유형별 준비 가이드" links={GUIDE_HUB} />

        {/* CTA */}
        <section className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {data.regionName}에서 1:1로 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            상담에서 현재 상황과 목표 시기를 확인하고 맞는 선생님을 연결해 드립니다. 방문·화상 모두 가능하며, 첫 상담은 무료입니다.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label} →
            </a>
            <a
              href={`tel:${site.contact.phone}`}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg"
            >
              {site.contact.phone}
            </a>
          </div>
        </section>
      </div>

      <ConsultForm defaultMessage={`${data.regionName} 검정고시 1:1 상담 문의드립니다.`} />
    </>
  );
}
