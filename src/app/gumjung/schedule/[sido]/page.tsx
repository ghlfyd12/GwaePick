import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GumjungScheduleDetail from "@/components/gumjung/GumjungScheduleDetail";
import { site } from "@/data/site";
import { GUMJUNG_SIDO_SLUGS, getGumjungSido, gumjungSidoMeta } from "@/data/gumjung/schedule";
import { GUMJUNG_MODIFIED } from "@/data/contentMeta";

const isoKST = (d: string) => `${d}T00:00:00+09:00`;

/*
 * /gumjung/schedule/[sido] — 시도 검정고시 일정(17장, 전량 SSG). 그 외 값은 404.
 * 시군구 단위 페이지는 만들지 않는다(중복 저품질 방지).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return GUMJUNG_SIDO_SLUGS.map((sido) => ({ sido }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string }>;
}): Promise<Metadata> {
  const { sido: slug } = await params;
  const sido = getGumjungSido(slug);
  if (!sido) return {};
  const meta = gumjungSidoMeta(sido);
  const canonical = `/gumjung/schedule/${sido.slug}`;
  const thumb = `/api/power-thumb/gumjung-schedule/${sido.slug}/base?v=8`;
  const alt = `${sido.short} 검정고시 일정 안내`;
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    other: {
      "article:published_time": isoKST(GUMJUNG_MODIFIED),
      "article:modified_time": isoKST(GUMJUNG_MODIFIED),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
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
      title: meta.title,
      description: meta.description,
      images: [{ url: thumb, width: 1200, height: 630, alt }],
    },
  };
}

export default async function GumjungScheduleSidoPage({
  params,
}: {
  params: Promise<{ sido: string }>;
}) {
  const { sido } = await params;
  if (!getGumjungSido(sido)) notFound();
  return <GumjungScheduleDetail sidoSlug={sido} />;
}
