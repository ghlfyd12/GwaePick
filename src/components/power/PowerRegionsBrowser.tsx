"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PowerRegionSearchIndex } from "@/data/powerRegionSearch";

/*
 * PowerRegionsBrowser — /power/regions 전용 지역 탐색 UI(클라이언트).
 *
 * 메인 /tutoring/by-region 의 탐색 패턴(지역 검색 + 상위지역 필터 칩 + 과목 선택)을
 * /power 어학 5과목·퍼플 톤으로 복제한 변형이다(공유 컴포넌트 미수정 → 메인 diff 0).
 *
 * SEO: 클라이언트 컴포넌트지만 서버에서 초기 렌더된다. 기본 상태(과목=영어회화,
 *   시도=전체)에서 시군구 253 + 신도시 지명 전 링크가 초기 HTML 에 포함된다.
 *   시도 필터는 표시(visibility)만 제어하고 링크를 DOM 에서 제거하지 않는다.
 * 검색: 확장 동까지 포함한 인덱스는 초기 상호작용 때 지연 fetch(경량 원칙).
 * 색은 accent 토큰만 — /power 스코프에서 퍼플로 렌더된다(코랄 하드코딩 없음).
 */

const SEARCH_INDEX_URL = "/power/regions/search-index";
const MAX_RESULTS = 60;

export interface SigunguGroup {
  sidoLabel: string;
  sidoSlug: string;
  sigungu: { name: string; slug: string }[];
}
export interface DistrictGroup {
  region: string;
  districts: { name: string; slug: string; sido: string }[];
}

