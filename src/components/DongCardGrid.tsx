import Link from "next/link";
import { dongHref } from "@/data/dongPageCopy";

/*
 * DongCardGrid — 서버 렌더링 동 카드 <a> 그리드(RegionDongBrowser 카드와 동일 스타일).
 * 동 페이지네이션(/p/[n])에서 사용. 링크 대상은 기존 dongHref(동 허브) 체계 유지.
 */
export type FlatDong = { name: string; slug: string; sigungu: string; sigunguSlug: string };

export default function DongCardGrid({
  sidoSlug,
  dongs,
}: {
  sidoSlug: string;
  dongs: FlatDong[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {dongs.map((d) => (
        <li key={`${d.sigunguSlug}-${d.slug}`}>
          <Link
            href={dongHref(sidoSlug, d.sigunguSlug, d.slug)}
            className="flex h-full flex-col items-center justify-center rounded-xl border border-line bg-white px-3 py-3 text-center transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="break-keep text-sm font-semibold text-ink">{d.name}</span>
            <span className="mt-0.5 break-keep text-xs text-muted">{d.sigungu}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
