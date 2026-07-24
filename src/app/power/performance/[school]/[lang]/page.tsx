import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PerformanceDetail from "@/components/PerformanceDetail";
import { buildPerformanceMetadata } from "@/data/performanceDetail";
import {
  allPowerPerformancePairs,
  isPowerPerformanceAllowed,
  POWER_LANGS,
  type PowerLang,
} from "@/data/powerSchoolDepts";

/*
 * /power/performance/[school]/[lang] — 어학의참견 유형 B(학교×언어 수행평가).
 *
 * 생성 대상: powerSchoolDepts 의 offered && verified 조합만(제외 학교·미개설 언어는 미생성) = 95페이지.
 * 소규모라 전량 SSG(generateStaticParams). 대상 외 조합은 404.
 * (/power/[region] 은 단일 세그먼트 catch-all — 4세그 깊이인 이 라우트와 충돌하지 않는다.)
 */
export const dynamicParams = false;

const isPowerLang = (v: string): v is PowerLang =>
  (POWER_LANGS as readonly string[]).includes(v);

export function generateStaticParams() {
  return allPowerPerformancePairs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school: string; lang: string }>;
}): Promise<Metadata> {
  const { school, lang } = await params;
  if (!isPowerLang(lang) || !isPowerPerformanceAllowed(school, lang)) return {};
  return buildPerformanceMetadata(school, lang);
}

export default async function PerformancePage({
  params,
}: {
  params: Promise<{ school: string; lang: string }>;
}) {
  const { school, lang } = await params;
  if (!isPowerLang(lang) || !isPowerPerformanceAllowed(school, lang)) notFound();
  return <PerformanceDetail schoolSlug={school} lang={lang} />;
}
