import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SchoolSubjectDetail from "@/components/SchoolSubjectDetail";
import JsonLd from "@/components/JsonLd";
import { subjects, subjectBySlug } from "@/data/subjects";
import { SCHOOLS, LEVEL_LABEL } from "@/data/schools";
import {
  findSchoolBySlug,
  sameRegionSchools,
  isAmbiguousSchoolName,
} from "@/lib/findSchool";
import { expandSchoolName } from "@/lib/schoolName";
import { resolveSubjectCopy } from "@/lib/subjectCopy";
import { buildSchoolFaq } from "@/data/schoolDetailCopy";
import {
  isArticlePilotSchool,
  articlePilotSchoolSlugs,
} from "@/data/articlePilotSchools";
import { buildSchoolArticle } from "@/data/schoolArticleSections";
import {
  buildSchoolMeta,
  shortRegion,
  serviceJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

/*
 * 학교×과목 상세 — /tutoring/by-school/[학교slug]/[과목]. 지역 상세와 동일 골격.
 * 폴더는 상위 [sido] 를 공유하므로 첫 파라미터 이름은 `sido` 이지만 실제로는 학교 slug 다.
 * (1세그 /by-school/{sido} 는 학교 브라우저, 2세그 /by-school/{학교}/{과목} 는 이 상세.)
 *
 * 렌더링: 파일럿 일부만 SSG + 나머지 ISR(온디맨드). 잘못된 학교/과목 조합 404.
 */
export const dynamicParams = true;
// 재배포 전까지 영구 캐시 — 시간 기반 재생성 없음(콘텐츠는 data 파일 기준).
export const revalidate = false;

const slugKey = (s: string) => decodeURIComponent(s).normalize("NFC");

/** 파일럿 — 앞쪽 학교 일부 × 과목 + 아티클 파일럿 샘플만 미리 생성. 나머지는 ISR. */
export function generateStaticParams() {
  const seedSchools = SCHOOLS.flatMap((sido) =>
    sido.sigungu.flatMap((sg) => sg.schools),
  ).slice(0, 4);
  const base = seedSchools.flatMap((sc) =>
    subjects.map((subj) => ({ sido: sc.slug, subject: subj.slug })),
  );
  // 아티클 목차 파일럿 샘플(SSR 아티팩트 검증용) — 파일럿 고교 소수 × 전 과목(핵심5=아티클, 역사 등=무변화 확인).
  const articleSamples = articlePilotSchoolSlugs()
    .slice(0, 3)
    .flatMap((slug) => subjects.map((subj) => ({ sido: slug, subject: subj.slug })));
  const seen = new Set(base.map((p) => `${p.sido}/${p.subject}`));
  return [
    ...base,
    ...articleSamples.filter((p) => !seen.has(`${p.sido}/${p.subject}`)),
  ];
}

function resolve(sidoParam: string, subjectParam: string) {
  const ctx = findSchoolBySlug(slugKey(sidoParam));
  const subject = subjectBySlug[slugKey(subjectParam)];
  if (!ctx || !subject) return null;
  return { ctx, subject };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; subject: string }>;
}): Promise<Metadata> {
  const { sido, subject } = await params;
  const r = resolve(sido, subject);
  if (!r) return {};
  const { ctx, subject: subj } = r;
  return buildSchoolMeta({
    schoolName: ctx.school.name,
    subjectLabel: subj.label,
    subjectSlug: subj.slug,
    schoolSlug: ctx.school.slug,
    // 동명이교(지역 접미사 slug)만 title 앞에 짧은 지역명을 붙여 검색어와 어순을 맞춘다.
    regionShort: isAmbiguousSchoolName(ctx.school.name)
      ? shortRegion(ctx.sigunguName)
      : undefined,
    // 초등은 내신 대신 단원평가·수행평가 프레이밍 description 을 쓰도록 학교급 전달.
    level: ctx.school.level,
    canonicalPath: `/tutoring/by-school/${ctx.school.slug}/${subj.slug}`,
  });
}

export default async function SchoolSubjectPage({
  params,
}: {
  params: Promise<{ sido: string; subject: string }>;
}) {
  const { sido, subject } = await params;
  const r = resolve(sido, subject);
  if (!r) notFound();
  const { ctx, subject: subj } = r;
  // 학교급 오버라이드(초등 등)를 병합한 과목 카피 — 렌더 전용. slug·label 은 불변이라 JSON-LD·메타 영향 없음.
  const subjForRender = resolveSubjectCopy(subj, ctx.school.level);

  // 아티클형 목차 섹션 — 전환 우선 지역 고교(파일럿) × 핵심 5과목만. 그 외는 null(기존 출력 불변).
  const article = isArticlePilotSchool(ctx.school.slug)
    ? buildSchoolArticle(ctx.school.name, subj.label, subj.slug)
    : null;

  const canonical = `/tutoring/by-school/${ctx.school.slug}/${subj.slug}`;
  const regionShort = isAmbiguousSchoolName(ctx.school.name)
    ? shortRegion(ctx.sigunguName)
    : "";
  const jsonLd = [
    serviceJsonLd({
      subjectLabel: subj.label,
      areaServed: ctx.sigunguName,
      canonicalPath: canonical,
    }),
    breadcrumbJsonLd([
      { name: "홈", path: "/" },
      { name: "학교별 과외", path: "/tutoring/by-school" },
      { name: `${regionShort ? regionShort + " " : ""}${ctx.school.name} ${subj.label}과외` },
    ]),
    // FAQPage — SchoolSubjectDetail 이 실제로 렌더링하는 Q&A(buildSchoolFaq)와 동일 소스.
    // 학교급별 분기가 렌더와 JSON-LD 에 동일하게 반영되도록 같은 levelLabel 을 넘긴다.
    faqJsonLd(buildSchoolFaq(ctx.school.name, LEVEL_LABEL[ctx.school.level])),
    // WebPage — 검색결과 신선도(발행/수정일) 신호. 날짜는 contentMeta.ts 상수.
    webPageJsonLd({
      name: `${ctx.school.name} ${subj.label}과외`,
      canonicalPath: canonical,
    }),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <SchoolSubjectDetail
      schoolSlug={ctx.school.slug}
      schoolName={ctx.school.name}
      schoolFullName={expandSchoolName(ctx.school.name)}
      levelLabel={LEVEL_LABEL[ctx.school.level]}
      sidoLabel={ctx.sidoLabel}
      sidoSlug={ctx.sidoSlug}
      sigunguName={ctx.sigunguName}
      subject={subjForRender}
      otherSchools={sameRegionSchools(ctx, 13)}
      article={article}
      />
    </>
  );
}
