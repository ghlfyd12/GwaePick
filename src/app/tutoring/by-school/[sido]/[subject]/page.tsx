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
import { buildSchoolFaq } from "@/data/schoolDetailCopy";
import {
  buildSchoolMeta,
  shortRegion,
  serviceJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";

/*
 * 학교×과목 상세 — /tutoring/by-school/[학교slug]/[과목]. 지역 상세와 동일 골격.
 * 폴더는 상위 [sido] 를 공유하므로 첫 파라미터 이름은 `sido` 이지만 실제로는 학교 slug 다.
 * (1세그 /by-school/{sido} 는 학교 브라우저, 2세그 /by-school/{학교}/{과목} 는 이 상세.)
 *
 * 렌더링: 파일럿 일부만 SSG + 나머지 ISR(온디맨드). 잘못된 학교/과목 조합 404.
 */
export const dynamicParams = true;
export const revalidate = 86400;

const slugKey = (s: string) => decodeURIComponent(s).normalize("NFC");

/** 파일럿 — 앞쪽 학교 일부 × 6과목만 미리 생성. 나머지는 ISR. */
export function generateStaticParams() {
  const seedSchools = SCHOOLS.flatMap((sido) =>
    sido.sigungu.flatMap((sg) => sg.schools),
  ).slice(0, 4);
  return seedSchools.flatMap((sc) =>
    subjects.map((subj) => ({ sido: sc.slug, subject: subj.slug })),
  );
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
    // 동명이교(지역 접미사 slug)만 title 앞에 짧은 지역명을 붙여 검색어와 어순을 맞춘다.
    regionShort: isAmbiguousSchoolName(ctx.school.name)
      ? shortRegion(ctx.sigunguName)
      : undefined,
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
    faqJsonLd(buildSchoolFaq(ctx.school.name)),
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
      subject={subj}
      otherSchools={sameRegionSchools(ctx, 13)}
      />
    </>
  );
}
