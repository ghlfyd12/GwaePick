import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ByRegionDetail from "@/components/ByRegionDetail";
import {
  pilotByRegionPairs,
  isByRegionAllowed,
  buildByRegionMetadata,
} from "@/data/byRegionSubject";

/*
 * /power/by-region/[region]/[subject] — 어학의참견 유형 A(지역×어학과목).
 *
 * subject 5종: english-conversation / chinese-conversation / chinese-tutoring
 *            / japanese-conversation / japanese-tutoring
 * 대상: powerRegionSlugs(≈960) × 5과목. 빌드 시간 절감을 위해 파일럿만 SSG + 나머지 ISR.
 * dynamicParams=true 이지만 유효 지역(powerRegionSlugs 정확 일치) + 유효 과목만 렌더하고,
 * 무효 조합은 404 로 떨어뜨린다(스팸 크롤 URL 방지).
 * (/power/[region] 단일 세그먼트 catch-all 과 4세그 깊이라 충돌하지 않는다.)
 */
export const dynamicParams = true;
// 재배포 전까지 영구 캐시 — 콘텐츠는 data 기준(시간 기반 재생성 없음).
export const revalidate = false;

export function generateStaticParams() {
  return pilotByRegionPairs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; subject: string }>;
}): Promise<Metadata> {
  const { region, subject } = await params;
  if (!isByRegionAllowed(region, subject)) return {};
  return buildByRegionMetadata(region, subject);
}

export default async function ByRegionPage({
  params,
}: {
  params: Promise<{ region: string; subject: string }>;
}) {
  const { region, subject } = await params;
  if (!isByRegionAllowed(region, subject)) notFound();
  return <ByRegionDetail regionParam={region} subjectSlug={subject} />;
}
