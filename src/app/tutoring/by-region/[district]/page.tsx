import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { districts } from "@/data/districts";
import { subjects } from "@/data/categories";
import { site } from "@/data/site";

/*
 * 서울 자치구 상세 페이지 — /tutoring/by-region/[district] (예: /tutoring/by-region/gangnam)
 *
 * districts.ts 의 25개 구를 빌드시 정적 생성(SSG). 잘못된 slug 는 404.
 * h1·인트로·과목 안내·하단 CTA(/#consult). 카피/데이터는 districts.ts·categories.ts 에서 가져온다.
 * 헤더/푸터/플로팅 버튼은 루트 layout 상속.
 */

export const dynamicParams = false; // 정의된 25개 구 외 slug 는 404

export function generateStaticParams() {
  return districts.map((d) => ({ district: d.slug }));
}

function getDistrict(slug: string) {
  return districts.find((d) => d.slug === slug);
}

const SUBJECT_LIST = subjects.map((s) => s.title).join("·");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ district: string }>;
}): Promise<Metadata> {
  const { district } = await params;
  const d = getDistrict(district);
  if (!d) return {};

  const title = `${d.name} 1:1 과외`; // 루트 template → "{구} 1:1 과외 | 지식의참견"
  const description = `${d.name}에서 시작하는 1:1 과외 — ${SUBJECT_LIST} 과목별로 아이에게 맞는 선생님을 무료 상담으로 연결해 드립니다.`;
  return {
    title,
    description,
    alternates: { canonical: `/tutoring/by-region/${d.slug}` },
  };
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ district: string }>;
}) {
  const { district } = await params;
  const d = getDistrict(district);
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
            {subjects.map((s) => (
              <li
                key={s.id}
                className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2 text-base font-semibold text-accent"
              >
                {s.title}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {SUBJECT_LIST}까지, {d.name} 학생에게 맞는 선생님을 상담으로
            안내해 드립니다.
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
