import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GumjungGuideDetail from "@/components/gumjung/GumjungGuideDetail";
import { site } from "@/data/site";
import {
  GUMJUNG_GUIDE_SLUGS,
  getGumjungGuide,
} from "@/data/gumjung/guides";
import { GUMJUNG_MODIFIED } from "@/data/contentMeta";

const isoKST = (d: string) => `${d}T00:00:00+09:00`;

/*
 * /gumjung/guide/[type] — 검고의참견 유형 가이드(7장).
 * 7종 고정 → 전량 SSG(dynamicParams=false). 그 외 값은 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return GUMJUNG_GUIDE_SLUGS.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const guide = getGumjungGuide(type);
  if (!guide) return {};
  const canonical = `/gumjung/guide/${guide.slug}`;
  const thumb = `/api/power-thumb/gumjung-guide/${guide.slug}/base`;
  return {
    title: { absolute: guide.metaTitle },
    description: guide.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true },
    other: {
      "article:published_time": isoKST(GUMJUNG_MODIFIED),
      "article:modified_time": isoKST(GUMJUNG_MODIFIED),
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: site.gumjung.name,
      images: [{ url: thumb, width: 800, height: 600, alt: `${guide.navLabel} 안내` }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [thumb],
    },
  };
}

export default async function GumjungGuidePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!getGumjungGuide(type)) notFound();
  return <GumjungGuideDetail typeSlug={type} />;
}
