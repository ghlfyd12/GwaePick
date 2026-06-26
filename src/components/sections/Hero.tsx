"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CTAButton from "@/components/ui/CTAButton";
import QuickSearch from "@/components/QuickSearch";
import { heroContent, heroBgBlur } from "@/data/heroContent";

/*
 * Hero(상단) 섹션 — 배경 2슬라이드 크로스페이드 + 슬라이드별 오버레이.
 *
 * 전환(자동전환 없음):
 *  - PC(hover 가능): 히어로에 마우스를 올리면 뉴스 슬라이드로, 떼면 메인으로 페이드.
 *  - 터치(hover 불가): 히어로 탭으로 메인↔뉴스 토글 + 하단 점 2개로 수동 전환.
 *  - prefers-reduced-motion: 페이드를 즉시 전환으로 최소화.
 *
 * 슬라이드:
 *  - main(사진): fill + object-cover, 오버레이(헤드라인+CTA) 표시. 인물 회피 위해 좌상단 배치.
 *  - news(인포그래픽): object-contain + 최대폭 캡(확대 깨짐 방지) + 밝은 여백, 오버레이 숨김.
 *
 * 보라색 전체 오버레이 없음. 가독성은 텍스트 그림자 + 좌측 국소 중립(검정) 스크림만.
 * 카피/슬라이드/옵션은 모두 heroContent.ts 에서만 가져온다(하드코딩 금지).
 * 페이지 유일의 <h1> 은 항상 DOM 에 존재(뉴스 슬라이드에선 opacity 로만 숨김).
 */
