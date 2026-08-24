import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeroSearch from "@/components/HeroSearch";
import SchoolBrowser from "@/components/SchoolBrowser";
import Pagination from "@/components/Pagination";
import SchoolHub from "@/components/school/SchoolHub";
import JsonLd from "@/components/JsonLd";
import { SCHOOLS, getSchoolSido, LEVEL_LABEL } from "@/data/schools";
import { flatSchoolsOfSido } from "@/lib/schoolList";
import { pageCount } from "@/lib/paginate";
import {
  findSchoolBySlug,
  sameRegionSchoolsByLevel,
  isAmbiguousSchoolName,
} from "@/lib/findSchool";
import { expandSchoolName } from "@/lib/schoolName";
import {
  buildSchoolHubMeta,
  shortRegion,
  serviceJsonLd,
  breadcrumbJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import { SCHOOL_HUB_PUBLISHED, SCHOOL_HUB_MODIFIED } from "@/data/contentMeta";
import { site } from "@/data/site";

const PAGE_SIZE = 48;

/*
 * /tutoring/by-school/[sido] — 단일 세그먼트 이중 용도:
 *   (1) 시도 slug(17) → 시도 인덱스(SchoolBrowser). SSG 시드 유지.
 *   (2) 고교 학교 slug → 학교 단위 허브(SchoolHub, 과목 없음). ISR 온디맨드.
 *   (3) 그 외(중·초 slug 포함) → 404. 중·초 허브는 확대 시 별도 승인.
 * 상세(학교×과목)는 하위 [subject] 세그먼트가 담당(이 파일 무관).
 */
export const dynamicParams = true;
// 재배포 전까지 영구 캐시 — 시간 기반 재생성 없음(콘텐츠는 data 파일 기준).
export const revalidate = false;

// 시도 17개만 미리 생성(시드). 고교 허브는 온디맨드(빌드 시간 무증가).
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

/** 고교 학교 slug 인지 — 시도가 아니고, 해석된 level=고등학교. */
function resolveHighSchool(param: string) {
  const ctx = findSchoolBySlug(param);
  if (!ctx || LEVEL_LABEL[ctx.school.level] !== "고등학교") return null;
  return ctx;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string }>;
}): Promise<Metadata> {
  const { sido } = await params;

  // (1) 시도 인덱스
  const s = getSchoolSido(sido);
  if (s) {
    const title = `${s.label} 학교별 1:1 과외 — 지식의참견`;
    const description = `${s.label}의 초·중·고 학교별 1:1 맞춤 과외. 시·군·구와 학교급으로 우리 학교를 찾고, 아이에게 맞는 선생님을 상담으로 연결해 드립니다.`;
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: `/tutoring/by-school/${s.slug}` },
      openGraph: { title, description, url: `/tutoring/by-school/${s.slug}`, type: "website" },
    };
  }

  // (2) 고교 허브
  const ctx = resolveHighSchool(sido);
  if (ctx) {
    return buildSchoolHubMeta({
      schoolName: ctx.school.name,
      schoolFullName: expandSchoolName(ctx.school.name),
      regionShort: isAmbiguousSchoolName(ctx.school.name)
        ? shortRegion(ctx.sigunguName)
        : undefined,
      canonicalPath: `/tutoring/by-school/${ctx.school.slug}`,
    });
  }

  return {};
}

export default async function SchoolSidoPage({
  params,
}: {
  params: Promise<{ sido: string }>;
}) {
  const { sido } = await params;
  const schoolSido = getSchoolSido(sido);

  // (2) 고교 허브 — 시도가 아니면 고교 학교 slug 로 조회.
  if (!schoolSido) {
    const ctx = resolveHighSchool(sido);
    if (!ctx) notFound(); // 중·초 slug·미존재 slug → 404

    const canonical = `/tutoring/by-school/${ctx.school.slug}`;
    const jsonLd = [
      serviceJsonLd({ areaServed: ctx.sigunguName, canonicalPath: canonical }),
      breadcrumbJsonLd([
        { name: "홈", path: "/" },
        { name: "학교별 과외", path: "/tutoring/by-school" },
        { name: `${ctx.school.name} 과외` },
      ]),
      webPageJsonLd({
        name: `${ctx.school.name} 과외`,
        canonicalPath: canonical,
        published: SCHOOL_HUB_PUBLISHED,
        modified: SCHOOL_HUB_MODIFIED,
      }),
    ];
    return (
      <>
        <JsonLd data={jsonLd} />
        <SchoolHub
          schoolSlug={ctx.school.slug}
          schoolName={ctx.school.name}
          schoolFullName={expandSchoolName(ctx.school.name)}
          levelLabel={LEVEL_LABEL[ctx.school.level]}
          sidoLabel={ctx.sidoLabel}
          sidoSlug={ctx.sidoSlug}
          sigunguName={ctx.sigunguName}
          otherSchools={sameRegionSchoolsByLevel(ctx, ctx.school.level, 12)}
        />
      </>
    );
  }

  // (1) 시도 인덱스 (기존)
  const totalPages = pageCount(flatSchoolsOfSido(schoolSido).length, PAGE_SIZE);

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

          {/* 크롤 가능한 페이지네이션 — 전체보기 목록의 나머지 페이지로 도달(서버 <a>) */}
          <Pagination
            page={1}
            totalPages={totalPages}
            basePath={`/tutoring/by-school/${schoolSido.slug}`}
            ariaLabel={`${schoolSido.label} 학교 목록 페이지`}
          />
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
