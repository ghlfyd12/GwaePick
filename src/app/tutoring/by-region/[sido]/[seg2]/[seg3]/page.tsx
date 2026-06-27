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
import { getSido } from "@/data/sidoRegions";
import { PILOT } from "@/data/dongPageCopy";
import DongHub from "@/components/DongHub";

/*
 * 3-seg — 두 갈래:
 *  - sido="경기"(한글): 경기 시군구×과목(기존).
 *  - sido=영문 slug + seg2=시군구 + seg3=동: sidoRegions 동 허브(과목 5선택, 신규).
 * ISR. 파일럿만 정적 생성. 잘못된 조합 404.
 */
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  const params: { sido: string; seg2: string; seg3: string }[] = [];
  const first = gyeonggi.sigungu[0]?.slug;
  if (first) params.push({ sido: PSEO_SIDO, seg2: first, seg3: DEFAULT_SUBJECT });

  // 파일럿 동 허브 정적 생성
  for (const p of PILOT) {
    const sd = getSido(p.sido);
    if (!sd) continue;
    for (const sgSlug of p.sigungu) {
      const sg = sd.sigungu.find((s) => s.slug === sgSlug);
      if (!sg) continue;
      for (const dong of sg.dong)
        params.push({ sido: p.sido, seg2: sg.slug, seg3: dong.slug });
    }
  }
  return params;
}

function resolve(sido: string, seg2: string, seg3: string) {
  if (slugKey(sido) !== PSEO_SIDO) return null;
  const sg = sigunguBySlug[slugKey(seg2)];
  const subj = subjectBySlug[slugKey(seg3)];
  if (!sg || !subj) return null;
  return { sg, subj };
}

/** 신규 동 허브 해석(sidoRegions, seg2=시군구·seg3=동). */
function resolveHub(sido: string, seg2: string, seg3: string) {
  const sd = getSido(slugKey(sido));
  if (!sd) return null;
  const sg = sd.sigungu.find((s) => s.slug === slugKey(seg2));
  const dong = sg?.dong.find((d) => d.slug === slugKey(seg3));
  if (!sg || !dong) return null;
  return { sidoSlug: slugKey(sido), sidoLabel: sd.label, sg, dong };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string }>;
}): Promise<Metadata> {
  const { sido, seg2, seg3 } = await params;
  const r = resolve(sido, seg2, seg3);
  if (r) {
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
  const rh = resolveHub(sido, seg2, seg3);
  if (rh) {
    const title = `${rh.dong.name} 1:1 과외 — ${rh.sg.name} 개인과외 수업 | 지식의참견`;
    const description = `${rh.sg.name} ${rh.dong.name} 1:1 맞춤 개인과외. 과목을 선택해 ${rh.dong.name} 학생에게 맞는 선생님을 만나보세요.`;
    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical: `/tutoring/by-region/${rh.sidoSlug}/${rh.sg.slug}/${rh.dong.slug}`,
      },
    };
  }
  return {};
}

export default async function Seg3Page({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string }>;
}) {
  const { sido, seg2, seg3 } = await params;

  // 신규 동 허브
  const rh = resolveHub(sido, seg2, seg3);
  if (rh) {
    // 같은 구의 다른 동(현재 동 제외, 앞에서 최대 6개) — 연관 키워드 블록용.
    const neighborDongs = rh.sg.dong
      .filter((d) => d.slug !== rh.dong.slug)
      .slice(0, 6)
      .map((d) => d.name);
    return (
      <DongHub
        sidoSlug={rh.sidoSlug}
        sidoLabel={rh.sidoLabel}
        sigungu={rh.sg}
        dong={rh.dong}
        neighborDongs={neighborDongs}
      />
    );
  }

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
