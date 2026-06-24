import type { Metadata } from "next";
import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import CategoryLanding from "@/components/CategoryLanding";
import { schoolLevels } from "@/data/categories";
import { SCHOOLS } from "@/data/schools";

const INTRO =
  "초등·중등·고등, 우리 아이 단계에 꼭 맞는 1:1 과외를 안내해 드립니다.";

export const metadata: Metadata = {
  title: "학교별 1:1 과외", // 루트 template → "학교별 1:1 과외 | 지식의참견"
  description: INTRO,
  alternates: { canonical: "/tutoring/by-school" },
};

export default function BySchoolPage() {
  return (
    <>
      <HeroSearch
        eyebrow="학교별"
        headlineLines={["우리 아이 학교에 맞춘", "단계별", "1:1 맞춤 과외"]}
        subCopyLines={[INTRO]}
        searchKind="school"
        searchLabel="학교 빠르게 검색"
        searchPlaceholder="학교 빠르게 검색 (예: ○○중학교, ○○고등학교)"
        searchEmptyMessage="학교 데이터에서 찾지 못했습니다. 바로 상담받으시면 학교에 맞춰 안내해 드립니다."
      />

      {/* 시·도 선택 → 학교별 시/도 페이지(학교 브라우저) */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl">
            시·도를 선택하세요
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
            시/도를 고르면 시·군·구·학교급으로 우리 학교를 찾을 수 있습니다.
          </p>
          <nav aria-label="학교별 시/도 목록" className="mt-7">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {SCHOOLS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/tutoring/by-school/${s.slug}`}
                    className="block rounded-xl border border-line bg-white px-3 py-3 text-center text-base font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <CategoryLanding
        hideHeader
        eyebrow="학교별"
        title="학교별 1:1 과외"
        intro={INTRO}
        items={schoolLevels}
      />
    </>
  );
}
