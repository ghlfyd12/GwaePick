import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { regions, getRegionById, type Region } from "@/data/regions";
import { site } from "@/data/site";
import CTAButton from "@/components/ui/CTAButton";
import Curriculum from "@/components/sections/Curriculum";
import WhyUs from "@/components/sections/WhyUs";
import TeacherIntro from "@/components/sections/TeacherIntro";
import Teachers from "@/components/sections/Teachers";

/*
 * 지역별 동적 랜딩페이지 — /[region] (예: /서울-송파구, /경기-수원시-영통구)
 *
 * pSEO: regions.ts 의 모든 지역을 빌드시 정적 생성(SSG)하고, 페이지마다
 * 학부모 검색 패턴에 맞춘 title/description/OG 를 동적으로 주입한다(generateMetadata).
 * 본문 카피에는 해당 지역명이 자연스럽게 녹아든다. 공통 신뢰 섹션은 메인과 동일 컴포넌트 재사용.
 *
 * 규칙: "컨설턴트" 금지 → "선생님/직접 가르쳐 온 선생님". 보라색 없음. 모바일 390px 우선.
 */

// regions.ts 에 없는 슬러그는 404 (정적 생성된 지역만 노출).
export const dynamicParams = false;

export function generateStaticParams() {
  return regions.map((r) => ({ region: r.id }));
}

/** Next 가 디코드해 주지만, 인코딩된 채 들어오는 경우까지 안전하게 조회. */
function resolveRegion(raw: string): Region | undefined {
  return (
    getRegionById(raw) ??
    getRegionById((() => {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    })())
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const r = resolveRegion(region);
  if (!r) return {};

  const title = `${r.name} 수학·영어 과외 추천 - 직접 가르쳐 본 ${r.name} 선생님 1:1 매칭`;
  const description = `학원에 다녀도 성적이 그대로라면 문제는 맞는 선생님을 만나지 못한 것입니다. 2028 대입 개편 및 내신 5등급제 대비, ${r.name} 학생들의 성향과 호흡까지 맞춰줄 전담 선생님 무료 상담 신청해보세요.`;
  const url = `/${r.id}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "ko_KR",
      siteName: site.name,
    },
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const r = resolveRegion(region);
  if (!r) notFound();

  const subjects = ["수학", "영어", "국어", "과학", "사회"];
  const dongLine = r.dongs?.slice(0, 12).join(", ");
  const schoolLine = r.schools?.slice(0, 12).join(", ");

  return (
    <>
      {/* 지역 맞춤 Hero — 페이지 유일의 h1 */}
      <section className="bg-gradient-to-b from-primary-soft to-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-accent sm:text-base">
            {r.province} {r.cityQuery} · 1:1 맞춤 과외 매칭
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
            {r.name} 학부모님들이 신뢰하는
            <br />
            <span className="text-accent">1:1 맞춤 과외</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            우리 {r.name} 아이들의 성향, 학교별 기출 분석까지 꼼꼼히 파악하고 있는
            직접 가르쳐 온 선생님들이 기다리고 있습니다.
          </p>

          {/* 과목 키워드 칩(주황 포인트) */}
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {subjects.map((s) => (
              <li
                key={s}
                className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent"
              >
                {r.name} {s}과외
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <CTAButton href="#consult" size="lg">
              {r.name} {site.cta.label}
            </CTAButton>
          </div>
        </div>
      </section>

      {/* 지역 롱테일 키워드 영역(동/학교) — 네이버 색인용 자연 문장 */}
      {(dongLine || schoolLine) && (
        <section className="border-t border-line bg-white px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-3 text-center text-sm leading-relaxed text-muted sm:text-base">
            {dongLine && (
              <p>
                <span className="font-semibold text-ink">{r.name} 전 지역</span>{" "}
                — {dongLine} 등 어디서나 방문·화상(온·오프라인) 수업이 가능합니다.
              </p>
            )}
            {schoolLine && (
              <p>
                <span className="font-semibold text-ink">
                  {r.name} 주요 학교 내신·기출 대비
                </span>{" "}
                — {schoolLine} 등 학교별 시험 출제 경향에 맞춰 준비합니다.
              </p>
            )}
          </div>
        </section>
      )}

      {/* 공통 신뢰 섹션 재사용(성적대별 커리큘럼 · 강점 · 선생님 소개 · 교사진) */}
      <Curriculum />
      <WhyUs />
      <TeacherIntro />
      <Teachers />

      {/* 지역 맞춤 무료 상담 신청 — 모든 CTA 의 앵커 목적지(#consult) */}
      <section
        id="consult"
        className="flex flex-col items-center justify-center gap-5 border-t border-line bg-primary px-4 py-20 text-center text-white"
      >
        <h2 className="text-2xl font-bold sm:text-3xl">
          {r.name} 무료 상담 신청
        </h2>
        <p className="max-w-xl text-white/80">
          {r.name}에서 우리 아이에게 가장 잘 맞는 선생님, 직접 가르쳐 온 선생님이
          1:1 상담으로 찾아 드립니다. 부담 없이 신청해 보세요.
        </p>
        <CTAButton href={site.cta.href} size="lg">
          {site.cta.label}
        </CTAButton>
        <p className="mt-2 text-sm text-white/60">
          상담 문의 {site.contact.phone} · 카카오 {site.contact.kakao}
        </p>

        {/* 인접 지역으로 내부 링크(크롤링·탐색 보조) */}
        <NearbyLinks current={r} />
      </section>
    </>
  );
}

/** 같은 시/도 내 다른 지역으로의 내부 링크(최대 8개) — pSEO 내부 링크 그래프. */
function NearbyLinks({ current }: { current: Region }) {
  const siblings = regions
    .filter((x) => x.province === current.province && x.id !== current.id)
    .slice(0, 8);
  if (siblings.length === 0) return null;
  return (
    <nav
      aria-label={`${current.province} 다른 지역 과외`}
      className="mt-8 w-full max-w-3xl"
    >
      <p className="mb-3 text-sm text-white/60">{current.province} 다른 지역</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {siblings.map((s) => (
          <li key={s.id}>
            <Link
              href={`/${s.id}`}
              className="inline-flex rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 transition-colors hover:border-accent hover:text-accent"
            >
              {s.name} 과외
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
