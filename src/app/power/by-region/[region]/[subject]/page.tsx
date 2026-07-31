import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ByRegionDetail from "@/components/ByRegionDetail";
import ByRegionExamDetail from "@/components/ByRegionExamDetail";
import {
  pilotByRegionPairs,
  isByRegionAllowed,
  buildByRegionMetadata,
} from "@/data/byRegionSubject";
import { isExamSlug } from "@/data/power/exams";
import {
  isByExamAllowed,
  buildByExamMetadata,
  examPilotPairs,
  examPilotRegionSlugs,
} from "@/data/byRegionExam";

/*
 * /power/by-region/[region]/[subject] — 어학의참견 유형 A.
 *
 * [subject] 세그먼트가 두 축을 겸한다:
 *   1) 어학과목(회화·과외) 5종 → ByRegionDetail (byRegionSubject)
 *   2) 어학시험 13종(toeic·jlpt·hsk …) → ByRegionExamDetail (byRegionExam)
 * isExamSlug 로 분기한다. 유효 지역 + 유효 slug 만 렌더하고 무효 조합은 404(스팸 크롤 URL 방지).
 * dynamicParams=true, revalidate=false(데이터는 정적 TS — 시간 기반 재생성 없음).
 */
export const dynamicParams = true;
export const revalidate = false;

/** 시험 지역축 파일럿 시군구 × 회화 3언어 — 역방향 시험 링크 SSG 검증용. */
const EXAM_PILOT_CONVERSATION_SUBJECTS = [
  "english-conversation",
  "japanese-conversation",
  "chinese-conversation",
] as const;

export function generateStaticParams() {
  const examPilotConversation = examPilotRegionSlugs().flatMap((region) =>
    EXAM_PILOT_CONVERSATION_SUBJECTS.map((subject) => ({ region, subject })),
  );
  return [...pilotByRegionPairs(), ...examPilotPairs(), ...examPilotConversation];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; subject: string }>;
}): Promise<Metadata> {
  const { region, subject } = await params;
  if (isExamSlug(subject)) {
    if (!isByExamAllowed(region, subject)) return {};
    return buildByExamMetadata(region, subject);
  }
  if (!isByRegionAllowed(region, subject)) return {};
  return buildByRegionMetadata(region, subject);
}

export default async function ByRegionPage({
  params,
}: {
  params: Promise<{ region: string; subject: string }>;
}) {
  const { region, subject } = await params;
  if (isExamSlug(subject)) {
    if (!isByExamAllowed(region, subject)) notFound();
    return <ByRegionExamDetail regionParam={region} examSlug={subject} />;
  }
  if (!isByRegionAllowed(region, subject)) notFound();
  return <ByRegionDetail regionParam={region} subjectSlug={subject} />;
}
