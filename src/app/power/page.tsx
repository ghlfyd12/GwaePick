import type { Metadata } from "next";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import CaseGroup from "@/components/power/CaseGroup";
import SafeImage from "@/components/SafeImage";
import { site } from "@/data/site";
import {
  powerHero,
  powerClosing,
  languagePrograms,
  languageSharedFlow,
} from "@/data/languagePrograms";
import { languageCases, CASE_GROUPS } from "@/data/languageCases";

/*
 * /power — 어학(영어·중국어·일본어) 전문 1:1 상담 랜딩.
 *
 * 골격: Hero(h1) → 언어 안내 3카드 → 최종 CTA + 상담 폼.
 * 헤더·푸터·우측 하단 플로팅 CTA 는 루트 layout 에서 자동 상속한다(여기서 만들지 않음).
 * 카피·카드 데이터는 languagePrograms.ts 단일 소스에서 가져온다(하드코딩 금지).
 */

const PAGE_TITLE =
  "어학 전문 과외 상담 | 영어·중국어·일본어 회화·시험·입시 | 지식의참견";
const PAGE_DESCRIPTION =
  "회화부터 토익·토플·HSK·JLPT, 입시 영어까지. 직접 가르쳐 온 선생님이 1:1로 상담하고 가장 잘 맞는 선생님과 연결해 드립니다.";

export const metadata: Metadata = {
  // 레이아웃의 title.template("%s | 지식의참견") 중복을 피하려 absolute 로 고정.
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/power" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    url: "/power",
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [site.ogImage],
  },
};

// 페이지 내 상담 폼(#consult) 으로 모으는 인페이지 CTA.
const CONSULT_ANCHOR = "#consult";

// 최상단 이미지 배너 소스(데스크톱 16:9 / 모바일 3:4 분리). 파일 없으면 SafeImage 가
// 빈 영역만 남겨 레이아웃이 깨지지 않는다(김아가 규격대로 저장하면 자동 연결).
const HERO_BANNER = {
  desktop: "/power/hero-desktop.png",
  mobile: "/power/hero-mobile.png",
};

// 학습사례를 3개 그룹으로 묶는다(카테고리 표준값 기준). 데이터는 languageCases.ts 그대로.
const caseGroups = CASE_GROUPS.map((g) => ({
  ...g,
  cases: languageCases.filter((c) => g.categories.includes(c.category)),
})).filter((g) => g.cases.length > 0);

