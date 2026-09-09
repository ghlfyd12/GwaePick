import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import GumjungHero from "@/components/gumjung/GumjungHero";
import { StepList, FaqList, LinkChips } from "@/components/gumjung/parts";
import { site } from "@/data/site";
import {
  GUMJUNG_SIDOS,
  GUMJUNG_SCHEDULE_STEPS,
  GUMJUNG_SCHEDULE_INTRO,
  GUMJUNG_SCHEDULE_FAQ,
  gumjungScheduleSlugForSidoLabel,
  getGumjungSido,
} from "@/data/gumjung/schedule";
import { GUMJUNG_LEVELS } from "@/data/gumjung/levels";
import { examRegions } from "@/data/byRegionExam";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

/*
 * GumjungScheduleDetail — /gumjung/schedule(허브) · /gumjung/schedule/[sido](시도 17).
 * 회차 구조·접수·급별 링크 + (시도) 관할 교육청·해당 시도 지역 칩. 구체 날짜는 공고 위임.
 * FAQPage 구조화 데이터는 실제 렌더 Q&A 로만. accent(청록)만.
 */

const CONSULT_ANCHOR = "#consult";
const enc = (s: string) => encodeURIComponent(s);

export default function GumjungScheduleDetail({ sidoSlug }: { sidoSlug?: string }) {
  const sido = sidoSlug ? getGumjungSido(sidoSlug) : null;
  if (sidoSlug && !sido) return null;

  const canonical = sido ? `/gumjung/schedule/${sido.slug}` : "/gumjung/schedule";
  const title = sido ? `${sido.short} 검정고시 일정` : "검정고시 일정";
  const intro = sido
    ? `${sido.name} 검정고시는 ${sido.office} 주관으로 시행됩니다. ${GUMJUNG_SCHEDULE_INTRO}`
    : GUMJUNG_SCHEDULE_INTRO;

  const levelLinks = GUMJUNG_LEVELS.map((l) => ({
    label: `${l.name} 검정고시`,
    href: `/gumjung/${l.slug}`,
  }));

  // 시도 페이지: 해당 시도 소속 지역 칩(최대 12).
  const regionChips = sido
    ? examRegions
        .filter((r) => gumjungScheduleSlugForSidoLabel(r.sidoLabel) === sido.slug)
        .slice(0, 12)
        .map((r) => ({ label: `${r.name} 검정고시`, href: `/gumjung/by-region/${enc(r.slug)}` }))
    : [];

  // 허브: 시도 일정 링크(지방 → 광역시 → 서울·경기 순 그대로).
  const sidoLinks = !sido
    ? GUMJUNG_SIDOS.map((s) => ({ label: `${s.short} 일정`, href: `/gumjung/schedule/${s.slug}` }))
    : [];

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "검고의참견", path: "/gumjung" },
      { name: "검정고시 일정", path: "/gumjung/schedule" },
      ...(sido ? [{ name: `${sido.short} 검정고시 일정`, path: canonical }] : []),
    ]),
    faqJsonLd(GUMJUNG_SCHEDULE_FAQ),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <GumjungHero
        eyebrow={sido ? `검고의참견 · ${sido.name}` : "검고의참견 · 일정"}
        title={`${title} 안내`}
        sub="회차 일정을 확인하고 맞는 선생님을 1:1로 연결합니다."
        ctaHref={CONSULT_ANCHOR}
        ctaLabel={site.cta.label}
      />

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">{intro}</p>

        <StepList heading="검정고시 회차 진행 순서" steps={GUMJUNG_SCHEDULE_STEPS} />

        <section aria-labelledby="notice-heading">
          <h2 id="notice-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            정확한 날짜 확인
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            회차별 접수 기간과 시험일은 연도·시도마다 다릅니다. 구체적인 날짜는 {sido ? sido.office : "각 시도 교육청"}의 해당 회차 공고에서 확인하고, 상담에서 목표 회차에 맞춘 계획을 함께 세워 드립니다.
          </p>
        </section>

        <FaqList heading="자주 묻는 질문" items={GUMJUNG_SCHEDULE_FAQ} />

        <LinkChips heading="급별로 확인하기" links={levelLinks} />

        {sido && regionChips.length > 0 && (
          <LinkChips heading={`${sido.short} 지역 검정고시`} links={regionChips} />
        )}
        {!sido && <LinkChips heading="시도별 검정고시 일정" links={sidoLinks} />}

        <section className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {title}에 맞춰 1:1로 준비하세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            상담에서 목표 회차와 현재 상황을 확인하고 맞는 선생님을 연결해 드립니다. 방문·화상 모두 가능하며, 첫 상담은 무료입니다.
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

      <ConsultForm defaultMessage={`${title} 관련 1:1 상담 문의드립니다.`} />
    </>
  );
}
