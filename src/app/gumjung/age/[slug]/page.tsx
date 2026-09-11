import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GumjungAgeDetail from "@/components/gumjung/GumjungAgeDetail";
import { site } from "@/data/site";
import { GUMJUNG_AGE_SLUGS, getGumjungAge } from "@/data/gumjung/ages";
import { GUMJUNG_MODIFIED } from "@/data/contentMeta";

const isoKST = (d: string) => `${d}T00:00:00+09:00`;

/*
 * /gumjung/age/[slug] — 검고의참견 연령 축(14장: 13se~19se·20dae~70dae·senior).
 * 14종 고정 → 전량 SSG(dynamicParams=false). 그 외 값은 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return GUMJUNG_AGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const age = getGumjungAge(slug);
  if (!age) return {};
  const canonical = `/gumjung/age/${age.slug}`;
  const thumb = `/api/power-thumb/gumjung-age/${age.slug}/base?v=7`;
  const alt = `${age.h1} 과외 안내`;
  return {
    title: { absolute: age.metaTitle },
    description: age.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true },
    other: {
      "article:published_time": isoKST(GUMJUNG_MODIFIED),
      "article:modified_time": isoKST(GUMJUNG_MODIFIED),
    },
    openGraph: {
      title: age.metaTitle,
      description: age.metaDescription,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: site.gumjung.name,
      images: [
        { url: thumb, width: 1200, height: 630, alt },
        { url: `${thumb}&r=sq`, width: 1080, height: 1080, alt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: age.metaTitle,
      description: age.metaDescription,
      images: [{ url: thumb, width: 1200, height: 630, alt }],
    },
  };
}

export default async function GumjungAgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getGumjungAge(slug)) notFound();
  return <GumjungAgeDetail slug={slug} />;
}
