import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import GumjungHero from "@/components/gumjung/GumjungHero";
import { FaqList, LinkChips } from "@/components/gumjung/parts";
import { site } from "@/data/site";
import { getGumjungAge } from "@/data/gumjung/ages";
import { GUMJUNG_LEVELS } from "@/data/gumjung/levels";
import { getGumjungGuide } from "@/data/gumjung/guides";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

/*
 * GumjungAgeDetail — /gumjung/age/[slug] 연령 축(14장).
 * 상황·응시 자격·다음 회차 시점 중심. 준비 방법은 유형 가이드로, 일정은 /gumjung/schedule 로 링크.
 * accent 토큰(청록)만. FAQPage 구조화 데이터는 실제 렌더 Q&A 로만 구성.
 */

const CONSULT_ANCHOR = "#consult";

export default function GumjungAgeDetail({ slug }: { slug: string }) {
  const data = getGumjungAge(slug);
  if (!data) return null;

  const canonical = `/gumjung/age/${data.slug}`;
  const levelLinks = GUMJUNG_LEVELS.map((l) => ({
    label: `${l.name} 검정고시`,
    href: `/gumjung/${l.slug}`,
  }));
  const guideLinks = data.guideSlugs
    .map((s) => getGumjungGuide(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ label: g.navLabel, href: `/gumjung/guide/${g.slug}` }));

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "검고의참견", path: "/gumjung" },
      { name: `${data.h1} 과외`, path: canonical },
    ]),
    faqJsonLd(data.faq),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <GumjungHero
        eyebrow={`검고의참견 · ${data.ageLabel}`}
        title={`${data.h1} 과외`}
        sub="상황과 일정에 맞는 선생님을 1:1로 연결합니다."
        ctaHref={CONSULT_ANCHOR}
        ctaLabel={site.cta.label}
      />

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">{data.intro}</p>

        <section aria-labelledby="elig-heading">
          <h2 id="elig-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {data.eligibilityHeading}
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.eligibilityBody}
          </p>
        </section>

        <section aria-labelledby="study-heading">
          <h2 id="study-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {data.studyHeading}
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.studyBody}
          </p>
        </section>

        <LinkChips heading="급별로 확인하기" links={levelLinks} />

        <FaqList heading="자주 묻는 질문" items={data.faq} />

        {guideLinks.length > 0 && <LinkChips heading="유형별 준비 가이드" links={guideLinks} />}

        <LinkChips
          heading="검정고시 일정·접수"
          links={[{ label: "검정고시 일정 보기", href: "/gumjung/schedule" }]}
        />

        <section className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {data.ageLabel}, 지금 수준부터 1:1로 시작하세요
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

      <ConsultForm defaultMessage={`${data.ageLabel} 검정고시 1:1 상담 문의드립니다.`} />
    </>
  );
}
