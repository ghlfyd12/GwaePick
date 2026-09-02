import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GumjungLevelDetail from "@/components/gumjung/GumjungLevelDetail";
import { site } from "@/data/site";
import {
  GUMJUNG_LEVEL_SLUGS,
  getGumjungLevel,
} from "@/data/gumjung/levels";
import { GUMJUNG_MODIFIED } from "@/data/contentMeta";

const isoKST = (d: string) => `${d}T00:00:00+09:00`;

/*
 * /gumjung/[level] — 검고의참견 급별 상세(고졸·중졸·초졸 3장).
 * 급별은 3개로 고정 → 전량 SSG(dynamicParams=false). 그 외 [level] 값은 404.
 * 형제 정적 라우트(by-region·guide·consult·regions)가 우선하므로 [level] 과 충돌하지 않는다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return GUMJUNG_LEVEL_SLUGS.map((level) => ({ level }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level: levelSlug } = await params;
  const level = getGumjungLevel(levelSlug);
  if (!level) return {};
  const title = level.metaTitle;
  const description = level.metaDescription;
  const canonical = `/gumjung/${level.slug}`;
  const thumb = `/api/power-thumb/gumjung-level/${level.slug}/base`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    other: {
      "article:published_time": isoKST(GUMJUNG_MODIFIED),
      "article:modified_time": isoKST(GUMJUNG_MODIFIED),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: site.gumjung.name,
      images: [{ url: thumb, width: 800, height: 600, alt: `${level.examName} 안내` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [thumb],
    },
  };
}

export default async function GumjungLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  if (!getGumjungLevel(level)) notFound();
  return <GumjungLevelDetail levelSlug={level} />;
}
