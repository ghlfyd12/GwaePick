"use client";

import { useEffect, useState } from "react";

/*
 * 우측 하단 고정 플로팅 버튼.
 *  - 아래: '상담전화연결' (tel: 전화 걸기) — 항상 표시, 코랄(accent)로 눈에 띄게.
 *  - 위: '스크롤 탑' — scrollY 가 기준을 넘으면 fade-in, 클릭 시 맨 위로 부드럽게.
 *
 * 색: 주황(accent) + 차콜/그레이 + 흰색 (보라 없음). prefers-reduced-motion 이면 즉시 이동.
 */

// tel: 전화번호 — 실제 번호로 교체하려면 이 값만 수정.
const PHONE = "01021772720";
// 스크롤 탑 버튼이 나타나는 스크롤 기준(px) — 조절하려면 이 값만 수정.
const SCROLL_TOP_THRESHOLD = 300;

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const [reduced, setReduced] = useState(false);

  // prefers-reduced-motion: 부드러운 스크롤 → 즉시 이동
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 스크롤 위치 감지 — 기준 이상이면 스크롤탑 노출
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > SCROLL_TOP_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
      {/* 스크롤 탑 — 기준 이상에서만 표시(부드러운 fade), 중립(흰 배경+차콜) */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        style={{ opacity: showTop ? 1 : 0 }}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md transition-opacity duration-300 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          showTop ? "" : "pointer-events-none"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      {/* 상담전화연결 — 항상 표시, tel: 전화 걸기 */}
      <a
        href={`tel:${PHONE}`}
        aria-label="상담전화연결"
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-white shadow-lg transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span>상담전화연결</span>
      </a>
    </div>
  );
}
