import Link from "next/link";
import type { SchoolLevel } from "@/data/schools";
import type { FlatSchool } from "@/lib/schoolList";
import { schoolHref } from "@/lib/schoolHref";

/*
 * SchoolCardGrid — 서버 렌더링 학교 카드 <a> 그리드(SchoolBrowser 카드와 동일 스타일).
 * 페이지네이션 페이지(/p/[n])에서 사용. 링크 대상은 기존 schoolHref 체계 유지(과목 분산은 P2).
 */
const BADGE: Record<SchoolLevel, string> = { elem: "초", middle: "중", high: "고" };

export default function SchoolCardGrid({
  sidoSlug,
  schools,
}: {
  sidoSlug: string;
  schools: FlatSchool[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {schools.map((s) => (
        <li key={`${s.sigunguSlug}-${s.slug}`}>
          <Link
            href={schoolHref(sidoSlug, s.sigunguSlug, s)}
            className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-line bg-white px-3 py-3 text-center transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[11px] font-bold text-accent">
                {BADGE[s.level]}
              </span>
              <span className="break-keep text-sm font-semibold text-ink">{s.name}</span>
            </span>
            <span className="break-keep text-xs text-muted">{s.sigungu}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
