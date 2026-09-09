import type { Metadata } from "next";
import GumjungScheduleDetail from "@/components/gumjung/GumjungScheduleDetail";
import { site } from "@/data/site";
import { GUMJUNG_SCHEDULE_HUB } from "@/data/gumjung/schedule";
import { GUMJUNG_MODIFIED } from "@/data/contentMeta";

const isoKST = (d: string) => `${d}T00:00:00+09:00`;

/* /gumjung/schedule — 검정고시 일정 허브(SSG). */
export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  const canonical = "/gumjung/schedule";
  const thumb = "/api/power-thumb/gumjung-schedule/hub/base?v=4";
  const alt = "검정고시 일정 안내";
  return {
    title: { absolute: GUMJUNG_SCHEDULE_HUB.metaTitle },
    description: GUMJUNG_SCHEDULE_HUB.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true },
    other: {
      "article:published_time": isoKST(GUMJUNG_MODIFIED),
      "article:modified_time": isoKST(GUMJUNG_MODIFIED),
    },
    openGraph: {
      title: GUMJUNG_SCHEDULE_HUB.metaTitle,
      description: GUMJUNG_SCHEDULE_HUB.metaDescription,
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
      title: GUMJUNG_SCHEDULE_HUB.metaTitle,
      description: GUMJUNG_SCHEDULE_HUB.metaDescription,
      images: [{ url: thumb, width: 1200, height: 630, alt }],
    },
  };
}

export default function GumjungScheduleHubPage() {
  return <GumjungScheduleDetail />;
}
