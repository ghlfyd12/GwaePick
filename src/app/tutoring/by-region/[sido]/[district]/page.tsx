import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { districts } from "@/data/districts";
import { subjects } from "@/data/categories";
import { site } from "@/data/site";

/*
 * 구 상세 — /tutoring/by-region/[sido]/[district] (현재 sido=seoul 만 하위 구 보유)
 *
 * seoul × 25개 구 SSG. 그 외 조합은 404. h1·인트로(구 이름 포함)·과목 안내·상담 CTA.
 * 카피/데이터는 districts.ts·categories.ts 에서 가져온다. CTA 는 /#consult.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // 현재 서울만 하위 구를 가진다.
  return districts.map((d) => ({ sido: "seoul", district: d.slug }));
}

function getGu(sido: string, district: string) {
  if (sido !== "seoul") return undefined;
  return districts.find((d) => d.slug === district);
}

const SUBJECT_LIST = subjects.map((s) => s.title).join("·");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; district: string }>;
}): Promise<Metadata> {
  const { sido, district } = await params;
  const d = getGu(sido, district);
  if (!d) return {};
  const title = `${d.name} 1:1 과외`;
  const description = `${d.name}에서 시작하는 1:1 과외 — ${SUBJECT_LIST} 과목별로 아이에게 맞는 선생님을 무료 상담으로 연결해 드립니다.`;
  return {
    title,
    description,
    alternates: { canonical: `/tutoring/by-region/${sido}/${d.slug}` },
  };
}

export default async function GuPage({
  params,
}: {
  params: Promise<{ sido: string; district: string }>;
}) {
  const { sido, district } = await params;
  const d = getGu(sido, district);
  if (!d) notFound();

  return (
    <>
      {/* 헤더 — 유일한 h1 */}
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          서울 지역별 과외
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {d.name} 1:1 과외
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {d.name}에서 시작하는 1:1 과외. 직접 가르쳐 본 선생님이 아이에게 맞는
          선생님을 연결해 드립니다.
        </p>
      </section>

      {/* 과목 안내 + 하단 CTA */}
      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            {d.name}에서 만나는 과목별 1:1 과외
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2 text-base font-semibold text-accent"
              >
                {subject.title}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {SUBJECT_LIST}까지, {d.name} 학생에게 맞는 선생님을 상담으로 안내해
            드립니다.
          </p>
        </div>

        {/* 하단 공통 CTA — 상담 동선(/#consult) */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="text-base font-medium text-ink sm:text-lg">
            {d.name}에서 어떤 선생님이 맞을지 모르겠다면, 상담부터 시작하세요.
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
