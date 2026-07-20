import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PseoLanding from "@/components/PseoLanding";
import SubjectChips from "@/components/SubjectChips";
import JsonLd from "@/components/JsonLd";
import { buildRegionContent } from "@/lib/regionContent";
import {
  buildRegionMeta,
  serviceJsonLd,
  breadcrumbJsonLdFromNav,
  faqJsonLd,
} from "@/lib/seo";
import {
  subjectBySlug,
  grades,
  gradeBySlug,
  PSEO_SIDO,
  DEFAULT_SUBJECT,
  slugKey,
  pseoHref,
} from "@/data/pseo";
import { gyeonggi, sigunguBySlug, findDong } from "@/data/gyeonggi";

/*
 * 5-seg — /경기/[시군구]/[동]/[학년]/[과목]. ISR(leaf). 잘못된 조합 404.
 * 교차 네비: 다른 학년/과목 전환 + 인근 동.
 */
export const dynamicParams = true;
// 재배포 전까지 영구 캐시 — 시간 기반 재생성 없음(콘텐츠는 data 파일 기준).
export const revalidate = false;

export function generateStaticParams() {
  // 시드 1개. 나머지 ISR.
  const sg = gyeonggi.sigungu[0];
  const d = sg?.dongs[0];
  return sg && d
    ? [
        {
          sido: PSEO_SIDO,
          seg2: sg.slug,
          seg3: d.slug,
          seg4: grades[1].slug, // 중등
          seg5: DEFAULT_SUBJECT,
        },
      ]
    : [];
}

function resolve(
  sido: string,
  seg2: string,
  seg3: string,
  seg4: string,
  seg5: string,
) {
  if (slugKey(sido) !== PSEO_SIDO) return null;
  const sg = sigunguBySlug[slugKey(seg2)];
  const dong = findDong(slugKey(seg2), slugKey(seg3));
  const grade = gradeBySlug[slugKey(seg4)];
  const subj = subjectBySlug[slugKey(seg5)];
  if (!sg || !dong || !grade || !subj) return null;
  return { sg, dong, grade, subj };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    sido: string;
    seg2: string;
    seg3: string;
    seg4: string;
    seg5: string;
  }>;
}): Promise<Metadata> {
  const { sido, seg2, seg3, seg4, seg5 } = await params;
  const r = resolve(sido, seg2, seg3, seg4, seg5);
  if (!r) return {};
  return buildRegionMeta({
    regionName: r.dong.name,
    subjectPhrase: `${r.grade.label} ${r.subj.label}`,
    canonicalPath: pseoHref.dongGradeSubject(
      r.sg.slug,
      r.dong.slug,
      r.grade.slug,
      r.subj.slug,
    ),
  });
}

export default async function Seg5Page({
  params,
}: {
  params: Promise<{
    sido: string;
    seg2: string;
    seg3: string;
    seg4: string;
    seg5: string;
  }>;
}) {
  const { sido, seg2, seg3, seg4, seg5 } = await params;
  const r = resolve(sido, seg2, seg3, seg4, seg5);
  if (!r) notFound();
  const { sg, dong, grade, subj } = r;

  const content = buildRegionContent({
    sidoLabel: gyeonggi.sidoLabel,
    sigunguLabel: sg.name,
    dongLabel: dong.name,
    gradeLabel: grade.label,
    subjectLabel: subj.label,
  });
  const breadcrumb = [
    { label: "홈", href: "/" },
    { label: gyeonggi.sidoLabel, href: pseoHref.sidoSubject(subj.slug) },
    { label: sg.name, href: pseoHref.sigunguSubject(sg.slug, subj.slug) },
    {
      label: dong.name,
      href: pseoHref.dongSubject(sg.slug, dong.slug, subj.slug),
    },
    { label: `${grade.label} ${subj.label}` },
  ];

  const jsonLd = [
    serviceJsonLd({
      subjectLabel: subj.label,
      areaServed: dong.name,
      canonicalPath: pseoHref.dongGradeSubject(
        sg.slug,
        dong.slug,
        grade.slug,
        subj.slug,
      ),
    }),
    breadcrumbJsonLdFromNav(breadcrumb),
    faqJsonLd(content.faq),
  ];

  return (
    <>
    <JsonLd data={jsonLd} />
    <PseoLanding
      content={content}
      breadcrumb={breadcrumb}
      regionLabel={dong.name}
      gradeLabel={grade.label}
      consultMessage={`${sg.name} ${dong.name} ${grade.label} ${subj.label} 과외 문의드립니다.`}
    >
      {/* 다른 학년 전환 */}
      <div className="text-center">
        <p className="text-sm font-semibold text-muted">학년 전환</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {grades.map((g) => {
            const active = g.slug === grade.slug;
            return (
              <li key={g.slug}>
                <Link
                  href={pseoHref.dongGradeSubject(sg.slug, dong.slug, g.slug, subj.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:text-base ${
                    active
                      ? "bg-accent text-white"
                      : "border border-accent/30 text-ink hover:border-accent hover:text-accent"
                  }`}
                >
                  {g.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 과목 전환(학년 유지) */}
      <div className="mt-8">
        <SubjectChips
          current={subj.slug}
          makeHref={(s) =>
            pseoHref.dongGradeSubject(sg.slug, dong.slug, grade.slug, s)
          }
        />
      </div>
    </PseoLanding>
    </>
  );
}
