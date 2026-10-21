import Link from "next/link";
import {
  schoolRegionTitle,
  schoolRegionLinkLabel,
  schoolSigunguLinkLabel,
} from "@/data/crossLinkCopy";
import type { RegionLanding } from "@/lib/schoolRegionLanding";

/*
 * SchoolRegionLinks — 학교×과목 페이지 → 지역 스택 진입 링크(서버 컴포넌트).
 *  - 기본은 확실하게 존재하는 시도 지역 허브(/tutoring/by-region/{sido}).
 *  - 소재 시군구의 지역 랜딩이 **정확히 존재할 때만** 그 칩을 앞에 하나 더 붙인다(sigunguLanding).
 *    경기처럼 schools.ts 가 시 단위로 묶고 랜딩은 일반구 단위만 있는 경우엔 근거가 없어 붙이지 않는다
 *    — 임의 추정으로 틀린 지역에 링크하지 않기 위해서다(감사 P1-c 원칙 유지).
 */
export default function SchoolRegionLinks({
  sidoLabel,
  sidoSlug,
  sigunguLanding = null,
}: {
  sidoLabel: string;
  sidoSlug: string;
  /** 소재 시군구 랜딩. null 이면 시도 허브만 노출(폴백). */
  sigunguLanding?: RegionLanding | null;
}) {
  const chip =
    "inline-flex break-keep rounded-full border border-accent/30 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:text-base";
  return (
    <section>
      <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
        {schoolRegionTitle(sidoLabel)}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {sigunguLanding && (
          <li>
            <Link href={`/${encodeURIComponent(sigunguLanding.id)}`} className={chip}>
              {schoolSigunguLinkLabel(sigunguLanding.name)}
            </Link>
          </li>
        )}
        <li>
          <Link href={`/tutoring/by-region/${sidoSlug}`} className={chip}>
            {schoolRegionLinkLabel(sidoLabel)}
          </Link>
        </li>
      </ul>
    </section>
  );
}
