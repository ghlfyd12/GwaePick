import type { Metadata } from "next";
import Link from "next/link";
import RegionMap, { type RegionFeatureCollection } from "@/components/RegionMap";
import HeroSearch from "@/components/HeroSearch";
import DetailTrustBlock from "@/components/DetailTrustBlock";
import koreaSido from "@/data/korea-sido.json";
import { sidoList } from "@/data/sido";
import { regions, type Region } from "@/data/regions";
import { mainDistricts } from "@/data/mainDistricts";

/*
 * 지역 랜딩(122 시군구 + 94 생활권 = 216개 /[id]) 인바운드 링크용 크롤 진입로.
 * regions.ts·mainDistricts.ts 는 건드리지 않고 여기서 파생만 한다(자동 생성/축 독립).
 * province 등장 순서를 보존하되, 시도 안에서:
 *   - 다구(多區) 시는 "수원" 소제목 아래 구를 묶고(2개 이상),
 *   - 구가 없는 시/군/구는 시도 바로 아래 단독 항목으로 두며,
 *   - 소그룹 제목·단독 항목을 가나다로 섞어 정렬,
 *   - 생활권 94개는 행정구와 섞지 않고 각 시도 하단 "신도시·생활권" 소그룹으로 배치.
 * 전부 정적 <a> + <details open>(기본 펼침) → 링크는 항상 DOM 상주(크롤 경로 보존).
 */
type RegionCard = { id: string; label: string };
type SubGroup = { title: string; cards: RegionCard[] };
type RegionRow = { kind: "sub"; sub: SubGroup } | { kind: "solos"; cards: RegionCard[] };
type ProvinceBlock = { province: string; rows: RegionRow[] };

const byKo = (a: string, b: string) => a.localeCompare(b, "ko");
/** 시 소제목: cityQuery 첫 토큰에서 말미 '시' 제거(수원시→수원). */
const cityLabel = (cityQuery: string) => {
  const first = cityQuery.split(" ")[0];
  return first.endsWith("시") ? first.slice(0, -1) : first;
};

const provinceBlocks: ProvinceBlock[] = (() => {
  const order: string[] = [];
  const byProvince = new Map<string, Region[]>();
  for (const r of regions) {
    if (!byProvince.has(r.province)) {
      byProvince.set(r.province, []);
      order.push(r.province);
    }
    byProvince.get(r.province)!.push(r);
  }
  const districtsByProvince = new Map<string, Region[]>();
  for (const d of mainDistricts) {
    if (!districtsByProvince.has(d.province)) districtsByProvince.set(d.province, []);
    districtsByProvince.get(d.province)!.push(d);
  }
  // regions 에 없고 생활권에만 있는 province 도 누락 없이 뒤에 편입.
  for (const p of districtsByProvince.keys()) if (!byProvince.has(p)) order.push(p);

  return order.map((province) => {
    const items = byProvince.get(province) ?? [];
    // 다구 시 그룹핑(cityQuery 에 공백 → 첫 토큰이 시).
    const cityMap = new Map<string, Region[]>();
    const solos: Region[] = [];
    for (const r of items) {
      if (r.cityQuery.includes(" ")) {
        const city = r.cityQuery.split(" ")[0];
        if (!cityMap.has(city)) cityMap.set(city, []);
        cityMap.get(city)!.push(r);
      } else {
        solos.push(r);
      }
    }
    type Entry =
      | { sortKey: string; kind: "sub"; sub: SubGroup }
      | { sortKey: string; kind: "solo"; card: RegionCard };
    const entries: Entry[] = [];
    for (const [city, gus] of cityMap) {
      if (gus.length >= 2) {
        const title = cityLabel(city);
        entries.push({
          sortKey: title,
          kind: "sub",
          sub: {
            title,
            cards: gus
              .slice()
              .sort((a, b) => byKo(a.name, b.name))
              .map((r) => ({ id: r.id, label: r.name })),
          },
        });
      } else {
        solos.push(gus[0]); // 단일 구 시는 단독 항목으로 강등
      }
    }
    for (const r of solos) {
      entries.push({ sortKey: r.name, kind: "solo", card: { id: r.id, label: r.name } });
    }
    entries.sort((a, b) => byKo(a.sortKey, b.sortKey));

    // 연속 단독 항목은 한 그리드로 묶는다.
    const rows: RegionRow[] = [];
    let buf: RegionCard[] = [];
    const flush = () => {
      if (buf.length) {
        rows.push({ kind: "solos", cards: buf });
        buf = [];
      }
    };
    for (const e of entries) {
      if (e.kind === "sub") {
        flush();
        rows.push({ kind: "sub", sub: e.sub });
      } else {
        buf.push(e.card);
      }
    }
    flush();

    // 생활권은 항상 시도 하단.
    const dItems = districtsByProvince.get(province);
    if (dItems && dItems.length) {
      rows.push({
        kind: "sub",
        sub: {
          title: "신도시·생활권",
          cards: dItems
            .slice()
            .sort((a, b) => byKo(a.name, b.name))
            .map((r) => ({ id: r.id, label: r.name })),
        },
      });
    }

    return { province, rows };
  });
})();