export default function PowerPage() {
  return (
    <>
      {/* ── 이미지 배너 (최상단, 정적 full-bleed. 오버레이 없음 — 이미지가 카피 포함) ── */}
      <section aria-label="어학 전문 1:1 상담" className="w-full">
        {/* 데스크톱/태블릿 (md↑) 16:9 */}
        <div className="relative hidden aspect-[16/9] w-full bg-surface-alt md:block">
          <SafeImage
            src={HERO_BANNER.desktop}
            alt="어학 전문 1:1 상담"
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
        </div>
        {/* 모바일 (md 미만) 3:4 */}
        <div className="relative aspect-[3/4] w-full bg-surface-alt md:hidden">
          <SafeImage
            src={HERO_BANNER.mobile}
            alt="어학 전문 1:1 상담"
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
        </div>
      </section>

      {/* ── 텍스트 Hero (이미지 배너 아래로 이동, 내용·CTA 그대로) ──────── */}
      <section
        aria-labelledby="power-hero-heading"
        className="border-b border-line bg-surface px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {powerHero.eyebrow}
          </p>

          <h1
            id="power-hero-heading"
            className="mt-3 break-keep text-[1.6rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight"
          >
            {powerHero.headline.map((seg, i) =>
              seg.emphasis ? (
                <strong key={i} className="font-extrabold text-accent">
                  {seg.text}
                </strong>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {powerHero.sub}
          </p>

          {/* 즉시 보이는 CTA */}
          <div className="mt-7 flex justify-center">
            <Link
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label}
            </Link>
          </div>

          {/* 신뢰 뱃지 3종 */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {powerHero.badges.map((badge) => (
              <li
                key={badge}
                className="flex items-center gap-1.5 break-keep text-sm font-semibold text-ink"
              >
                <CheckIcon />
                {badge}
              </li>
            ))}
          </ul>
        </div>

        {/* 어떤 학습자인가 — 4개 블록 */}
        <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {powerHero.learnerTypes.map((learner) => (
            <li
              key={learner.text}
              className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4"
            >
              <span aria-hidden className="text-2xl leading-none">
                {learner.icon}
              </span>
              <span className="break-keep text-sm font-medium leading-relaxed text-ink sm:text-base">
                {learner.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 언어 안내 (3카드) ─────────────────────────────────────── */}
      <section
        aria-labelledby="power-languages-heading"
        className="px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="power-languages-heading"
            className="break-keep text-2xl font-bold text-ink sm:text-3xl"
          >
            언어별로, 지금 필요한 만큼
          </h2>
          <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">
            영어 · 중국어 · 일본어 모두 같은 흐름으로 — 현재 수준을 먼저 보고,
            회화 · 시험 · 입시 중 필요한 목표에 맞춰 수업합니다.
          </p>
        </div>

        {/* 공통 4단계 흐름 */}
        <ol className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 sm:flex-row sm:gap-4">
          {languageSharedFlow.map((stage, i) => (
            <li
              key={stage.step}
              className="flex flex-1 items-start gap-3 rounded-2xl bg-surface-alt p-4 sm:flex-col sm:gap-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="break-keep text-sm font-bold text-ink sm:text-base">
                  {stage.step}
                </p>
                <p className="mt-1 break-keep text-xs leading-relaxed text-muted sm:text-sm">
                  {stage.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* 언어 카드 3장 */}
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
          {languagePrograms.map((lang) => (
            <article
              key={lang.id}
              id={lang.id}
              className="flex scroll-mt-28 flex-col rounded-3xl border border-line bg-white p-6 shadow-sm"
            >
              <h3 className="flex items-center gap-2 break-keep text-xl font-bold text-ink">
                <span aria-hidden className="text-2xl leading-none">
                  {lang.emoji}
                </span>
                {lang.name}
              </h3>

              {/* 이런 학습자에게 */}
              <p className="mt-5 break-keep text-sm font-bold text-accent">
                이런 학습자에게
              </p>
              <ul className="mt-2 space-y-1.5">
                {lang.forLearners.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 break-keep text-sm leading-relaxed text-muted"
                  >
                    <DotIcon />
                    {line}
                  </li>
                ))}
              </ul>

              {/* 이렇게 도와드립니다 (영역) */}
              <p className="mt-5 break-keep text-sm font-bold text-accent">
                이렇게 도와드립니다
              </p>
              <ul className="mt-2 space-y-2">
                {lang.areas.map((area) => (
                  <li key={area.label} className="break-keep text-sm leading-relaxed">
                    <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                      {area.label}
                    </span>
                    <span className="ml-2 text-muted">{area.detail}</span>
                  </li>
                ))}
              </ul>

              {/* 커리큘럼 4단계 흐름(공통) */}
              <p className="mt-5 break-keep text-sm font-bold text-accent">
                커리큘럼 흐름
              </p>
              <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-ink">
                {languageSharedFlow.map((stage, i) => (
                  <li key={stage.step} className="flex items-center gap-1.5">
                    <span className="break-keep">{stage.step}</span>
                    {i < languageSharedFlow.length - 1 && (
                      <span aria-hidden className="text-accent">
                        →
                      </span>
                    )}
                  </li>
                ))}
              </ol>

              {/* 수업 방식 */}
              <p className="mt-5 break-keep text-sm font-bold text-accent">
                수업 방식
              </p>
              <p className="mt-2 break-keep text-sm leading-relaxed text-muted">
                {lang.method}
              </p>

              {/* 이 언어 상담 신청 */}
              <div className="mt-6 pt-2">
                <Link
                  href={CONSULT_ANCHOR}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-accent bg-white px-5 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
                  aria-label={`${lang.name} 무료 상담 신청`}
                >
                  {lang.name} 상담 신청 →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 어학 학습사례 (검색용, 별점·날짜·실명 없음) ──────────────── */}
      <section
        aria-labelledby="power-cases-heading"
        className="border-t border-line bg-surface px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              어학 학습사례
            </p>
            <h2
              id="power-cases-heading"
              className="mt-2 break-keep text-2xl font-bold text-ink sm:text-3xl"
            >
              어학, 이런 목표로 함께합니다
            </h2>
            <p className="mx-auto mt-3 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
              실제 상담에서 자주 나오는 학습 목표를 유형별로 정리한 예시입니다.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {caseGroups.map((g) => (
              <CaseGroup key={g.key} title={g.title} cases={g.cases} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label} →
            </a>
          </div>
        </div>
      </section>

      {/* ── 최종 CTA (희망 메시지) ───────────────────────────────── */}
      <section
        aria-labelledby="power-closing-heading"
        className="px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="power-closing-heading"
            className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl"
          >
            오늘 상담으로, 그 첫걸음을
          </h2>
          <p className="mx-auto mt-5 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {powerClosing.message}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label} →
            </Link>
            <a
              href={`tel:${site.contact.phone}`}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg"
            >
              {site.contact.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── 상담 폼(#consult) — 전화·카카오·폼 일체. 기존 공통 컴포넌트 재사용. ── */}
      <ConsultForm defaultMessage="어학(영어·중국어·일본어) 상담 문의드립니다." />
    </>
  );
}

/* ── 아이콘 ──────────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-accent"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DotIcon() {
  return (
    <span
      aria-hidden
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
    />
  );
}
