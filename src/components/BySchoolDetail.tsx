import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { buildBySchoolData } from "@/data/bySchoolSubject";

/*
 * BySchoolDetail — /power/by-school/[school]/[subject] 공용 상세 템플릿(서버 컴포넌트).
 *
 * 학교×어학과목(회화·과외) 페이지. 헤더·푸터·플로팅 CTA 는 루트 layout 상속.
 * 색은 accent 토큰만 — /power 스코프(.power-theme)에서 퍼플로 렌더된다(코랄 하드코딩 없음).
 * "수행평가" 단어는 본문에 쓰지 않고, 유형 B 로 가는 내부 링크 앵커 텍스트에서만 노출한다.
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

export default function BySchoolDetail({
  schoolSlug,
  subjectSlug,
}: {
  schoolSlug: string;
  subjectSlug: string;
}) {
  const data = buildBySchoolData(schoolSlug, subjectSlug);
  if (!data) return null;

  const canonical = `/power/by-school/${schoolSlug}/${subjectSlug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "어학의참견", item: abs("/power") },
        { "@type": "ListItem", position: 2, name: data.head, item: abs(canonical) },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface px-5 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            어학의참견 · {data.regionName}
          </p>
          <h1 className="mt-2 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight">
            {data.head}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.intro}
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
        {/* ── 2. 과목 특화 3카드 ──────────────────────────────────── */}
        <section aria-labelledby="cards-heading">
          <h2
            id="cards-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            {data.label}, 이렇게 준비합니다
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
            지금 수준과 목표에 맞춰, 필요한 것부터 1:1로 채웁니다.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {data.cards.map((c) => (
              <li key={c.title} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <p className="break-keep text-lg font-bold text-accent">{c.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {c.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3. 상담 선생님 연결 안내(원어민·교포 1:1) ────────────── */}
        <section
          aria-labelledby="match-heading"
          className="rounded-3xl bg-accent/10 px-6 py-10 sm:px-8"
        >
          <h2
            id="match-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            원어민·교포 선생님, 1:1로 연결합니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
            직접 가르쳐 온 상담 선생님이 {data.schoolName}의 학습 상황과 목표를 먼저
            파악합니다. 발음과 회화는 원어민 선생님, 문법과 설명은 한국어로 짚어 주는
            교포 선생님 중에서 아이와 호흡이 맞는 분을 1:1로 연결하고, 잘 맞지 않으면
            다시 연결해 드립니다. 첫 상담은 무료입니다.
          </p>
        </section>

        {/* ── 4. 내부 링크: 수행평가(유형 B) + 다른 어학과목 ───────── */}
        <section aria-labelledby="links-heading">
          <h2
            id="links-heading"
            className="break-keep text-center text-xl font-bold text-ink sm:text-2xl"
          >
            {data.schoolName} 어학 관련 페이지
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-3">
            {/* 같은 언어의 수행평가 페이지(앵커에만 "수행평가" 표기) */}
            <li>
              <Link
                href={data.performanceLink.href}
                className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent bg-accent/5 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 sm:text-base"
              >
                {data.performanceLink.label}
              </Link>
            </li>
            {data.otherSubjects.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 5. FAQ ──────────────────────────────────────────────── */}
        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            자주 묻는 질문
          </h2>
          <ul className="mt-8 space-y-4">
            {data.faq.map((f) => (
              <li key={f.q} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <p className="break-keep text-base font-bold text-ink sm:text-lg">Q. {f.q}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {f.a}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 6. 최종 CTA ─────────────────────────────────────────── */}
        <section
          aria-labelledby="closing-heading"
          className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12"
        >
          <h2
            id="closing-heading"
            className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl"
          >
            오늘 상담으로, 그 첫걸음을
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.schoolName} {data.label}, 맞는 선생님과 함께라면 차근히 시작할 수
            있습니다. 지금 상담으로 시작하세요.
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

      {/* ── 상담 폼(#consult) — 진입 학교·과목 프리필. /power 스코프라 어학 폼으로 자동 분기. ── */}
      <ConsultForm defaultMessage={`${data.schoolName} ${data.label} 1:1 상담 문의드립니다.`} />
    </>
  );
}