export default function Hero() {
  const { activeVariant, headlines, cta, heroSlides, fadeMs, heroSideBanners } =
    heroContent;
  const headline = headlines[activeVariant];

  // 0 = 메인 슬라이드(기본), 1 = 뉴스 슬라이드
  const [current, setCurrent] = useState(0);

  // hover 가능 기기(PC) 여부 — 터치는 탭/점으로 대체
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // prefers-reduced-motion: 페이드 최소화
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const transitionMs = reducedMotion ? 0 : fadeMs;
  const slideCount = heroSlides.length;
  const showOverlay = heroSlides[current]?.showOverlay ?? true;
  // 보조 배너는 뉴스(인포그래픽) 슬라이드에서만 노출
  const isNewsSlide = heroSlides[current]?.fit === "contain";

  // PC: hover 로 뉴스(마지막) 슬라이드 ↔ 메인. 터치: 탭으로 토글.
  const handleEnter = () => canHover && setCurrent(slideCount - 1);
  const handleLeave = () => canHover && setCurrent(0);
  const handleTap = () => {
    if (!canHover) setCurrent((c) => (c === 0 ? slideCount - 1 : 0));
  };

  return (
    <>
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[58svh] items-start overflow-hidden md:min-h-[88vh] md:items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleTap}
    >
      {/* 배경 슬라이드(맨 뒤) — opacity 크로스페이드 */}
      <div className="absolute inset-0" aria-hidden="true">
        {heroSlides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              transitionDuration: `${transitionMs}ms`,
            }}
          >
            {slide.fit === "contain" ? (
              // 인포그래픽 슬라이드: (뒤)교실 배경(블러) → (앞)인포그래픽(선명, contain).
              <div className="relative h-full w-full">
                {/* 풀배경 교실 사진 — 메인과 공유되는 heroBgBlur 만 배경에 적용.
                    blur 의 가장자리 비침을 막기 위해 살짝 확대(scale-110). 인포그래픽/배너에는 블러 없음. */}
                {slide.bgImage && (
                  <Image
                    src={slide.bgImage}
                    alt=""
                    aria-hidden="true"
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="scale-110 object-cover"
                    style={{ filter: heroBgBlur }}
                  />
                )}
                {/* 인포그래픽: 전체가 보이게 + 히어로 영역에 거의 꽉 차게(가로 widthPct·세로 maxHeightPct).
                    상단에 보조 배너 행을 띄울 공간을 위해 약간 아래로 정렬(이미지 크기 자체는 유지). */}
                <div className="relative flex h-full w-full items-start justify-center pt-[136px] sm:pt-[104px] md:pt-[96px]">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={1255}
                    height={771}
                    priority={i === 0}
                    sizes="92vw"
                    className="object-contain"
                    style={{
                      width: `${slide.widthPct ?? 90}%`,
                      height: "auto",
                      maxHeight: `${slide.maxHeightPct ?? 85}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              // 사진: 영역을 꽉 채움(잘려도 무방), object-position 으로 인물 회피
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: slide.objectPosition }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 오버레이 그룹(스크림 + 헤드라인 + CTA) — 활성 슬라이드의 showOverlay 에 따라 페이드.
          h1 은 언마운트하지 않고 opacity 로만 숨겨 항상 DOM 에 1개 존재. */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity ease-in-out"
        style={{
          opacity: showOverlay ? 1 : 0,
          transitionDuration: `${transitionMs}ms`,
        }}
        aria-hidden={!showOverlay}
      >
        {/* 가독성용 국소 중립 스크림 — 좌측만 옅게(검정), 전체 색 오버레이 아님 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent md:from-black/40 md:via-transparent" />

        {/* 전경 콘텐츠 — 상단·좌측, 폭 제한으로 중앙/우측 인물 회피 */}
        <div className="relative mx-auto w-full max-w-6xl px-5 pt-24 sm:px-6 md:pt-20">
          <div className="max-w-md">
            <h1
              id="hero-heading"
              className="text-[2rem] font-bold leading-snug text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] sm:text-[2.5rem] md:leading-[1.3] lg:text-5xl lg:leading-[1.25]"
            >
              {headline.map((seg, i) =>
                seg.emphasis ? (
                  <strong key={i} className="font-extrabold text-accent">
                    {seg.text}
                  </strong>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </h1>

            {/* CTA — 첫 화면 유일한 신청 진입점. 오버레이가 보일 때만 클릭 가능. */}
            <div
              className="pointer-events-auto mt-7"
              onClick={(e) => e.stopPropagation()}
            >
              <CTAButton
                href={cta.href}
                size="lg"
                className="w-full shadow-lg sm:w-auto"
              >
                {cta.label}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      {/* 보조 배너 — 뉴스 슬라이드에서만, 인포그래픽 상단 가운데(위 여백)에 가로 정렬.
          메인 슬라이드에서는 렌더하지 않아 자리도 차지하지 않는다. */}
      {isNewsSlide && (
        <nav
          aria-label="추가 안내 바로가기"
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute left-1/2 top-3 z-20 flex w-full max-w-3xl -translate-x-1/2 flex-wrap items-center justify-center gap-2 px-4 sm:top-5 sm:gap-3"
        >
          {heroSideBanners.map((banner) => (
            <a
              key={banner.href}
              href={banner.href}
              className="inline-flex items-center justify-center rounded-full bg-accent/95 px-6 py-3 text-base font-semibold text-white shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-lg sm:px-7 sm:py-3.5"
            >
              {banner.label}
            </a>
          ))}
        </nav>
      )}

      {/* 페이지네이션 점 — 수동 전환(특히 터치) */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
            }}
            aria-label={`${i + 1}번 이미지 보기`}
            aria-current={i === current}
            className={`h-2.5 rounded-full transition-all ${
              i === current
                ? "w-6 bg-white shadow"
                : "w-2.5 bg-white/60 shadow hover:bg-white/90"
            }`}
          />
        ))}
      </div>
    </section>

      {/* 모바일 전용 — 사진 아래 흰 배경 빠른 검색(학교/지역). 흰 배경이라 라벨 보정 불필요. 데스크톱은 전용 페이지. */}
      <div className="border-b border-line bg-white px-5 py-5 md:hidden">
        <QuickSearch
          kind="school"
          label="학교 빠르게 검색"
          placeholder="학교 빠르게 검색 (예: ○○중학교, ○○고등학교)"
          emptyMessage="학교 데이터에서 찾지 못했습니다. 바로 상담받으시면 학교에 맞춰 안내해 드립니다."
        />
        <div className="mt-3">
          <QuickSearch
            kind="region"
            label="우리 지역 빠르게 검색"
            placeholder="우리 지역 빠르게 검색 (예: 대치동, 강남구, 일산)"
          />
        </div>
      </div>
    </>
  );
}
