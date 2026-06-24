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
import { getSido } from "@/data/sidoRegions";
import {
  subjects as subjectsEn,
  subjectBySlug as subjectBySlugEn,
} from "@/data/subjects";
import { PILOT } from "@/data/dongPageCopy";
import DongSubjectDetail from "@/components/DongSubjectDetail";

/*
 * 4-seg — 두 갈래:
 *  - sido="경기"(한글): 경기 Korean pSEO 동×과목(기존). 학년 링크 + 인근 동 + 과목 전환.
 *  - sido=영문 slug(seoul/gyeonggi/busan…) + 과목(korean/english/math/social/science):
 *    sidoRegions 기반 동×과목 상세 pSEO(신규, DongSubjectDetail). 파일럿만 정적 생성·나머지 ISR.
 * 잘못된 조합 404.
 */
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  // 경기 시드 1 + 파일럿(서울 4구·고양 3구) 동×5과목 정적 생성. 나머지 ISR.
  const params: { sido: string; seg2: string; seg3: string; seg4: string }[] = [];
  const sg0 = gyeonggi.sigungu[0];
  const d0 = sg0?.dongs[0];
  if (sg0 && d0)
    params.push({ sido: PSEO_SIDO, seg2: sg0.slug, seg3: d0.slug, seg4: DEFAULT_SUBJECT });

  for (const p of PILOT) {
    const sd = getSido(p.sido);
    if (!sd) continue;
    for (const sgSlug of p.sigungu) {
      const sg = sd.sigungu.find((s) => s.slug === sgSlug);
      if (!sg) continue;
      for (const dong of sg.dong)
        for (const subj of subjectsEn)
          params.push({ sido: p.sido, seg2: sg.slug, seg3: dong.slug, seg4: subj.slug });
    }
  }
  return params;
}

/** 기존 경기 Korean pSEO 해석. */
function resolve(sido: string, seg2: string, seg3: string, seg4: string) {
  if (slugKey(sido) !== PSEO_SIDO) return null;
  const sg = sigunguBySlug[slugKey(seg2)];
  const dong = findDong(slugKey(seg2), slugKey(seg3));
  const subj = subjectBySlug[slugKey(seg4)];
  if (!sg || !dong || !subj) return null;
  return { sg, dong, subj };
}

/** 신규 sidoRegions 기반 동×과목 해석(영문 slug + korean/english/math/social/science). */
function resolveNew(sido: string, seg2: string, seg3: string, seg4: string) {
  const sd = getSido(slugKey(sido));
  if (!sd) return null;
  const sg = sd.sigungu.find((s) => s.slug === slugKey(seg2));
  const dong = sg?.dong.find((d) => d.slug === slugKey(seg3));
  const subj = subjectBySlugEn[slugKey(seg4)];
  if (!sg || !dong || !subj) return null;
  return { sidoSlug: slugKey(sido), sidoLabel: sd.label, sg, dong, subj };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string; seg4: string }>;
}): Promise<Metadata> {
  const { sido, seg2, seg3, seg4 } = await params;

  // 기존 경기 Korean pSEO
  const r = resolve(sido, seg2, seg3, seg4);
  if (r) {
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

  // 신규 동×과목 상세
  const rn = resolveNew(sido, seg2, seg3, seg4);
  if (rn) {
    const { sg, dong, subj, sidoSlug } = rn;
    const title = `${dong.name} ${subj.label} 과외 — ${sg.name} 1:1 맞춤 방문수업 | 지식의참견`;
    const description = `${sg.name} ${dong.name} ${subj.label} 1:1 맞춤 방문 과외. 직접 가르쳐 온 선생님이 ${dong.name} 학생에게 맞는 ${subj.label} 선생님을 연결해 드립니다. 첫 상담은 무료입니다.`;
    const canonical = `/tutoring/by-region/${sidoSlug}/${sg.slug}/${dong.slug}/${subj.slug}`;
    return {
      title: { absolute: title },
      description,
      keywords: [
        `${dong.name} ${subj.label}과외`,
        `${dong.name} ${subj.label}`,
        `${sg.name} ${subj.label}`,
        `${dong.name} 과외`,
      ],
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: "website" },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  return {};
}

export default async function Seg4Page({
  params,
}: {
  params: Promise<{ sido: string; seg2: string; seg3: string; seg4: string }>;
}) {
  const { sido, seg2, seg3, seg4 } = await params;

  // 신규 동×과목 상세(sidoRegions, 영문 slug)
  const rn = resolveNew(sido, seg2, seg3, seg4);
  if (rn) {
    return (
      <DongSubjectDetail
        sidoSlug={rn.sidoSlug}
        sidoLabel={rn.sidoLabel}
        sigungu={rn.sg}
        dong={rn.dong}
        subject={rn.subj}
      />
    );
  }

  // 기존 경기 Korean pSEO
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