export default function PowerRegionsBrowser({
  sidoChips,
  sigunguGroups,
  districtGroups,
  subjects,
  totalDistricts,
}: {
  sidoChips: { label: string; full: string }[];
  sigunguGroups: SigunguGroup[];
  districtGroups: DistrictGroup[];
  subjects: { slug: string; label: string }[];
  totalDistricts: number;
}) {
  const [subject, setSubject] = useState(subjects[0]?.slug ?? "english-conversation");
  const [sidoFilter, setSidoFilter] = useState<string | null>(null); // null=전체, else 정식명
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<PowerRegionSearchIndex | null>(null);
  // 아코디언 열림 상태 — 기본 전부 접힘({}). key: 시군구=시도 정식명 / 신도시=권역명.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  // 시도 필터 선택 시 해당 그룹 자동 펼침(전체로 돌아오면 전부 접힘).
  useEffect(() => {
    if (sidoFilter === null) {
      setOpenMap({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const g of sigunguGroups) if (g.sidoLabel === sidoFilter) next[g.sidoLabel] = true;
    for (const g of districtGroups)
      if (g.districts.some((d) => d.sido === sidoFilter)) next[g.region] = true;
    setOpenMap(next);
  }, [sidoFilter, sigunguGroups, districtGroups]);

  const toggleOpen = (key: string, open: boolean) =>
    setOpenMap((m) => (m[key] === open ? m : { ...m, [key]: open }));

  const href = useCallback(
    (slug: string) => `/power/by-region/${encodeURIComponent(slug)}/${subject}`,
    [subject],
  );

  // 검색 인덱스 지연 로드(첫 포커스/입력 때 1회).
  const loadIndex = useCallback(() => {
    if (index) return;
    fetch(SEARCH_INDEX_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setIndex(data as PowerRegionSearchIndex))
      .catch(() => {});
  }, [index]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || !index) return [];
    const out: { name: string; slug: string; sido: string }[] = [];
    for (const it of index.items) {
      const name = it[0];
      if (!name.includes(q)) continue;
      const slug = (it[2] as string | undefined) ?? name;
      out.push({ name, slug, sido: index.sidos[it[1]] });
      if (out.length >= MAX_RESULTS) break;
    }
    return out;
  }, [query, index]);

  const showResults = query.trim().length > 0;
  const visibleSido = (label: string) => sidoFilter === null || sidoFilter === label;

  return (
    <div>
      {/* 1. 지역 검색창 */}
      <div className="relative mx-auto max-w-xl">
        <label htmlFor="power-region-search" className="sr-only">
          지역 이름으로 찾기
        </label>
        <input
          id="power-region-search"
          type="text"
          value={query}
          onFocus={loadIndex}
          onChange={(e) => {
            setQuery(e.target.value);
            loadIndex();
          }}
          placeholder="지역 이름으로 찾기 (예: 판교, 분당, 내곡)"
          autoComplete="off"
          className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />

        {showResults && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lg">
            {index === null ? (
              <p className="px-3 py-4 text-center text-sm text-muted">불러오는 중…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted">
                “{query.trim()}” 으로 찾은 지역이 없습니다. 상담으로 바로 연결해 드립니다.
              </p>
            ) : (
              <ul>
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={href(r.slug)}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/5"
                    >
                      <span className="break-keep text-sm font-semibold text-ink">
                        {r.name}
                      </span>
                      <span className="shrink-0 break-keep text-xs text-muted">{r.sido}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 2. 시도 필터 칩 — 가로 스크롤 */}
      <div
        role="tablist"
        aria-label="시도 필터"
        className="mt-6 flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={sidoFilter === null}
          onClick={() => setSidoFilter(null)}
          className={chipClass(sidoFilter === null)}
        >
          전체보기
        </button>
        {sidoChips.map((s) => (
          <button
            key={s.full}
            type="button"
            role="tab"
            aria-selected={sidoFilter === s.full}
            onClick={(e) => {
              setSidoFilter(s.full);
              e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
            }}
            className={chipClass(sidoFilter === s.full)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 3. 과목 선택 칩 — 기본 영어회화 */}
      <div className="mt-6 text-center">
        <p className="text-sm font-semibold text-muted">과목 선택</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {subjects.map((s) => {
            const selected = subject === s.slug;
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSubject(s.slug)}
                  className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base ${
                    selected
                      ? "bg-accent text-white"
                      : "border border-accent/30 bg-white text-ink hover:border-accent hover:text-accent"
                  }`}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 4. 시군구 그룹(시도별) — 기본 접힘 아코디언(details/summary). 링크는 접혀도 DOM 유지(SEO).
             시도 필터로 표시 제어 + 선택 시 자동 펼침. */}
      <ul className="mt-12 space-y-3">
        {sigunguGroups.map((group) => (
          <li key={group.sidoLabel} hidden={!visibleSido(group.sidoLabel)}>
            <details
              className="group border-b border-line"
              open={!!openMap[group.sidoLabel]}
              onToggle={(e) => toggleOpen(group.sidoLabel, e.currentTarget.open)}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 [&::-webkit-details-marker]:hidden">
                <span className="break-keep text-xl font-bold text-accent sm:text-2xl">
                  {group.sidoLabel}
                </span>
                <ChevronIcon />
              </summary>
              <div className="pb-4">
                <Link
                  href={`/power/${encodeURIComponent(group.sidoSlug)}`}
                  className="break-keep text-[13px] font-semibold text-accent transition-colors hover:underline sm:text-sm"
                >
                  {group.sidoLabel} 전체 안내 →
                </Link>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {group.sigungu.map((sg) => (
                    <li key={sg.slug}>
                      <Link
                        href={href(sg.slug)}
                        className="break-keep text-[13px] font-medium text-ink transition-colors hover:text-accent hover:underline sm:text-sm"
                      >
                        {sg.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </li>
        ))}
      </ul>

      {/* 5. 신도시·주요 생활권(권역별) — 시도 필터·과목 선택 연동 */}
      <section aria-labelledby="districts-heading" className="mt-16">
        <h2
          id="districts-heading"
          className="break-keep text-2xl font-bold text-ink sm:text-3xl"
        >
          신도시·주요 생활권
        </h2>
        <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">
          행정구역으로 찾기 어려운 {totalDistricts}개 신도시·택지지구·생활권도 방문·온라인
          1:1 수업을 준비했습니다.
        </p>
        <ul className="mt-8 space-y-3">
          {districtGroups.map((group) => {
            const anyVisible = group.districts.some((d) => visibleSido(d.sido));
            return (
              <li key={group.region} hidden={!anyVisible}>
                <details
                  className="group border-b border-line"
                  open={!!openMap[group.region]}
                  onToggle={(e) => toggleOpen(group.region, e.currentTarget.open)}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="break-keep text-lg font-bold text-ink sm:text-xl">
                      {group.region}
                    </span>
                    <ChevronIcon />
                  </summary>
                  <ul className="flex flex-wrap gap-x-4 gap-y-2 pb-4">
                    {group.districts.map((d) => (
                      <li key={d.slug} hidden={!visibleSido(d.sido)}>
                        <Link
                          href={href(d.slug)}
                          className="break-keep text-[13px] font-medium text-ink transition-colors hover:text-accent hover:underline sm:text-sm"
                        >
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-accent transition-transform group-open:rotate-180"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function chipClass(selected: boolean): string {
  return `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    selected
      ? "bg-accent text-white"
      : "border border-accent/30 bg-white text-muted hover:border-accent hover:text-accent"
  }`;
}
