import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GumjungSubjectDetail from "@/components/gumjung/GumjungSubjectDetail";
import {
  isGumjungSubjectAllowed,
  buildGumjungSubjectMetadata,
  allGumjungSubjectPairs,
} from "@/data/gumjung/subjects";

/*
 * /gumjung/[level]/[subject] — 검고의참견 급별×과목 상세(15장).
 * 급별 필수 과목만 허용(isGumjungSubjectAllowed), 그 외 조합은 404. 15장 고정이라 전량 SSG.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return allGumjungSubjectPairs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string; subject: string }>;
}): Promise<Metadata> {
  const { level, subject } = await params;
  if (!isGumjungSubjectAllowed(level, subject)) return {};
  return buildGumjungSubjectMetadata(level, subject);
}

export default async function GumjungSubjectPage({
  params,
}: {
  params: Promise<{ level: string; subject: string }>;
}) {
  const { level, subject } = await params;
  if (!isGumjungSubjectAllowed(level, subject)) notFound();
  return <GumjungSubjectDetail levelSlug={level} subjectSlug={subject} />;
}
