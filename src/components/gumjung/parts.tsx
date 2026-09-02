import Link from "next/link";

/*
 * 검고 상세 페이지 공통 렌더 조각(서버 컴포넌트). 지역·급별·가이드가 공유한다.
 * 색은 accent 토큰(청록, .gumjung-theme 스코프). 워딩은 데이터에서 주입.
 */

/** 수업 진행 4단계. */
export function StepList({
  heading,
  steps,
}: {
  heading: string;
  steps: readonly { n: number; title: string; body: string }[];
}) {
  return (
    <section aria-labelledby="steps-heading">
      <h2 id="steps-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
        {heading}
      </h2>
      <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-4 rounded-3xl border border-line bg-white p-5 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-white">
              {s.n}
            </span>
            <div>
              <p className="break-keep text-base font-bold text-ink">{s.title}</p>
              <p className="mt-1 break-keep text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** FAQ 목록(제목 + 문항). */
export function FaqList({
  heading,
  items,
}: {
  heading: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
        {heading}
      </h2>
      <dl className="mt-6 space-y-4">
        {items.map((f) => (
          <div key={f.q} className="rounded-2xl border border-line bg-white p-5">
            <dt className="break-keep text-base font-bold text-ink sm:text-lg">{f.q}</dt>
            <dd className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** 관련 검색어 태그(장식용 span, 클릭 불가). */
export function TagCloud({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <section aria-labelledby="tags-heading">
      <h2 id="tags-heading" className="break-keep text-xl font-bold text-ink sm:text-2xl">
        관련 검색어
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tags.map((t) => (
          <li
            key={t}
            className="break-keep rounded-full bg-surface-alt px-3 py-1.5 text-sm text-muted"
          >
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 준비 방법 비교표. */
export function CompareTable({
  heading,
  rows,
}: {
  heading: string;
  rows: readonly { method: string; pro: string; note: string }[];
}) {
  return (
    <section aria-labelledby="compare-heading">
      <h2 id="compare-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
        {heading}
      </h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm sm:text-base">
          <thead>
            <tr className="border-b border-line text-ink">
              <th className="py-3 pr-4 font-bold">방법</th>
              <th className="py-3 pr-4 font-bold">장점</th>
              <th className="py-3 font-bold">유의점</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.method} className="border-b border-line align-top">
                <td className="break-keep py-3 pr-4 font-semibold text-accent">{r.method}</td>
                <td className="break-keep py-3 pr-4 text-muted">{r.pro}</td>
                <td className="break-keep py-3 text-muted">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** 링크 칩 목록(인근 지역·관련 페이지 등). */
export function LinkChips({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  if (!links.length) return null;
  return (
    <section aria-labelledby={`lc-${heading}`}>
      <h2 id={`lc-${heading}`} className="break-keep text-xl font-bold text-ink sm:text-2xl">
        {heading}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="inline-flex min-h-11 items-center break-keep rounded-full border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/5"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
