import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PseoLanding from "@/components/PseoLanding";
import LinkToggleGrid from "@/components/LinkToggleGrid";
import SubjectChips from "@/components/SubjectChips";
import { buildRegionContent } from "@/lib/regionContent";
import {
  subjectBySlug,
  grades,
  PSEO_SIDO,
  DEFAULT_SUBJECT,
  slugKey,
  pseoHref,
} from "@/data/pseo";
import { gyeonggi, sigunguBySlug, findDong } from "@/data/gyeonggi";

/*
 * 4-seg — /경기/[시군구]/[동]/[과목]. ISR. 잘못된 조합 404.
 * 교차 네비: 학년 링크(초·중·고) + 인근 동(같은 시군구) + 과목 전환.
 */
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  // 시드: 첫 시군구의 첫 동 × 기본 과목 1개. 나머지 ISR.
  const sg = gyeonggi.sigungu[0];
  const d = sg?.dongs[0];
  return sg && d
    ? [{ sido: PSEO_SIDO, seg2: sg.slug, seg3: d.slug, seg4: DEFAULT_SUBJECT }]
    : [];
}

function resolve(sido: string, seg2: string, seg3: string, seg4: string) {
  if (slugKey(sido) !== PSEO_SIDO) return null;
  const sg = sigunguBySlug[slugKey(seg2)];
  const dong = findDong(slugKey(seg2), slugKey(seg3));
  const subj = subjectBySlug[slugKey(seg4)];
  if (!sg || !dong || !subj) return null;
  return { sg, dong, subj };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string; seg4: string }>;
}): Promise<Metadata> {
  const { sido, seg2, seg3, seg4 } = await params;
  const r = resolve(sido, seg2, seg3, seg4);
  if (!r) return {};
  const c = buildRegionContent({
    sidoLabel: gyeonggi.sidoLabel,
    sigunguLabel: r.sg.name,
    dongLabel: r.dong.name,
    subjectLabel: r.subj.label,
  });
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    alternates: {
      canonical: pseoHref.dongSubject(r.sg.slug, r.dong.slug, r.subj.slug),
    },
    openGraph: { title: c.ogTitle, description: c.metaDescription },
  };
}

export default async function Seg4Page({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string; seg4: string }>;
}) {
  const { sido, seg2, seg3, seg4 } = await params;
  const r = resolve(sido, seg2, seg3, seg4);
  if (!r) notFound();
  const { sg, dong, subj } = r;

  const content = buildRegionContent({
    sidoLabel: gyeonggi.sidoLabel,
    sigunguLabel: sg.name,
    dongLabel: dong.name,
    subjectLabel: subj.label,
  });
  const breadcrumb = [
    { label: "홈", href: "/" },
    { label: gyeonggi.sidoLabel, href: pseoHref.sidoSubject(subj.slug) },
    { label: sg.name, href: pseoHref.sigunguSubject(sg.slug, subj.slug) },
    { label: `${dong.name} ${subj.label}` },
  ];
  // 인근 동(같은 시군구, 현재 제외)
  const nearby = sg.dongs
    .filter((d) => d.slug !== dong.slug)
    .map((d) => ({
      label: d.name,
      href: pseoHref.dongSubject(sg.slug, d.slug, subj.slug),
    }));

  return (
    <PseoLanding
      content={content}
      breadcrumb={breadcrumb}
      regionLabel={dong.name}
      consultMessage={`${sg.name} ${dong.name} ${subj.label} 과외 문의드립니다.`}
    >
      <SubjectChips
        current={subj.slug}
        makeHref={(s) => pseoHref.dongSubject(sg.slug, dong.slug, s)}
      />

      {/* 학년별 보기 */}
      <div className="mt-8 text-center">
        <p className="text-sm font-semibold text-muted">학년별 보기</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {grades.map((g) => (
            <li key={g.slug}>
              <Link
                href={pseoHref.dongGradeSubject(sg.slug, dong.slug, g.slug, subj.slug)}
                className="inline-flex min-h-10 items-center rounded-full border border-accent/30 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:text-base"
              >
                {g.label} {subj.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 인근 동 */}
      {nearby.length > 0 && (
        <div className="mt-10">
          <LinkToggleGrid
            items={nearby}
            heading={`${sg.name} 인근 동`}
            ariaLabel={`${sg.name} 인근 동 목록`}
          />
        </div>
      )}
    </PseoLanding>
  );
}
