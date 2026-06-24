import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PseoLanding from "@/components/PseoLanding";
import LinkToggleGrid from "@/components/LinkToggleGrid";
import SubjectChips from "@/components/SubjectChips";
import { buildRegionContent } from "@/lib/regionContent";
import {
  subjectBySlug,
  PSEO_SIDO,
  DEFAULT_SUBJECT,
  slugKey,
  pseoHref,
} from "@/data/pseo";
import { gyeonggi, sigunguBySlug } from "@/data/gyeonggi";

/*
 * 3-seg — /경기/[시군구]/[과목]. ISR. 잘못된 시군구/과목 404.
 */
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  // 시드: 첫 시군구 × 기본 과목 1개만. 나머지 ISR.
  const first = gyeonggi.sigungu[0]?.slug;
  return first ? [{ sido: PSEO_SIDO, seg2: first, seg3: DEFAULT_SUBJECT }] : [];
}

function resolve(sido: string, seg2: string, seg3: string) {
  if (slugKey(sido) !== PSEO_SIDO) return null;
  const sg = sigunguBySlug[slugKey(seg2)];
  const subj = subjectBySlug[slugKey(seg3)];
  if (!sg || !subj) return null;
  return { sg, subj };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string }>;
}): Promise<Metadata> {
  const { sido, seg2, seg3 } = await params;
  const r = resolve(sido, seg2, seg3);
  if (!r) return {};
  const c = buildRegionContent({
    sidoLabel: gyeonggi.sidoLabel,
    sigunguLabel: r.sg.name,
    subjectLabel: r.subj.label,
  });
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    alternates: { canonical: pseoHref.sigunguSubject(r.sg.slug, r.subj.slug) },
    openGraph: { title: c.ogTitle, description: c.metaDescription },
  };
}

export default async function Seg3Page({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string }>;
}) {
  const { sido, seg2, seg3 } = await params;
  const r = resolve(sido, seg2, seg3);
  if (!r) notFound();
  const { sg, subj } = r;

  const content = buildRegionContent({
    sidoLabel: gyeonggi.sidoLabel,
    sigunguLabel: sg.name,
    subjectLabel: subj.label,
  });
  const breadcrumb = [
    { label: "홈", href: "/" },
    { label: gyeonggi.sidoLabel, href: pseoHref.sidoSubject(subj.slug) },
    { label: `${sg.name} ${subj.label}` },
  ];
  // 동 목록 → /경기/{시군구}/{동}/{과목}
  const items = sg.dongs.map((d) => ({
    label: d.name,
    href: pseoHref.dongSubject(sg.slug, d.slug, subj.slug),
  }));

  return (
    <PseoLanding
      content={content}
      breadcrumb={breadcrumb}
      regionLabel={sg.name}
      consultMessage={`${sg.name} ${subj.label} 과외 문의드립니다.`}
    >
      <SubjectChips
        current={subj.slug}
        makeHref={(s) => pseoHref.sigunguSubject(sg.slug, s)}
      />
      <div className="mt-8">
        <LinkToggleGrid
          items={items}
          heading={`${sg.name} 동 선택`}
          badge={`총 ${sg.dongs.length}개 동`}
          ariaLabel={`${sg.name} 동 목록`}
        />
      </div>
    </PseoLanding>
  );
}
