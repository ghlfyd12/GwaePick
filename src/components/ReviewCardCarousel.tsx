"use client";

import { useEffect, useRef, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { reviewCards } from "@/data/reviewCards";

/*
 * ReviewCardCarousel — 합격·성장 후기 카드 캐러셀.
 *
 * 자동(5초, 한 칸씩 부드럽게, 끝→처음 루프) + 수동(데스크톱 화살표, 모바일 스와이프=scroll-snap).
 * hover(데스크톱)/터치(모바일) 시 일시정지, 수동 조작 시 타이머 리셋.
 * prefers-reduced-motion: reduce 면 자동 끔. 하단 점 인디케이터.
 * 데이터는 reviewCards.ts. 사진 없으면 영역만 비움(SafeImage). 항목 0개면 부모가 숨김.
 */

const AUTOPLAY_MS = 5000;

export default function ReviewCardCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const timerRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const pausedRef = useRef(false);
  const [active, setActive] = useState(0);

  const stepWidth = () => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 16;
    return first.offsetWidth + gap;
  };

  const goNext = () => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
      el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: stepWidth(), behavior: "smooth" });
  };
  const goPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft <= 2)
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: -stepWidth(), behavior: "smooth" });
  };

  const stopAuto = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const startAuto = () => {
    stopAuto();
    if (reducedRef.current || pausedRef.current) return;
    timerRef.current = window.setInterval(() => {
      if (!pausedRef.current) goNext();
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    startAuto();
    return stopAuto;
    // 마운트 시 1회 — startAuto/stopAuto 는 ref 기반이라 의존성 불필요.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    const s = stepWidth();
    if (!s || !trackRef.current) return;
    setActive(Math.round(trackRef.current.scrollLeft / s));
  };

  const pause = () => {
    pausedRef.current = true;
    stopAuto();
  };
  const resume = () => {
    pausedRef.current = false;
    startAuto();
  };
  // 화살표/점 조작 → 이동 후 타이머 리셋
  const manual = (fn: () => void) => {
    fn();
    startAuto();
  };

  const goTo = (i: number) => {
    trackRef.current?.scrollTo({ left: i * stepWidth(), behavior: "smooth" });
  };

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            합격·성장 후기
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            직접 수업을 경험한 학생들의 합격·성장 이야기입니다.
          </p>
        </div>

        <div className="relative mt-8">
          {/* 데스크톱 화살표 */}
          <button
            type="button"
            aria-label="이전 후기"
            onClick={() => manual(goPrev)}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-white p-2.5 text-ink shadow-md transition-colors hover:border-accent hover:text-accent md:flex"
          >
            <span aria-hidden className="text-xl leading-none">‹</span>
          </button>
          <button
            type="button"
            aria-label="다음 후기"
            onClick={() => manual(goNext)}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-line bg-white p-2.5 text-ink shadow-md transition-colors hover:border-accent hover:text-accent md:flex"
          >
            <span aria-hidden className="text-xl leading-none">›</span>
          </button>

          {/* 트랙 — 스와이프(scroll-snap), 스크롤바 숨김 */}
          <ul
            ref={trackRef}
            onScroll={onScroll}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onTouchStart={pause}
            onTouchEnd={resume}
            aria-label="합격·성장 후기 목록"
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviewCards.map((r, i) => (
              <li
                key={`${r.school}-${i}`}
                className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[31%] xl:w-[23%]"
              >
                <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                  <div className="flex flex-1 flex-col p-5">
                    <p className="break-keep text-lg font-bold text-ink">{r.title}</p>
                    <p className="mt-2 break-keep text-sm leading-relaxed text-muted">
                      “{r.quote}”
                    </p>
                    <p className="mt-3 text-sm font-semibold text-ink">{r.member}</p>
                  </div>

                  {/* 인물 사진 — 없으면 SafeImage 가 null → 연한 배경만(깨짐 없음) */}
                  <div className="relative mt-auto aspect-[4/3] w-full bg-surface-alt">
                    <SafeImage
                      src={r.photo}
                      alt={`${r.school} 합격 ${r.member} 후기`}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 78vw"
                      className="object-cover object-top"
                    />
                    {/* 영상 후기 연결이 있을 때만 재생 버튼 */}
                    {r.videoUrl && (
                      <a
                        href={r.videoUrl}
                        aria-label={`${r.school} 후기 영상 재생`}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span
                          aria-hidden
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/90 text-lg text-white shadow-md"
                        >
                          ▶
                        </span>
                      </a>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {/* 점 인디케이터 */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {reviewCards.map((r, i) => (
              <button
                key={`dot-${r.school}-${i}`}
                type="button"
                aria-label={`${i + 1}번째 후기로 이동`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => manual(() => goTo(i))}
                className={`h-2.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-accent" : "w-2.5 bg-line hover:bg-accent/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
