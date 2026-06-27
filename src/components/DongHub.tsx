import Image from "next/image";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import SubjectTabs from "@/components/SubjectTabs";
import RelatedKeywords from "@/components/RelatedKeywords";
import { subjects } from "@/data/subjects";
import { site } from "@/data/site";
import {
  CONSULT_PHONE,
  STEPS,
  TRUST,
  WHY_COMMON,
  REVIEW_PLACEHOLDERS,
  HUB_CURRICULUM,
  buildHubIntro,
  buildHubStrategy,
  buildFaq,
  dongHref,
} from "@/data/dongPageCopy";

/*
 * DongHub — 동 허브(과목 선택). 학교×과목 상세(SchoolSubjectDetail)·동×과목 상세(DongSubjectDetail)와
 * 동일한 골격·디자인의 "사진 없는 텍스트 중심" 상세 페이지. 단, 과목 미선택 상태이므로
 * 과목 의존 섹션은 과목 공통(subject-agnostic) 카피로 채운다(dongPageCopy.ts).
 * h1 1개. 지역=sidoRegions, 과목=subjects, 링크=dongHref, 공통 카피=dongPageCopy.
 */

// 교실 학생 사진 — 한 곳에서 관리(기존 에셋 재사용).
const HERO_IMAGE = "/images/classroom-student.png";

type SgLite = { name: string; slug: string; dong: { name: string; slug: string }[] };

