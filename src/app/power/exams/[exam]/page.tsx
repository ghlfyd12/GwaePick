import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { POWER_EXAMS, examBySlug, LANGUAGE_LABEL } from "@/data/power/exams";
import { examRegions, type ExamRegion } from "@/data/byRegionExam";
import { site } from "@/data/site";

/*
 * /power/exams/[exam] — 어학시험 1종의 지역별 허브(신규).
 *
 * 그 시험을 준비하는 전국 253개 시군구를 시도별로 나열하고, 각 지역의 시험 상세
 * (/power/by-region/[region]/[exam])로 SSR 링크를 전량 흘려보낸다. 회화 역링크와
 * 독립인 두 번째 도달 경로. 링크는 examRegions(=isExamRegionSlug와 동일 소스)에서만
 * 생성하므로 슬러그 불일치가 원천적으로 발생하지 않는다.
 * SSG: 13개 시험 전량 정적 생성(dynamicParams=false). 지역×시험 상세 3,289는 기존대로 ISR.
 * 색은 accent 토큰만(퍼플, /power 스코프). 워딩: 느낌표·금지어 없음, 전화·화상 표현.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return POWER_EXAMS.map((e) => ({ exam: e.slug }));
}

/** examRegions 를 시도별로 묶는다(REGIONS 등장 순서 보존). */
function regionsBySido(): { sido: string; regions: ExamRegion[] }[] {
  const order: string[] = [];
  const map = new Map<string, ExamRegion[]>();
  for (const r of examRegions) {
    if (!map.has(r.sidoLabel)) {
      map.set(r.sidoLabel, []);
      order.push(r.sidoLabel);
    }
    map.get(r.sidoLabel)!.push(r);
  }
  return order.map((sido) => ({ sido, regions: map.get(sido)! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exam: string }>;
}): Promise<Metadata> {
  const { exam: examSlug } = await params;
  const exam = examBySlug.get(examSlug);
  if (!exam) return {};
  const title = `${exam.name} 지역별 1:1 과외 안내 | 어학의참견`;
  const description =
    `전국 지역에서 ${exam.name}을 준비하는 1:1 ${LANGUAGE_LABEL[exam.language]} 과외 안내. ` +
    `우리 지역을 고르면 ${exam.name} 준비 페이지로 이어집니다. 전화·화상으로 진행합니다.`;
  const canonical = `/power/exams/${examSlug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: site.power.name,
      images: [site.power.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [site.power.ogImage],
    },
  };
}

export default async function PowerExamRegionHubPage({
  params,
}: {
  params: Promise<{ exam: string }>;
}) {
  const { exam: examSlug } = await params;
  const exam = examBySlug.get(examSlug);
  if (!exam) notFound();

  const groups = regionsBySido();
  const regionCount = examRegions.length;

  return (
    <>
      {/* Hero + 브레드크럼 */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <nav aria-label="위치" className="mb-3 text-sm text-muted">
            <Link href="/power/exams" className="font-medium text-accent hover:underline">
              어학시험
            </Link>
            <span className="mx-1.5" aria-hidden>
              ·
            </span>
            <span>{exam.name}</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            어학의참견 · {LANGUAGE_LABEL[exam.language]} 시험
          </p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            {exam.name} 지역별 1:1 과외
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            전국 {regionCount}개 지역에서 {exam.name}을 준비하는 1:1 과외를 안내합니다. 우리
            지역을 고르면 준비 페이지로 이어집니다. 전화·화상으로 진행합니다.
          </p>
        </div>
      </section>

      {/* 시도별 지역 링크 — 전량 SSR */}
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
        <ul className="space-y-8">
          {groups.map((group) => (
            <li key={group.sido}>
              <h2 className="break-keep border-b border-line pb-2 text-lg font-bold text-ink sm:text-xl">
                {group.sido}
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {group.regions.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/power/by-region/${encodeURIComponent(r.slug)}/${exam.slug}`}
                      className="block break-keep rounded-lg border border-line bg-white px-3 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* 다른 시험 보기 */}
        <div className="mt-12 text-center">
          <Link
            href="/power/exams"
            className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent bg-accent/5 px-6 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 sm:text-base"
          >
            다른 어학시험 보기
          </Link>
        </div>
      </div>
    </>
  );
}