/*
 * 헤더 카피 — A안 적용. (교체 쉽게 B·C안 보존)
 * B안: eyebrow "전국 1:1 과외" / 제목 "지역에 맞는 선생님을, 가장 가까이에서"
 *      / 인트로 "전 지역 학생 맞춤 커리큘럼 상담 · 무료 체험. 아래 지도에서 지역을 선택하면 해당 시·구로 이어집니다."
 * C안: eyebrow "지역별 맞춤" / 제목 "우리 지역, 어떤 선생님이 맞을까요"
 *      / 인트로 "지역별 커리큘럼 상담과 무료 체험을 제공합니다. 원하는 지역을 선택해 시·구별로 확인하세요."
 */
const EYEBROW = "전국 어디서나";
// 제목은 화면 폭과 무관하게 항상 이 두 줄로 고정(<br/> 로 강제 줄바꿈).
const HEADLINE_LINES = ["우리 동네에서 시작하는", "1:1 맞춤 과외"];
// 서브카피는 "…무료 체험." 뒤에서 줄을 나눠 두 줄로(문구 동일).
const INTRO_LINES = [
  "지역별 맞춤 커리큘럼 상담과 무료 체험.",
  "원하는 지역을 선택하면 해당 시·구가 나타납니다.",
];

/** 좁은 광역시 라벨이 인접 도와 겹치지 않게 살짝 위치 보정(viewBox 단위). 데이터는 그대로. */
const SIDO_LABEL_NUDGE: Record<string, [number, number]> = {
  seoul: [-5, -11],
  gyeonggi: [26, 18],
  incheon: [-16, 4],
  sejong: [-7, -8],
  daejeon: [5, 8],
  gwangju: [-3, 3],
  ulsan: [14, 1],
  busan: [6, 7],
  daegu: [4, 0],
};

export const metadata: Metadata = {
  title: "지역별 1:1 과외", // 루트 template → "지역별 1:1 과외 | 지식의참견"
  description:
    "전국 17개 시/도 지도에서 우리 지역을 선택해 1:1 과외를 시작하세요. 직접 가르쳐 본 선생님이 아이에게 맞는 선생님을 연결해 드립니다.",
  alternates: { canonical: "/tutoring/by-region" },
};

export default function ByRegionPage() {
  return (
    <>
      {/* 공통 히어로 — 지역 검색. 학교/과목 탭과 동일 구도(워딩·검색대상만 분기) */}
      <HeroSearch
        eyebrow={EYEBROW}
        headlineLines={HEADLINE_LINES}
        subCopyLines={INTRO_LINES}
        searchKind="region"
        searchLabel="우리 지역 빠르게 검색"
        searchPlaceholder="우리 지역 빠르게 검색 (예: 대치동, 강남구, 일산)"
      />

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        {/* 데스크톱 좌우 2단(지도 3 : 그리드 2) / 모바일·태블릿 1단 스택 */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
          {/* 왼쪽: 전국 시/도 지도(칼럼 폭을 꽉 채움) */}
          <div className="w-full">
            <RegionMap
              geo={koreaSido as unknown as RegionFeatureCollection}
              hrefPrefix="/tutoring/by-region"
              ariaLabel="전국 시/도 지도 — 지역을 선택하세요"
              labelNudge={SIDO_LABEL_NUDGE}
            />
          </div>

          {/* 오른쪽: 시/도 텍스트 링크 그리드(접근성·SEO·모바일 보조, 지도와 동일 목적지) */}
          <nav aria-label="시/도 목록" className="w-full">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {sidoList.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/tutoring/by-region/${s.slug}`}
                    className="block rounded-xl border border-line bg-white px-3 py-3 text-center text-base font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* 지역별 맞춤 안내 — 216개(시군구 122 + 생활권 94) 랜딩 인바운드(크롤 경로).
          시도별 <details open>(기본 펼침, 링크 전부 DOM 상주), 시 소그룹·생활권 소그룹. */}
      <section className="border-t border-line bg-surface px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            지역별 맞춤 과외 안내
          </h2>
          <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
            우리 지역을 선택하면 지역 맞춤 안내 페이지로 이어집니다. 시·도 제목을
            눌러 접거나 펼칠 수 있습니다.
          </p>

          <div className="mt-8 divide-y divide-line">
            {provinceBlocks.map((block) => (
              <details key={block.province} open className="py-5 first:pt-0">
                <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                  <h3 className="break-keep text-sm font-semibold text-accent sm:text-base">
                    {block.province}
                  </h3>
                  <span
                    aria-hidden
                    className="ml-2 text-muted transition-transform [[open]_&]:rotate-180"
                  >
                    ⌄
                  </span>
                </summary>

                <div className="mt-4 space-y-5">
                  {block.rows.map((row, i) =>
                    row.kind === "sub" ? (
                      <div key={`sub-${i}`}>
                        <h4 className="mb-2 break-keep text-xs font-semibold text-muted sm:text-sm">
                          {row.sub.title}
                        </h4>
                        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                          {row.sub.cards.map((c) => (
                            <li key={c.id}>
                              <Link
                                href={`/${c.id}`}
                                className="block break-keep rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                              >
                                {c.label} 과외
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <ul
                        key={`solos-${i}`}
                        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
                      >
                        {row.cards.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/${c.id}`}
                              className="block break-keep rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            >
                              {c.label} 과외
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 공통 상세 신뢰 블록 — 3가지 이유 · 자질/역량 · 합격 후기 캐러셀(학교/과목 탭과 동일) */}
      <DetailTrustBlock />
    </>
  );
}
