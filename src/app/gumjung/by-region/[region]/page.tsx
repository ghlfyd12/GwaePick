import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GumjungRegionDetail from "@/components/gumjung/GumjungRegionDetail";
import {
  isGumjungRegionSlug,
  buildGumjungRegionMetadata,
  gumjungRegionPilotSlugs,
} from "@/data/byRegionGumjung";

/*
 * /gumjung/by-region/[region] — 검고의참견 지역×검정고시(253장).
 * 전국 253 시군구(examRegions 재사용) 검증. 파일럿 20만 SSG, 나머지는 ISR(dynamicParams=true).
 * 데이터가 정적 TS 라 revalidate=false. 무효 지역은 404(스팸 URL 방지).
 */
export const dynamicParams = true;
export const revalidate = false;

export function generateStaticParams() {
  return gumjungRegionPilotSlugs().map((region) => ({ region }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  if (!isGumjungRegionSlug(region)) return {};
  return buildGumjungRegionMetadata(region);
}

export default async function GumjungRegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  if (!isGumjungRegionSlug(region)) notFound();
  return <GumjungRegionDetail regionParam={region} />;
}
