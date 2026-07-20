"use client";

import { useState } from "react";
import Link from "next/link";
import { dongHref } from "@/data/dongPageCopy";
import { regionSubjectTabs } from "@/data/regionSubjectTabs";
import RegionSubjectTabs from "@/components/RegionSubjectTabs";
import type { FlatDong } from "@/components/DongCardGrid";

/*
 * PagedDongGrid — 동 페이지네이션(/p/[n]) 용 동 카드 그리드 + 과목 탭.
 *
 * 기본값 [전체] 이므로 SSR HTML 의 동 링크는 기존 동 허브 그대로다(크롤러가 보는 링크 불변).
 * 과목 선택 시 각 동 버튼이 해당 동×과목 페이지로 연결된다. 과목 상태는 이 페이지 안에서만
 * 유지되며, 다른 페이지로 이동(SSR 링크)하면 [전체]로 초기화된다.
 */
export default function PagedDongGrid({
  sidoSlug,
  dongs,
}: {
  sidoSlug: string;
  dongs: FlatDong[];
}) {
  const [subject, setSubject] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4">
        <RegionSubjectTabs
          subjects={regionSubjectTabs}
          active={subject}
          onSelect={setSubject}
        />
      </div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {dongs.map((d) => (
          <li key={`${d.sigunguSlug}-${d.slug}`}>
            <Link
              href={
                subject && d.sigunguSlug && d.slug
                  ? dongHref(sidoSlug, d.sigunguSlug, d.slug, subject)
                  : dongHref(sidoSlug, d.sigunguSlug, d.slug)
              }
              className="flex h-full flex-col items-center justify-center rounded-xl border border-line bg-white px-3 py-3 text-center transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="break-keep text-sm font-semibold text-ink">{d.name}</span>
              <span className="mt-0.5 break-keep text-xs text-muted">{d.sigungu}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
