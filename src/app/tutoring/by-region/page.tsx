import type { Metadata } from "next";
import Link from "next/link";
import RegionMap, { type RegionFeatureCollection } from "@/components/RegionMap";
import koreaSido from "@/data/korea-sido.json";
import { sidoList } from "@/data/sido";

const INTRO = "지도에서 우리 지역을 선택하세요.";

export const metadata: Metadata = {
  title: "지역별 1:1 과외", // 루트 template → "지역별 1:1 과외 | 지식의참견"
  description:
    "전국 17개 시/도 지도에서 우리 지역을 선택해 1:1 과외를 시작하세요. 직접 가르쳐 본 선생님이 아이에게 맞는 선생님을 연결해 드립니다.",
  alternates: { canonical: "/tutoring/by-region" },
};

export default function ByRegionPage() {
  return (
    <>
      {/* 헤더 — 유일한 h1 */}
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          지역별
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
          지역별 1:1 과외
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {INTRO}
        </p>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        {/* 전국 시/도 지도 */}
        <div className="mx-auto max-w-2xl">
          <RegionMap
            geo={koreaSido as unknown as RegionFeatureCollection}
            hrefPrefix="/tutoring/by-region"
            ariaLabel="전국 시/도 지도 — 지역을 선택하세요"
          />
        </div>

        {/* 텍스트 링크 그리드(접근성·SEO·모바일 보조, 지도와 동일 목적지) */}
        <nav aria-label="시/도 목록" className="mx-auto mt-10 max-w-3xl">
          <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
            {sidoList.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/tutoring/by-region/${s.slug}`}
                  className="block rounded-xl border border-line bg-white px-3 py-3 text-center text-base font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </>
  );
}
