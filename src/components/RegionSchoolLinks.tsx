import Link from "next/link";
import { subjects } from "@/data/subjects";
import { schoolsInSigungu } from "@/lib/schoolRegionIndex";
import { schoolDetailHref } from "@/lib/schoolHref";
import { hashSlug } from "@/lib/contentVariant";
import { regionSchoolsTitle } from "@/data/crossLinkCopy";

/*
 * RegionSchoolLinks — 지역(동) 페이지 → 소속 시군구 학교의 학교×과목 페이지 링크(서버 컴포넌트).
 *  - 학교 데이터는 시군구까지만 매핑되므로, 동 페이지에서 그 동의 "상위 시군구" 학교들을 링크한다.
 *  - subjectSlug/subjectLabel 이 있으면(동×과목 페이지) 해당 과목으로 링크(과목 문맥 보존).
 *    없으면(동 허브) 학교 slug 해시로 과목을 결정론적으로 분산(수학 편중 방지).
 *  - 최대 12개, 이름 가나다순(schoolRegionIndex 에서 정렬). 학교 0개면 아무것도 렌더하지 않는다.
 */
const MAX = 12;

export default function RegionSchoolLinks({
  sidoSlug,
  sigunguName,
  sigunguSlug,
  subjectSlug,
  subjectLabel,
}: {
  sidoSlug: string;
  sigunguName: string;
  sigunguSlug: string;
  subjectSlug?: string;
  subjectLabel?: string;
}) {
  const schools = schoolsInSigungu(sidoSlug, sigunguSlug).slice(0, MAX);
  if (schools.length === 0) return null;

  const links = schools.map((s) => {
    if (subjectSlug && subjectLabel) {
      return { href: schoolDetailHref(s.slug, subjectSlug), label: `${s.name} ${subjectLabel} 과외` };
    }
    // 과목 분산 — 학교 slug 해시로 8과목 중 하나를 결정론적으로 선택.
    const subj = subjects[hashSlug(s.slug) % subjects.length];
    return { href: schoolDetailHref(s.slug, subj.slug), label: `${s.name} ${subj.label} 과외` };
  });

  return (
    <section>
      <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
        {regionSchoolsTitle(sigunguName, subjectLabel)}
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block break-keep rounded-xl border border-line bg-white px-3 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
