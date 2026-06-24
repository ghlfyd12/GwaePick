import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegionMap from "@/components/RegionMap";
import LinkToggleGrid from "@/components/LinkToggleGrid";
import SubjectChips from "@/components/SubjectChips";
import { sidoList, sidoBySlug } from "@/data/sido";
import { gyeonggi } from "@/data/gyeonggi";
import { DEFAULT_SUBJECT, pseoHref } from "@/data/pseo";
import { getSido } from "@/data/sidoRegions";
import RegionDongBrowser from "@/components/RegionDongBrowser";
import { site } from "@/data/site";

/*
 * 시/도 상세 — /tutoring/by-region/[sido]
 *  - 17개 시/도 공통: 시군구 경계 지도(RegionMap, sidoSlug 로 /geo/sigungu/{sido}.json fetch)
 *    → 폴리곤 클릭 시 같은 페이지의 동 브라우저가 해당 시군구로 전환(#sg-{slug} 앵커).
 *  - gyeonggi: 위에 더해 경기 pSEO 시·군·구 과목 그리드(기존 유지).
 * 17개 시/도 SSG. 잘못된 slug 는 404. 데이터는 sido.ts/gyeonggi.ts/sidoRegions.ts/GeoJSON 에서.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return sidoList.map((s) => ({ sido: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string }>;
}): Promise<Metadata> {
  const { sido } = await params;
  const s = sidoBySlug[sido];
  if (!s) return {};
  const title = `${s.label} 1:1 과외`;
  const description =
    sido === "seoul"
      ? "서울 25개 구 지도에서 우리 동네를 선택해 1:1 과외를 시작하세요. 직접 가르쳐 본 선생님이 아이에게 맞는 선생님을 연결해 드립니다."
      : sido === "gyeonggi"
        ? "경기도 시·군·구를 선택해 우리 동네 1:1 과외를 시작하세요. 직접 가르쳐 본 선생님이 아이에게 맞는 선생님을 연결해 드립니다."
        : `${s.label}에서 시작하는 1:1 과외. 직접 가르쳐 본 선생님이 아이에게 맞는 선생님을 연결해 드립니다.`;
  return {
    title,
    description,
    alternates: { canonical: `/tutoring/by-region/${s.slug}` },
  };
}

export default async function SidoPage({
  params,
}: {
  params: Promise<{ sido: string }>;
}) {
  const { sido } = await params;
  const s = sidoBySlug[sido];
  if (!s) notFound();

  const isGyeonggi = sido === "gyeonggi";
  // 동(洞) 데이터가 4개 이상인 시/도면 지도 아래 동 탐색 블록을 추가(경기는 데이터 미포함 → 미표시).
  const dongSido = getSido(sido);
  const totalDong = dongSido
    ? dongSido.sigungu.flatMap((sg) => sg.dong).length
    : 0;

  return (
    <>
      {/* 헤더 — 유일한 h1 */}
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          지역별 · {s.label}
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {s.label} 1:1 과외
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {isGyeonggi
            ? "지도에서 시·군·구를 선택하거나, 아래 과목별 지역 페이지로 이동하세요."
            : `지도에서 우리 동네(시·군·구)를 선택하면 그 지역 동 목록으로 이동합니다.`}
        </p>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        {/* 경기 시·군·구 — 과목 선택 칩 + 가나다 정렬/토글 그리드(기본 과목 포함 pSEO 링크) */}
        {isGyeonggi && (
          <div className="mx-auto max-w-4xl">
            <SubjectChips
              current={DEFAULT_SUBJECT}
              makeHref={(s) => pseoHref.sidoSubject(s)}
            />
            <div className="mt-8">
              <LinkToggleGrid
                items={[...gyeonggi.sigungu]
                  .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
                  .map((sg) => ({
                    label: sg.name,
                    href: pseoHref.sigunguSubject(sg.slug, DEFAULT_SUBJECT),
                  }))}
                heading="경기도 시군구 선택"
                badge={`${gyeonggi.sigungu.length}개 지역`}
                ariaLabel="경기도 시·군·구 목록"
              />
            </div>
          </div>
        )}

        {/* 시군구 경계 지도 + 동(洞) 탐색 — 동 4개 이상 시/도만. 지도 폴리곤 클릭 → 해당 시군구 동 목록. */}
        {dongSido && totalDong >= 4 && (
          <div className="mx-auto mt-14 max-w-5xl">
            <h2 className="break-keep text-center text-xl font-bold text-ink sm:text-2xl">
              {dongSido.label} 동네별 1:1 과외
            </h2>
            <p className="mx-auto mt-2 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
              지도에서 시·군·구를 선택하면 그 지역 동 목록으로 이동합니다. 전체보기에서 바로 찾아도 됩니다.
            </p>

            {/* 시군구 경계 지도(클라이언트 fetch) — 클릭 시 아래 동 브라우저가 해당 시군구로 전환 */}
            <div className="mx-auto mt-7 max-w-2xl">
              <RegionMap
                sidoSlug={sido}
                hrefMode="hash"
                ariaLabel={`${dongSido.label} 시·군·구 지도 — 지역을 선택하세요`}
              />
            </div>

            <div className="mt-8">
              <RegionDongBrowser sido={dongSido} />
            </div>
          </div>
        )}

        {/* 하단 공통 CTA — 상담 동선(/#consult) */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="text-base font-medium text-ink sm:text-lg">
            {s.label}에서 어떤 선생님이 맞을지 모르겠다면, 상담부터 시작하세요.
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
