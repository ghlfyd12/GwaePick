import Link from "next/link";
import { subjects } from "@/data/subjects";
import { dongHref } from "@/data/dongPageCopy";

/*
 * DongHub — 동 허브(경량). 과목 컨텍스트 없이 동을 눌렀을 때, 5과목 상세로 가는 선택 화면.
 * h1 1개. 데이터는 subjects.ts / 링크는 dongHref.
 */
export default function DongHub({
  sidoSlug,
  sigungu,
  dong,
}: {
  sidoSlug: string;
  sigungu: { name: string; slug: string };
  dong: { name: string; slug: string };
}) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {sigungu.name} · {dong.name}
        </p>
        <h1 className="mx-auto mt-2 max-w-2xl break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {dong.name} 1:1 과외 — 과목을 선택하세요
        </h1>
        <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
          {dong.name}에서 1:1 맞춤 개인과외 수업이 가능한 선생님을 과목별로 안내해
          드립니다.
        </p>

        <ul className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
          {subjects.map((s) => (
            <li key={s.slug}>
              <Link
                href={dongHref(sidoSlug, sigungu.slug, dong.slug, s.slug)}
                className="flex min-h-16 items-center justify-center rounded-2xl border border-line bg-white text-lg font-bold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
