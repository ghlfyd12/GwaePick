import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SchoolSubjectDetail from "@/components/SchoolSubjectDetail";
import { subjects, subjectBySlug } from "@/data/subjects";
import { SCHOOLS, LEVEL_LABEL } from "@/data/schools";
import { findSchoolBySlug, sameRegionSchools } from "@/lib/findSchool";

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
  const name = ctx.school.name;
  const region = ctx.sigunguName;
  const title = `${name} ${subj.label} 과외 — ${region} 1:1 맞춤 개인과외 수업 | 지식의참견`;
  const description = `${region} ${name} ${subj.label} 1:1 맞춤 개인과외. 직접 가르쳐 온 선생님이 ${name} 학생에게 맞는 ${subj.label} 선생님을 연결해 드립니다. 내신 진도와 시험 범위에 맞춰 수업합니다.`;
  const canonical = `/tutoring/by-school/${ctx.school.slug}/${subj.slug}`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      `${name} ${subj.label}과외`,
      `${name} ${subj.label}`,
      `${region} ${subj.label}`,
      `${name} 과외`,
    ],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
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

  return (
    <SchoolSubjectDetail
      schoolSlug={ctx.school.slug}
      schoolName={ctx.school.name}
      levelLabel={LEVEL_LABEL[ctx.school.level]}
      sidoLabel={ctx.sidoLabel}
      sidoSlug={ctx.sidoSlug}
      sigunguName={ctx.sigunguName}
      subject={subj}
      otherSchools={sameRegionSchools(ctx, 13)}
    />
  );
}
