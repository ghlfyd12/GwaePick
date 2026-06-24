import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { districts } from "@/data/districts";
import { gyeonggi, sigunguBySlug } from "@/data/gyeonggi";
import { subjects } from "@/data/categories";
import { site } from "@/data/site";

/*
 * [sido]/[district] —
 *  - seoul/{구}: 구 상세(과목 안내 + 상담 CTA) — leaf.
 *  - gyeonggi/{시군구}: 그 시군구의 동 링크 그리드(다음 단계 leaf 는 [dong]).
 *  잘못된 조합은 404. 데이터는 districts.ts·gyeonggi.ts·categories.ts 에서. CTA 는 /#consult.
 */

// 모든 유효 조합은 generateStaticParams 로 SSG. 한글 slug 의 dev 매칭 이슈를 피하려 true 로 두고,
// 유효하지 않은 slug 는 컴포넌트에서 notFound() 로 404 처리한다.
export const dynamicParams = true;

export function generateStaticParams() {
  return [
    ...districts.map((d) => ({ sido: "seoul", district: d.slug })),
    ...gyeonggi.sigungu.map((sg) => ({ sido: "gyeonggi", district: sg.slug })),
  ];
}

/** URL 파라미터를 데이터 slug 와 비교 가능한 형태로(퍼센트 디코딩 + 한글 NFC 정규화). */
const slugKey = (s: string) => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return s.normalize("NFC");
  }
};

const SUBJECT_LIST = subjects.map((s) => s.title).join("·");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; district: string }>;
}): Promise<Metadata> {
  const { sido, district } = await params;

  if (sido === "seoul") {
    const d = districts.find((x) => x.slug === district);
    if (!d) return {};
    return {
      title: `${d.name} 1:1 과외`,
      description: `${d.name}에서 시작하는 1:1 과외 — ${SUBJECT_LIST} 과목별로 아이에게 맞는 선생님을 무료 상담으로 연결해 드립니다.`,
      alternates: { canonical: `/tutoring/by-region/seoul/${d.slug}` },
    };
  }
  if (sido === "gyeonggi") {
    const sg = sigunguBySlug[slugKey(district)];
    if (!sg) return {};
    return {
      title: `${sg.name} 1:1 과외`,
      description: `${sg.name} 동네별 1:1 과외 — 원하는 동을 선택해 ${SUBJECT_LIST} 과목 맞춤 선생님을 무료 상담으로 만나보세요.`,
      alternates: { canonical: `/tutoring/by-region/gyeonggi/${sg.slug}` },
    };
  }
  return {};
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ sido: string; district: string }>;
}) {
  const { sido, district } = await params;

  if (sido === "seoul") {
    const d = districts.find((x) => x.slug === district);
    if (!d) notFound();
    return <SeoulGu name={d.name} />;
  }
  if (sido === "gyeonggi") {
    const sg = sigunguBySlug[slugKey(district)];
    if (!sg) notFound();
    return <GyeonggiSigungu sigunguSlug={sg.slug} name={sg.name} dongs={sg.dongs} />;
  }
  notFound();
}

/* ── 서울 구 상세(leaf) ─────────────────────────────────────────── */
function SeoulGu({ name }: { name: string }) {
  return (
    <>
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          서울 지역별 과외
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {name} 1:1 과외
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {name}에서 시작하는 1:1 과외. 직접 가르쳐 본 선생님이 아이에게 맞는
          선생님을 연결해 드립니다.
        </p>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            {name}에서 만나는 과목별 1:1 과외
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2 text-base font-semibold text-accent"
              >
                {subject.title}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {SUBJECT_LIST}까지, {name} 학생에게 맞는 선생님을 상담으로 안내해
            드립니다.
          </p>
        </div>

        <ConsultBox name={name} />
      </section>
    </>
  );
}

/* ── 경기 시/군/구 → 동 그리드 ──────────────────────────────────── */
function GyeonggiSigungu({
  sigunguSlug,
  name,
  dongs,
}: {
  sigunguSlug: string;
  name: string;
  dongs: { name: string; slug: string }[];
}) {
  return (
    <>
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          경기 지역별 과외
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {name} 1:1 과외
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {name}의 동네를 선택하세요.
        </p>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <p className="mx-auto mb-5 max-w-5xl text-center text-sm font-semibold text-muted sm:text-base">
          총 {dongs.length}개 동
        </p>
        <nav aria-label={`${name} 동 목록`} className="mx-auto max-w-5xl">
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {dongs.map((dong) => (
              <li key={dong.slug}>
                <Link
                  href={`/tutoring/by-region/gyeonggi/${sigunguSlug}/${dong.slug}`}
                  className="block rounded-xl border border-line bg-white px-3 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {dong.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ConsultBox name={name} />
      </section>
    </>
  );
}

/* ── 하단 공통 상담 CTA ─────────────────────────────────────────── */
function ConsultBox({ name }: { name: string }) {
  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
      <p className="text-base font-medium text-ink sm:text-lg">
        {name}에서 어떤 선생님이 맞을지 모르겠다면, 상담부터 시작하세요.
      </p>
      <div className="mt-5">
        <a
          href={site.cta.href}
          className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-lg"
        >
          {site.cta.label}
        </a>
      </div>
    </div>
  );
}