export default function DongHub({
  sidoSlug,
  sidoLabel,
  sigungu,
  dong,
  neighborDongs = [],
}: {
  sidoSlug: string;
  sidoLabel: string;
  sigungu: SgLite;
  dong: { name: string; slug: string };
  /** 같은 구의 다른 동 이름(현재 동 제외) — 관련 검색어 블록용. */
  neighborDongs?: string[];
}) {
  const intro = buildHubIntro(sigungu.name, dong.name);
  const strategyCards = buildHubStrategy(dong.name);
  const faq = buildFaq(dong.name);
  const consultMessage = `${sigungu.name} ${dong.name} 과외 문의드립니다.`;

  // "{동} 과목별 1:1 과외" — 장식 태그(클릭 불가). 8과목.
  const subjectTags = subjects.map((s) => `${dong.name} ${s.label}과외`);

  // 내부 링크 — 같은 구의 다른 동(현재 동 제외) → 각 동 허브.
  const otherDongs = [...sigungu.dong]
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .filter((d) => d.slug !== dong.slug)
    .slice(0, 12)
    .map((d) => ({ label: d.name, href: dongHref(sidoSlug, sigungu.slug, d.slug) }));

  // JSON-LD
  const base = site.url.replace(/\/$/, "");
  const hubPath = `/tutoring/by-region/${sidoSlug}/${sigungu.slug}/${dong.slug}`;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "지역별", url: `${base}/tutoring/by-region` },
      { name: sidoLabel, url: `${base}/tutoring/by-region/${sidoSlug}` },
      { name: sigungu.name, url: `${base}/tutoring/by-region/${sidoSlug}` },
      { name: dong.name, url: `${base}${hubPath}` },
    ].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* 브레드크럼 */}
      <nav aria-label="현재 위치" className="border-b border-line bg-white px-4 py-3 sm:px-6">
        <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 text-sm text-muted">
          <li><Link href="/tutoring/by-region" className="hover:text-accent">지역별</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li><Link href={`/tutoring/by-region/${sidoSlug}`} className="hover:text-accent">{sidoLabel}</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li aria-current="page" className="break-keep font-semibold text-ink">{sigungu.name} {dong.name}</li>
        </ol>
      </nav>

      {/* 1. Hero — 좌: 교실 학생 사진 / 우: 텍스트(모바일은 사진 위·텍스트 아래) */}
      <section className="border-b border-line bg-surface px-5 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* 왼쪽 — 교실 학생 사진(고정 비율, 인물 중심) */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md">
            <Image
              src={HERO_IMAGE}
              alt="교실에서 공부하는 학생"
              fill
              priority
              sizes="(min-width: 768px) 512px, 100vw"
              className="object-cover object-center"
              unoptimized
            />
          </div>

          {/* 오른쪽 — 텍스트(모바일 가운데 / 데스크톱 왼쪽 정렬) */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {sidoLabel} {sigungu.name}
            </p>
            <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
              {dong.name} 1:1 과외 — 과목을 선택하세요
            </h1>
            <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
              {dong.name}에서 1:1 맞춤 개인과외 수업이 가능한 선생님을 과목별로 안내해 드립니다.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
              <a href="#consult" className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg">
                무료 상담 신청
              </a>
              <a href={`tel:${CONSULT_PHONE}`} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg">
                {CONSULT_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 과목 선택 칩 — 각 동×과목 상세로 이동(현재 과목 없음 → 활성 없음) */}
      <SubjectTabs
        currentSlug=""
        makeHref={(s) => dongHref(sidoSlug, sigungu.slug, dong.slug, s)}
      />

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        {/* 3. 동 맞춤 도입 */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">{intro}</p>

        {/* 4. 왜 1:1 과외일까요 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
            왜 {dong.name}에서 1:1 과외일까요?
          </h2>
          <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">{WHY_COMMON}</p>
        </section>

        {/* 5. 커리큘럼 4단계(과목 공통) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">과목마다, 이렇게 가르칩니다</h2>
          <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HUB_CURRICULUM.map((c, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-sm font-semibold text-accent">{c.step}</p>
                <p className="mt-1 text-base font-bold text-ink">{c.title}</p>
                <p className="mt-1 break-keep text-sm leading-relaxed text-muted">{c.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 6. 진행 순서 STEP */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">상담부터 첫 수업까지</h2>
          <ol className="mt-5 space-y-3">
            {STEPS.map((s) => (
              <li key={s.no} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4">
                <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">STEP {s.no}</span>
                <div>
                  <p className="text-base font-bold text-ink">{s.title}</p>
                  <p className="mt-0.5 break-keep text-sm leading-relaxed text-muted">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 7. 믿어도 되는 이유 3가지 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">지식의참견을 믿어도 되는 이유</h2>
          <ul className="mt-5 space-y-3">
            {TRUST.map((t, i) => (
              <li key={i} className="flex items-start gap-3 break-keep text-base leading-relaxed text-ink sm:text-lg">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* 8. 후기(placeholder) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">수업 후기</h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REVIEW_PLACEHOLDERS.map((r, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">{r.label}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-ink">“{r.text}”</p>
                <p className="mt-2 text-xs text-muted">— {r.author}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. FAQ */}
        <section>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">자주 묻는 질문</h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {faq.map((f, i) => (
              <details key={i} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-base font-semibold text-ink sm:text-lg">
                  <span className="break-keep">{f.q}</span>
                  <span aria-hidden className="shrink-0 text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 break-keep text-base leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 10. 학습 전략 카드 4개 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{dong.name} 1:1 과외 학습 전략</h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {strategyCards.map((c, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-base font-bold text-ink">{c.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 11. 과목별 1:1 과외 — 장식 태그(클릭 불가) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{dong.name} 과목별 1:1 과외</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {subjectTags.map((t) => (
              <li key={t}>
                <span className="inline-flex break-keep rounded-full bg-surface-alt px-4 py-2 text-sm font-medium text-muted sm:text-base">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 12. 관련 검색어 — 기존 RelatedKeywords 컴포넌트 재사용 */}
      <RelatedKeywords regionName={dong.name} level="dong" neighborDongs={neighborDongs} />

      <div className="mx-auto max-w-3xl space-y-12 px-4 pb-12 sm:px-6 sm:pb-16">
        {/* 13. 같은 구의 다른 동 */}
        {otherDongs.length > 0 && (
          <section>
            <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{sigungu.name}의 다른 동</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {otherDongs.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block break-keep rounded-xl border border-line bg-white px-3 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {sigungu.dong.length > 13 && (
              <p className="mt-3 text-center text-sm">
                <Link href={`/tutoring/by-region/${sidoSlug}`} className="font-semibold text-accent hover:underline">더보기 →</Link>
              </p>
            )}
          </section>
        )}

        {/* 14. 최종 CTA */}
        <section className="rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            {dong.name}에서 어떤 과목 선생님이 맞을지 막막하다면, 상담부터 시작하세요. 직접 가르쳐 온 선생님이 함께 찾아 드립니다.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#consult" className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg">무료 상담 신청</a>
            <a href={`tel:${CONSULT_PHONE}`} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg">{CONSULT_PHONE}</a>
          </div>
        </section>
      </div>

      {/* 상담 폼(프리필) — #consult */}
      <ConsultForm defaultMessage={consultMessage} />
    </>
  );
}
