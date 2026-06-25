import { site } from "@/data/site";
import type { CategoryItem } from "@/data/categories";
import DetailTrustBlock from "@/components/DetailTrustBlock";

/*
 * CategoryLanding — 과외 상위 카테고리 안내 페이지 공통 레이아웃.
 *
 * h1(페이지당 1개) + 인트로 + 카드 그리드(모바일 2열 → 데스크톱 3열) + 하단 CTA.
 * 모든 카드/CTA 는 상담 동선(/#consult)으로 연결(추후 pSEO 상세로 교체 예정).
 * 카드 내용은 categories.ts 에서 받아온다(하드코딩 금지).
 */
export default function CategoryLanding({
  eyebrow,
  title,
  intro,
  items,
  note,
  hideHeader = false,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  /** 카드 그리드 항목. 생략/빈 배열이면 그리드 섹션 자체를 렌더하지 않는다. */
  items?: CategoryItem[];
  /** 그리드 하단 안내 한 줄(선택) */
  note?: string;
  /** 상단 헤더(eyebrow/h1/intro) 숨김 — 위에 HeroSearch 가 h1 을 제공할 때 사용 */
  hideHeader?: boolean;
}) {
  return (
    <>
      {/* 페이지 헤더 — h1. HeroSearch 를 쓰는 페이지(학교/과목)는 hideHeader 로 생략(h1 중복 방지) */}
      {!hideHeader && (
        <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {intro}
          </p>
        </section>
      )}

      {/* 카드 그리드 + 하단 안내 — items 가 있을 때만(없으면 섹션 자체를 생략) */}
      {items && items.length > 0 && (
      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href="/#consult"
                aria-label={`${item.title} — 무료 상담 신청`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <p className="text-lg font-bold text-ink sm:text-xl">
                  {item.title}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {item.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  상담 신청
                  <span aria-hidden>→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* 그리드 하단 안내 */}
        {note && (
          <p className="mx-auto mt-6 max-w-5xl text-center text-sm text-muted">
            {note}
          </p>
        )}
      </section>
      )}

      {/* 공통 상세 신뢰 블록 — 3가지 이유 · 자질/역량 · 합격 후기 캐러셀 */}
      <DetailTrustBlock />

      <section className="px-4 pb-14 sm:px-6 sm:pb-16">
        {/* 하단 공통 CTA — 상담 동선(/#consult) */}
        <div className="mx-auto mt-4 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="text-base font-medium text-ink sm:text-lg">
            어떤 선생님이 맞을지 모르겠다면, 상담부터 시작하세요.
          </p>
          <div className="mt-5">
            <a
              href={site.cta.href}
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-lg"
            >
              {site.cta.label}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
