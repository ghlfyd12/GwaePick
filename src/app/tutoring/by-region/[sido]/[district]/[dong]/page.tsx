import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gyeonggi, sigunguBySlug, findDong } from "@/data/gyeonggi";
import { subjects } from "@/data/categories";
import { site } from "@/data/site";

/*
 * 동 pSEO 랜딩(leaf) — /tutoring/by-region/gyeonggi/{시군구}/{동}
 *
 * 경기 모든 (시군구 × 동) 조합 SSG(≈977개). 잘못된 조합은 404.
 * h1·인트로에 "{시군구} {동}" 키워드 자연 삽입 + 과목 안내 + 강조 CTA + 전화.
 * 데이터는 gyeonggi.ts·categories.ts 에서. CTA 는 /#consult.
 */

const CONSULT_PHONE = "010-2177-2720";
const SUBJECT_LIST = subjects.map((s) => s.title).join("·");

// 모든 (시군구×동) 조합은 generateStaticParams 로 SSG. 한글 slug dev 매칭 이슈 회피로 true,
// 유효하지 않은 조합은 컴포넌트에서 notFound().
export const dynamicParams = true;

export function generateStaticParams() {
  return gyeonggi.sigungu.flatMap((sg) =>
    sg.dongs.map((d) => ({
      sido: "gyeonggi",
      district: sg.slug,
      dong: d.slug,
    })),
  );
}

/** URL 파라미터를 데이터 slug 와 비교 가능한 형태로(퍼센트 디코딩 + 한글 NFC 정규화). */
const slugKey = (s: string) => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return s.normalize("NFC");
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; district: string; dong: string }>;
}): Promise<Metadata> {
  const { sido, district, dong } = await params;
  if (sido !== "gyeonggi") return {};
  const sg = sigunguBySlug[slugKey(district)];
  const d = findDong(slugKey(district), slugKey(dong));
  if (!sg || !d) return {};

  const place = `${sg.name} ${d.name}`;
  return {
    title: `${place} 1:1 과외`,
    description: `${place} 국어·영어·수학·사회·과학 1:1 과외. 무료 상담·체험.`,
    alternates: {
      canonical: `/tutoring/by-region/gyeonggi/${sg.slug}/${d.slug}`,
    },
  };
}

export default async function DongPage({
  params,
}: {
  params: Promise<{ sido: string; district: string; dong: string }>;
}) {
  const { sido, district, dong } = await params;
  if (sido !== "gyeonggi") notFound();
  const sg = sigunguBySlug[slugKey(district)];
  const d = findDong(slugKey(district), slugKey(dong));
  if (!sg || !d) notFound();

  const place = `${sg.name} ${d.name}`;

  return (
    <>
      {/* 헤더 — 유일한 h1 */}
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {sg.name}
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {place} 1:1 과외
        </h1>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
          {place}에서 찾는 1:1 맞춤 과외. 직접 가르쳐 본 선생님이 아이에게 맞는
          선생님을 연결해 드립니다.
        </p>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            {place}에서 만나는 과목별 1:1 과외
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
          <p className="mx-auto mt-5 max-w-xl break-keep text-sm leading-relaxed text-muted sm:text-base">
            {SUBJECT_LIST}까지 — {place} 학생 맞춤 커리큘럼 상담과 무료 체험을
            제공합니다.
          </p>
        </div>

        {/* 강조 상담 CTA + 전화 */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="text-base font-medium text-ink sm:text-lg">
            {place}에서 우리 아이에게 맞는 선생님, 무료 상담으로 시작하세요.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={site.cta.href}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:text-lg"
            >
              {site.cta.label}
            </a>
            <a
              href={`tel:${CONSULT_PHONE}`}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg"
            >
              {CONSULT_PHONE}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
