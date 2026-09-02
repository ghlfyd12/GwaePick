import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import GumjungHero from "@/components/gumjung/GumjungHero";
import { site } from "@/data/site";
import {
  getGumjungLevel,
  GUMJUNG_TYPE_SECTION,
  GUMJUNG_FAQ,
} from "@/data/gumjung/levels";
import { GUMJUNG_GUIDES } from "@/data/gumjung/guides";
import {
  GUMJUNG_METHOD_COMPARE,
  GUMJUNG_DIFFICULTIES,
  GUMJUNG_FLOW,
  GUMJUNG_GUARDIAN,
  GUMJUNG_LEVEL_FAQ_EXTRA,
  GUMJUNG_ELIGIBILITY,
  GUMJUNG_AFTER,
  GUMJUNG_SUBJECT_POINT,
  gumjungStrategyBody,
  gumjungLevelTags,
} from "@/data/gumjung/detailContent";
import {
  StepList,
  FaqList,
  TagCloud,
  CompareTable,
  LinkChips,
} from "@/components/gumjung/parts";
import { GUMJUNG_STEPS } from "@/data/gumjung/detailContent";

/*
 * GumjungLevelDetail — /gumjung/[level] 급별 상세(고졸·중졸·초졸) 가이드형 보강 템플릿.
 * 기존 확정 카피(h1·인트로·유형 섹션·FAQ 3)는 무변경, 신규 섹션(과목표·전략·자격·비교·포인트·흐름·
 * 어려움·이후·보호자·FAQ 2·태그·링크)을 추가한다. 시험 정보 전문은 급별 상세에만. accent 토큰만(청록).
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

const GUIDE_LINKS = GUMJUNG_GUIDES.map((g) => ({
  label: g.navLabel,
  href: `/gumjung/guide/${g.slug}`,
}));

export default function GumjungLevelDetail({ levelSlug }: { levelSlug: string }) {
  const level = getGumjungLevel(levelSlug);
  if (!level) return null;

  const canonical = `/gumjung/${level.slug}`;
  const faqAll = [...GUMJUNG_FAQ, ...GUMJUNG_LEVEL_FAQ_EXTRA];
  const after = GUMJUNG_AFTER[level.slug];
  const requiredNames = level.requiredSubjects.map((s) => s.label).join("·");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
        { "@type": "ListItem", position: 2, name: level.examName, item: abs(canonical) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqAll.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero (개편) — h1 만 변경 허용, 인트로 본문은 아래로 이동(무변경) */}
      <GumjungHero
        eyebrow={`검고의참견 · ${level.name}`}
        title={`${level.name} 검정고시, 나에게 맞는 속도로`}
        sub="방향이 정해지면 준비는 단순해집니다. 1:1로 시작합니다."
        ctaHref={CONSULT_ANCHOR}
        ctaLabel={site.cta.label}
      />

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
        {/* 인트로 본문(현행 확정 카피 무변경 — 히어로 아래로 이동) */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">
          {level.intro}
        </p>

        {/* B-2 과목·문항 표 */}
        <section aria-labelledby="subjects-heading">
          <h2 id="subjects-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {level.examName} 과목 구성
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th className="py-3 pr-4 font-bold">구분</th>
                  <th className="py-3 pr-4 font-bold">과목</th>
                  <th className="py-3 pr-4 font-bold">문항·배점</th>
                  <th className="py-3 font-bold">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line align-top">
                  <td className="break-keep py-3 pr-4 font-semibold text-accent">필수 {level.requiredCount}</td>
                  <td className="break-keep py-3 pr-4 text-ink">{requiredNames}</td>
                  <td className="break-keep py-3 pr-4 text-muted">{level.questionShort}</td>
                  <td className="break-keep py-3 text-muted">{level.requiredScopeNote || "—"}</td>
                </tr>
                <tr className="border-b border-line align-top">
                  <td className="break-keep py-3 pr-4 font-semibold text-accent">선택 {level.electiveCount}</td>
                  <td className="break-keep py-3 pr-4 text-ink">{level.electiveList}</td>
                  <td className="break-keep py-3 pr-4 text-muted">{level.questionShort}</td>
                  <td className="break-keep py-3 text-muted">페이지 없이 상담에서 확인</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 break-keep text-sm leading-relaxed text-muted">
            2015 개정 교육과정 기반이며, 과목 구성·문항은 시행 공고에 따라 달라질 수 있습니다.
          </p>
        </section>

        {/* B-3 합격 기준 + 전략 */}
        <section aria-labelledby="strategy-heading">
          <h2 id="strategy-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            합격 기준과 과목별 접근
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {gumjungStrategyBody(level.slug)}
          </p>
        </section>

        {/* B-4 응시 자격·접수 */}
        <section aria-labelledby="eligibility-heading">
          <h2 id="eligibility-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            응시 자격과 접수
          </h2>
          <p className="mt-4 break-keep rounded-2xl border border-line bg-white p-5 text-sm leading-relaxed text-muted sm:text-base">
            {GUMJUNG_ELIGIBILITY[level.slug]}
          </p>
        </section>

        {/* B-5 준비 방법 비교 */}
        <CompareTable heading={GUMJUNG_METHOD_COMPARE.heading} rows={GUMJUNG_METHOD_COMPARE.rows} />

        {/* B-6 과목별 공부 포인트 (15장 링크 허브) */}
        <section aria-labelledby="points-heading">
          <h2 id="points-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            과목별 공부 포인트
          </h2>
          <ul className="mt-6 space-y-3">
            {level.requiredSubjects.map((s) => (
              <li key={s.slug} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="break-keep text-base font-bold text-ink">{s.label}</span>
                  <Link
                    href={`/gumjung/${level.slug}/${s.slug}`}
                    className="shrink-0 break-keep text-sm font-semibold text-accent transition-colors hover:underline"
                  >
                    {level.name} {s.label} 안내 →
                  </Link>
                </div>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted">
                  {GUMJUNG_SUBJECT_POINT[s.slug]}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* B-7 준비 흐름 */}
        <section aria-labelledby="flow-heading">
          <h2 id="flow-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {GUMJUNG_FLOW.heading}
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {GUMJUNG_FLOW.body}
          </p>
        </section>

        {/* 수업 진행 4단계 */}
        <StepList heading={GUMJUNG_STEPS.heading} steps={GUMJUNG_STEPS.steps} />

        {/* B-8 흔한 어려움 */}
        <section aria-labelledby="diff-heading">
          <h2 id="diff-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {GUMJUNG_DIFFICULTIES.heading}
          </h2>
          <ul className="mt-6 space-y-3">
            {GUMJUNG_DIFFICULTIES.items.map((it) => (
              <li key={it} className="flex gap-3 rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-muted sm:text-base">
                <span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="break-keep">{it}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 유형 섹션 (현행 확정 카피) */}
        <section aria-labelledby="types-heading">
          <h2 id="types-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {GUMJUNG_TYPE_SECTION.heading}
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GUMJUNG_TYPE_SECTION.items.map((it) => (
              <li key={it.title} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <p className="break-keep text-lg font-bold text-accent">{it.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">{it.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* B-10 합격 이후의 길 */}
        <section aria-labelledby="after-heading">
          <h2 id="after-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            합격 이후에는
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {after.body}
          </p>
          <div className="mt-4">
            <Link href={after.link.href} className="inline-flex min-h-11 items-center break-keep rounded-full border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/5">
              {after.link.label} →
            </Link>
          </div>
        </section>

        {/* B-11 보호자 안내 */}
        <section aria-labelledby="guardian-heading" className="rounded-3xl bg-accent/10 px-6 py-8">
          <h2 id="guardian-heading" className="break-keep text-xl font-bold text-ink sm:text-2xl">
            {GUMJUNG_GUARDIAN.heading}
          </h2>
          <p className="mt-3 break-keep text-sm leading-relaxed text-muted sm:text-base">
            {GUMJUNG_GUARDIAN.body}
          </p>
        </section>

        {/* FAQ 5 (현행 3 + 신규 2) */}
        <FaqList heading="자주 묻는 질문" items={faqAll} />

        {/* 관련 검색어 */}
        <TagCloud tags={gumjungLevelTags(level.name, level.slug)} />

        {/* 유형 가이드 7 링크 + 지역 허브 */}
        <LinkChips heading="유형별 준비 가이드" links={GUIDE_LINKS} />
        <LinkChips heading="지역별 검정고시" links={[{ label: "우리 지역 검정고시 찾기", href: "/gumjung/regions" }]} />

        {/* CTA */}
        <section className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            나에게 맞는 선생님과 1:1로 준비합니다
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            상담에서 현재 상황과 목표 시기를 확인하고, 지도 경험이 있는 선생님을 1:1로 연결해 드립니다. 첫 상담은 무료입니다.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={CONSULT_ANCHOR} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg">
              {site.cta.label} →
            </a>
            <a href={`tel:${site.contact.phone}`} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg">
              {site.contact.phone}
            </a>
          </div>
        </section>
      </div>

      <ConsultForm defaultMessage={`${level.examName} 1:1 상담 문의드립니다.`} />
    </>
  );
}
