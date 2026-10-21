import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GumjungGuideDetail from "@/components/gumjung/GumjungGuideDetail";
import { site } from "@/data/site";
import {
  GUMJUNG_GUIDE_SLUGS,
  getGumjungGuide,
} from "@/data/gumjung/guides";
import { powerThumbPath, powerThumbSq } from "@/lib/powerThumb";


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
  const thumb = powerThumbPath("gumjung-guide", guide.slug, "base");
  return {
    title: { absolute: guide.metaTitle },
    description: guide.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true },
    // 날짜 메타 제거(SERP 작성일 노출 방지, 2026-10-21).
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: site.gumjung.name,
      images: [
        { url: thumb, width: 1200, height: 630, alt: `${guide.navLabel} 안내` },
        { url: powerThumbSq(thumb), width: 1080, height: 1080, alt: `${guide.navLabel} 안내` },
      ],
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
