import type { Metadata } from "next";
import Link from "next/link";
import RegionMap, { type RegionFeatureCollection } from "@/components/RegionMap";
import HeroSearch from "@/components/HeroSearch";
import DetailTrustBlock from "@/components/DetailTrustBlock";
import koreaSido from "@/data/korea-sido.json";
import { sidoList } from "@/data/sido";
import { regions, type Region } from "@/data/regions";

/*
 * 지역 랜딩(122개 /[id]) 인바운드 링크용 — province 별로 묶는다(regions 등장 순서 보존).
 * regions.ts 는 자동 생성 파일이라 건드리지 않고 여기서 파생만 한다.
 * 서버 컴포넌트가 아래 섹션에서 전부 정적 <a> 로 렌더 → 122개 전 페이지 크롤 진입로 확보.
 */
const regionGroups: { province: string; items: Region[] }[] = (() => {
  const order: string[] = [];
  const byProvince = new Map<string, Region[]>();
  for (const r of regions) {
    if (!byProvince.has(r.province)) {
      byProvince.set(r.province, []);
      order.push(r.province);
    }
    byProvince.get(r.province)!.push(r);
  }
  return order.map((province) => ({ province, items: byProvince.get(province)! }));
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

      {/* 지역별 맞춤 안내 — 122개 시/군/구 랜딩 인바운드(크롤 경로). province 그룹, 전부 정적 <a>. */}
      <section className="border-t border-line bg-surface px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            지역별 맞춤 과외 안내
          </h2>
          <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
            우리 지역을 선택하면 지역 맞춤 안내 페이지로 이어집니다.
          </p>

          <div className="mt-8 space-y-8">
            {regionGroups.map((group) => (
              <div key={group.province}>
                <h3 className="break-keep text-sm font-semibold text-accent sm:text-base">
                  {group.province}
                </h3>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {group.items.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/${r.id}`}
                        className="block break-keep rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {r.name} 과외
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 공통 상세 신뢰 블록 — 3가지 이유 · 자질/역량 · 합격 후기 캐러셀(학교/과목 탭과 동일) */}
      <DetailTrustBlock />
    </>
  );
}
