import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PseoLanding from "@/components/PseoLanding";
import LinkToggleGrid from "@/components/LinkToggleGrid";
import SubjectChips from "@/components/SubjectChips";
import ConsultForm from "@/components/ConsultForm";
import RelatedKeywords from "@/components/RelatedKeywords";
import { getSido } from "@/data/sidoRegions";
import { buildRegionContent } from "@/lib/regionContent";
import {
  subjects,
  subjectBySlug,
  PSEO_SIDO,
  slugKey,
  pseoHref,
} from "@/data/pseo";
import { gyeonggi } from "@/data/gyeonggi";
import { districts } from "@/data/districts";

/*
 * 2-seg — /[sido]/[seg2]
 *  - 경기(한글)×과목: pSEO 시도×과목 랜딩 + 시군구 목록 + 과목 전환.
 *  - seoul(영문)×구: 기존 서울 구 페이지(과목 없음) 보존.
 * ISR: 시드만 SSG, 나머지 요청 시 생성+캐시. 잘못된 slug 404.
 */
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  // 시드: 경기×과목 5개 + 서울×구 일부(빠른 진입). 나머지는 ISR.
  return [
    ...subjects.map((s) => ({ sido: PSEO_SIDO, seg2: s.slug })),
    ...districts.slice(0, 3).map((d) => ({ sido: "seoul", seg2: d.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; seg2: string }>;
}): Promise<Metadata> {
  const { sido, seg2 } = await params;
  const sidoKey = slugKey(sido);
  if (sidoKey === PSEO_SIDO) {
    const subj = subjectBySlug[slugKey(seg2)];
    if (!subj) return {};
    const c = buildRegionContent({
      sidoLabel: gyeonggi.sidoLabel,
      subjectLabel: subj.label,
    });
    return {
      title: { absolute: c.metaTitle },
      description: c.metaDescription,
      alternates: { canonical: pseoHref.sidoSubject(subj.slug) },
      openGraph: { title: c.ogTitle, description: c.metaDescription },
    };
  }
  if (sidoKey === "seoul") {
    const gu = districts.find((d) => d.slug === slugKey(seg2));
    if (!gu) return {};
    return {
      title: `${gu.name} 1:1 과외`,
      description: `${gu.name} 1:1 맞춤 과외. 직접 가르쳐 본 상담 선생님이 호흡 맞는 선생님을 연결합니다.`,
      alternates: { canonical: `/tutoring/by-region/seoul/${gu.slug}` },
    };
  }
  return {};
}

export default async function Seg2Page({
  params,
}: {
  params: Promise<{ sido: string; seg2: string }>;
}) {
  const { sido, seg2 } = await params;
  const sidoKey = slugKey(sido);

  // 경기 × 과목 (pSEO 시도×과목)
  if (sidoKey === PSEO_SIDO) {
    const subj = subjectBySlug[slugKey(seg2)];
    if (!subj) notFound();

    const content = buildRegionContent({
      sidoLabel: gyeonggi.sidoLabel,
      subjectLabel: subj.label,
    });
    const breadcrumb = [
      { label: "홈", href: "/" },
      { label: `${gyeonggi.sidoLabel} ${subj.label}` },
    ];
    // 시군구 목록(가나다) → /경기/{시군구}/{과목}
    const items = [...gyeonggi.sigungu]
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
      .map((sg) => ({
        label: sg.name,
        href: pseoHref.sigunguSubject(sg.slug, subj.slug),
      }));

    return (
      <PseoLanding
        content={content}
        breadcrumb={breadcrumb}
        regionLabel={gyeonggi.sidoLabel}
        consultMessage={`${gyeonggi.sidoLabel} ${subj.label} 과외 문의드립니다.`}
      >
        <SubjectChips current={subj.slug} makeHref={(s) => pseoHref.sidoSubject(s)} />
        <div className="mt-8">
          <LinkToggleGrid
            items={items}
            heading="경기 시군구 선택"
            badge={`${gyeonggi.sigungu.length}개 지역`}
            ariaLabel="경기 시·군·구 목록"
          />
        </div>
      </PseoLanding>
    );
  }

  // 서울 × 구 (기존 보존, 과목 없음)
  if (sidoKey === "seoul") {
    const gu = districts.find((d) => d.slug === slugKey(seg2));
    if (!gu) notFound();
    // 같은 구의 동 목록(앞에서 최대 6개) — 연관 키워드 블록용. 이름으로 매칭.
    const guDongs =
      getSido("seoul")?.sigungu.find((s) => s.name === gu.name)?.dong ?? [];
    const neighborDongs = guDongs.slice(0, 6).map((d) => d.name);
    return (
      <>
        <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            서울 지역별 과외
          </p>
          <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
            {gu.name} 1:1 과외
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {gu.name}에서 시작하는 1:1 과외. 직접 가르쳐 본 상담 선생님이 아이에게
            맞는 선생님을 연결해 드립니다.
          </p>
        </section>
        <ConsultForm defaultMessage={`${gu.name} 과외 문의드립니다.`} />
        <RelatedKeywords
          regionName={gu.name}
          level="gu"
          neighborDongs={neighborDongs}
        />
      </>
    );
  }

  notFound();
}
