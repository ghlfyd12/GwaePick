import { Fragment } from "react";
import Image from "next/image";
import QuickSearch from "@/components/QuickSearch";
import type { HeroSearchKind } from "@/lib/heroSearch";

/*
 * HeroSearch — 지역/학교/과목 탭 공통 히어로(좌: eyebrow+3줄 헤드라인+서브카피+빠른검색 / 우: 학생 단체 이미지).
 * 워딩·검색대상만 props 로 분기. 학생 이미지는 기존 지역별 자산 공통 재사용(신규 생성 없음).
 * 페이지 유일 h1 = 헤드라인. 모바일 390px 에서 이미지는 아래로 스택.
 */
export default function HeroSearch({
  eyebrow,
  headlineLines,
  subCopyLines,
  searchKind,
  searchLabel,
  searchPlaceholder,
  searchEmptyMessage,
  image = { src: "/images/region-hero.jpg", alt: "교복 입은 학생들" },
}: {
  eyebrow: string;
  headlineLines: string[];
  subCopyLines: string[];
  searchKind: HeroSearchKind;
  searchLabel: string;
  searchPlaceholder: string;
  searchEmptyMessage?: string;
  image?: { src: string; alt: string };
}) {
  return (
    <section className="border-b border-line bg-[#E1CFB8] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-[2fr_3fr] md:gap-12">
        {/* 텍스트 — 모바일 가운데, 데스크톱 왼쪽 정렬 */}
        <div className="text-center md:text-left">
          <p className="text-base font-semibold uppercase tracking-widest text-accent sm:text-lg">
            {eyebrow}
          </p>
          {/* md:text-5xl(6xl 에서 한 단계↓) + text-balance — 좁은 제목칸에서도 1번 줄이
              "…과목에 / 맞춘"처럼 외톨이로 접히지 않고 균형있게 줄바꿈된다. 모바일은 영향 없음. */}
          <h1 className="mt-2 text-balance break-keep text-4xl font-bold leading-tight text-ink sm:text-5xl">
            {headlineLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </h1>
          <p className="mx-auto mt-4 max-w-md break-keep text-lg leading-relaxed text-muted sm:text-xl md:mx-0 md:text-2xl">
            {subCopyLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>

          {/* 빠른 검색 — 탭별 인덱스(지역/학교/과목) */}
          <QuickSearch
            kind={searchKind}
            label={searchLabel}
            placeholder={searchPlaceholder}
            emptyMessage={searchEmptyMessage}
          />
        </div>

        {/* 학생 이미지 — 3:2, 칼럼을 꽉 채워 확대. 그림자 없이 베이지 배경에 녹임. 인물 상단 유지 */}
        <div className="overflow-hidden rounded-2xl">
          <Image
            src={image.src}
            alt={image.alt}
            width={1024}
            height={677}
            priority
            sizes="(min-width: 768px) 55vw, 100vw"
            className="h-auto w-full object-top"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
