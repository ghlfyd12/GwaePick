import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BySchoolDetail from "@/components/BySchoolDetail";
import {
  allBySchoolPairs,
  isBySchoolAllowed,
  buildBySchoolMetadata,
} from "@/data/bySchoolSubject";

/*
 * /power/by-school/[school]/[subject] — 어학의참견 유형 A(학교×어학과목).
 *
 * subject 5종: english-conversation / chinese-conversation / chinese-tutoring
 *            / japanese-conversation / japanese-tutoring
 * 생성 대상: powerSchoolDepts 기준 해당 언어 offered && verified 조합만 = 149페이지.
 *   (영어회화 41 + 중국어 회화·과외 28+28 + 일본어 회화·과외 26+26)
 * 소규모라 전량 SSG. 대상 외(국제중·고의 중·일, 이화·전남 일본어, 제외 4교)는 404.
 * (/power/[region] 단일 세그먼트 catch-all 과 4세그 깊이라 충돌하지 않는다.)
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return allBySchoolPairs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school: string; subject: string }>;
}): Promise<Metadata> {
  const { school, subject } = await params;
  if (!isBySchoolAllowed(school, subject)) return {};
  return buildBySchoolMetadata(school, subject);
}

export default async function BySchoolPage({
  params,
}: {
  params: Promise<{ school: string; subject: string }>;
}) {
  const { school, subject } = await params;
  if (!isBySchoolAllowed(school, subject)) notFound();
  return <BySchoolDetail schoolSlug={school} subjectSlug={subject} />;
}
