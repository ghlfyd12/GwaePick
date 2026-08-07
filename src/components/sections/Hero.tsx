import Image from "next/image";
import CTAButton from "@/components/ui/CTAButton";
import QuickSearch from "@/components/QuickSearch";
import { heroContent } from "@/data/heroContent";
import styles from "./Hero.module.css";

/*
 * Hero(상단) 섹션 — 단일 배경 사진 + 차분한 모션.
 *
 * 슬라이더(2028 입시 뉴스 슬라이드)는 제거되어 단일 섹션이다(라이브러리 미사용).
 * 모션(Hero.module.css):
 *  - 배경 켄번즈: scale(1)→scale(1.06) 22초 1회 후 유지(무한반복 없음).
 *  - 텍스트 순차 페이드업: 헤드라인 → 주 CTA(데스크톱), 0.15초 간격 스태거, 1회.
 *  - prefers-reduced-motion: reduce 시 모든 모션 비활성(즉시 표시). transform/opacity 만 사용(CLS 없음).
 *
 * 카피/이미지는 모두 heroContent.ts 에서만 가져온다(하드코딩 금지).
 * 페이지 유일의 <h1> 은 이 섹션의 헤드라인.
 */
export default function Hero() {
  const { activeVariant, headlines, cta, heroBackground } = heroContent;
  const headline = headlines[activeVariant];

  return (
    <>
      <section
        id="hero"
        aria-labelledby="hero-heading"
        className="relative flex min-h-[58svh] items-start overflow-hidden md:min-h-[88vh] md:items-center"
      >
        {/* 배경 사진(맨 뒤) — 켄번즈(느린 확대). object-cover 로 꽉 채움. */}
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={heroBackground.src}
            alt={heroBackground.alt}
            fill
            priority
            sizes="100vw"
            className={`object-cover ${styles.kenburns}`}
            style={{ objectPosition: heroBackground.objectPosition }}
          />
        </div>

        {/* 가독성용 국소 중립 스크림 — 좌측만 옅게(검정), 전체 색 오버레이 아님. */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/35 via-black/10 to-transparent md:from-black/40 md:via-transparent" />

        {/* 전경 콘텐츠 — 상단·좌측, 폭 제한으로 중앙/우측 인물 회피. */}
        <div className="relative z-20 mx-auto w-full max-w-6xl px-5 pt-8 sm:px-6 md:pt-20">
          <div className="max-w-md">
            <h1
              id="hero-heading"
              className={`${styles.fadeUp} text-[1.3rem] font-bold leading-snug text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] md:text-[2.5rem] md:leading-[1.3] lg:text-5xl lg:leading-[1.25]`}
              style={{ animationDelay: "0s" }}
            >
              {/* break:true 조각 뒤에는 모바일에서만(md:hidden) 줄바꿈 — 데스크톱은 자연 줄바꿈 유지. */}
              {headline.map((seg, i) => (
                <span key={i}>
                  {seg.emphasis ? (
                    <strong className="font-extrabold text-accent">
                      {seg.text}
                    </strong>
                  ) : (
                    seg.text
                  )}
                  {seg.break && <br className="md:hidden" />}
                </span>
              ))}
            </h1>

            {/* 주 CTA — 데스크톱만(모바일은 상단 헤더 '무료상담'으로 이동). */}
            <div
              className={`${styles.fadeUp} mt-8 hidden md:block`}
              style={{ animationDelay: "0.15s" }}
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
      </section>

      {/* 모바일 전용 — 사진 아래 흰 배경 빠른 검색(학교/지역). 데스크톱은 전용 페이지. */}
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
