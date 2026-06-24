import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeroSearch from "@/components/HeroSearch";
import SchoolBrowser from "@/components/SchoolBrowser";
import { SCHOOLS, getSchoolSido } from "@/data/schools";
import { site } from "@/data/site";

/*
 * 학교별 시/도 — /tutoring/by-school/[sido]. 지역별과 동일 구도(지도만 제외).
 * 공통 히어로(school 검색) + 섹션 제목 + SchoolBrowser + 상담 CTA. 17개 시/도 SSG.
 * h1 = 히어로 헤드라인 1개. 데이터는 schools.ts(서버에서 해당 시/도만 추출해 클라에 전달).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return SCHOOLS.map((s) => ({ sido: s.slug }));
}

const HERO = {
  eyebrow: "학교별",
  headlineLines: ["우리 아이 학교에 맞춘", "단계별", "1:1 맞춤 과외"],
  subCopyLines: ["초등·중등·고등, 우리 아이 단계에 꼭 맞는 1:1 과외를 안내해 드립니다."],
  searchLabel: "학교 빠르게 검색",
  searchPlaceholder: "학교 빠르게 검색 (예: ○○중학교, ○○고등학교)",
  searchEmptyMessage:
    "학교 데이터에서 찾지 못했습니다. 바로 상담받으시면 학교에 맞춰 안내해 드립니다.",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string }>;
}): Promise<Metadata> {
  const { sido } = await params;
  const s = getSchoolSido(sido);
  if (!s) return {};
  const title = `${s.label} 학교별 1:1 과외 — 지식의참견`;
  const description = `${s.label}의 초·중·고 학교별 1:1 맞춤 과외. 시·군·구와 학교급으로 우리 학교를 찾고, 아이에게 맞는 선생님을 상담으로 연결해 드립니다.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/tutoring/by-school/${s.slug}` },
    openGraph: { title, description, url: `/tutoring/by-school/${s.slug}`, type: "website" },
  };
}

export default async function SchoolSidoPage({
  params,
}: {
  params: Promise<{ sido: string }>;
}) {
  const { sido } = await params;
  const schoolSido = getSchoolSido(sido);
  if (!schoolSido) notFound();

  return (
    <>
      {/* 공통 히어로(지역별과 동일 구도, 지도 없음) — 유일한 h1 */}
      <HeroSearch
        eyebrow={HERO.eyebrow}
        headlineLines={[...HERO.headlineLines]}
        subCopyLines={[...HERO.subCopyLines]}
        searchKind="school"
        searchLabel={HERO.searchLabel}
        searchPlaceholder={HERO.searchPlaceholder}
        searchEmptyMessage={HERO.searchEmptyMessage}
      />

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl">
            {schoolSido.label} 학교별 1:1 과외
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
            시·군·구나 학교급을 선택하거나, 전체보기에서 우리 학교를 찾아보세요.
          </p>

          <div className="mt-7">
            <SchoolBrowser sido={schoolSido} />
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium text-ink sm:text-lg">
            우리 학교가 안 보이시나요? 바로 상담받으세요.
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
