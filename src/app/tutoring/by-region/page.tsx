import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RegionMap, { type RegionFeatureCollection } from "@/components/RegionMap";
import RegionQuickSearch from "@/components/RegionQuickSearch";
import koreaSido from "@/data/korea-sido.json";
import { sidoList } from "@/data/sido";

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
      {/* 헤더 — 텍스트(좌) · 학생 이미지(우, 확대). 베이지 배경으로 사진과 조화. 유일한 h1 */}
      <section className="border-b border-line bg-[#E1CFB8] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-[2fr_3fr] md:gap-12">
          {/* 텍스트 — 모바일 가운데, 데스크톱 왼쪽 정렬 */}
          <div className="text-center md:text-left">
            <p className="text-base font-semibold uppercase tracking-widest text-accent sm:text-lg">
              {EYEBROW}
            </p>
            <h1 className="mt-2 break-keep text-4xl font-bold leading-tight text-ink sm:text-5xl md:text-6xl">
              {HEADLINE_LINES[0]}
              <br />
              {HEADLINE_LINES[1]}
            </h1>
            <p className="mx-auto mt-4 max-w-md break-keep text-lg leading-relaxed text-muted sm:text-xl md:mx-0 md:text-2xl">
              {INTRO_LINES[0]}
              <br />
              {INTRO_LINES[1]}
            </p>

            {/* 우리 지역 빠르게 검색 — 전국 통합(시/도·시군구·동) */}
            <RegionQuickSearch />
          </div>

          {/* 학생 이미지 — 3:2, 칼럼을 꽉 채워 확대. 그림자 없이 베이지 배경에 녹임. 인물 상단 유지 */}
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/region-hero.jpg"
              alt="교복 입은 학생들"
              width={1024}
              height={677}
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="h-auto w-full object-top"
              // 개발 서버 이미지 최적화 이슈 회피. 배포 시 최적화를 원하면 제거.
              unoptimized
            />
          </div>
        </div>
      </section>

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
    </>
  );
}
