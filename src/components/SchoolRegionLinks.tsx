import Link from "next/link";
import { schoolRegionTitle, schoolRegionLinkLabel } from "@/data/crossLinkCopy";

/*
 * SchoolRegionLinks — 학교×과목 페이지 → 지역 스택 진입 링크(서버 컴포넌트).
 *  - 학교 데이터가 동(洞)을 담지 않고, 시군구/과목 단위의 지역 페이지가 학교로부터 도달 가능한
 *    형태로 존재하지 않으므로, 확실하게 존재하는 시도 지역 허브(/tutoring/by-region/{sido})로 링크한다.
 *  - 잘못된 지역·과목으로 링크하지 않기 위해 시도 허브(과목 중립)만 노출한다(감사 P1-c, 데이터 제약 반영).
 */
export default function SchoolRegionLinks({
  sidoLabel,
  sidoSlug,
}: {
  sidoLabel: string;
  sidoSlug: string;
}) {
  return (
    <section>
      <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
        {schoolRegionTitle(sidoLabel)}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        <li>
          <Link
            href={`/tutoring/by-region/${sidoSlug}`}
            className="inline-flex break-keep rounded-full border border-accent/30 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:text-base"
          >
            {schoolRegionLinkLabel(sidoLabel)}
          </Link>
        </li>
      </ul>
    </section>
  );
}
