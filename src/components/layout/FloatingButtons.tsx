"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { POWER_CONSULT_HREF, isPowerPath } from "@/data/service";

/*
 * 우측 하단 고정 플로팅 버튼.
 *  - 아래: '상담전화연결' (tel: 전화 걸기) — 항상 표시, 코랄(accent)로 눈에 띄게.
 *  - 위: '스크롤 탑' — scrollY 가 기준을 넘으면 fade-in, 클릭 시 맨 위로 부드럽게.
 *
 * 색: accent 토큰 + 차콜/그레이 + 흰색. 토큰이라 메인은 코랄, /power 는 퍼플로 자동 렌더된다.
 * prefers-reduced-motion 이면 즉시 이동.
 *
 * /power(및 하위)에서만 '무료 상담 신청'(→ /power/consult) 버튼이 하나 더 붙는다.
 * 메인(지식의참견)은 상담 폼이 페이지 안에 있어 플로팅 구성 그대로 유지한다.
 */

// tel: 전화번호 — 실제 번호로 교체하려면 이 값만 수정.
const PHONE = "01021772720";
// 스크롤 탑 버튼이 나타나는 스크롤 기준(px) — 조절하려면 이 값만 수정.
const SCROLL_TOP_THRESHOLD = 300;
// 상담 도착지·경로 판별은 service.ts 단일 소스(Header 의 /power CTA 와 동일 기준).

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const [reduced, setReduced] = useState(false);
  const pathname = usePathname();

  // /power 스코프에서만 상담 신청 버튼 노출. 이미 상담 페이지면 자기 자신으로 보내지 않는다.
  const showConsult = isPowerPath(pathname) && pathname !== POWER_CONSULT_HREF;

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

      {/* 카톡 상담 — 항상 표시, 새 탭으로 카카오톡 오픈채팅 1:1 열기. 카카오 브랜드색(노랑+검정). */}
      <a
        href={site.contact.kakaoChannelUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오톡으로 상담 문의"
        className="cta-kakao inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FEE500] px-5 font-semibold text-black shadow-lg transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
        >
          <path d="M12 3C6.48 3 2 6.48 2 11c0 2.5 1.36 4.73 3.5 6.19 0 .7-.35 1.9-.7 2.66-.12.26.09.53.36.46.02 0 .04-.01.06-.02 1.2-.5 2.44-1.06 3.02-1.4.86.2 1.77.31 2.7.31 5.52 0 10-3.48 10-8s-4.48-8-10-8z" />
        </svg>
        <span>카톡 상담</span>
      </a>

      {/* 상담전화연결 — 항상 표시, tel: 전화 걸기.
          상담 신청 버튼이 함께 뜨는 /power 에서는 흰 배경 + 테두리로 낮춰 위계를 구분한다. */}
      <a
        href={`tel:${PHONE}`}
        aria-label="상담전화연결"
        className={`inline-flex min-h-12 items-center gap-2 rounded-full px-5 font-semibold shadow-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          showConsult
            ? "border-2 border-accent bg-white text-accent hover:bg-accent/5"
            : "bg-accent text-white hover:bg-accent-dark"
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
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span>상담전화연결</span>
      </a>

      {/* 무료 상담 신청 — /power 스코프 전용. 어학 전용 폼(/power/consult)으로 이동. */}
      {showConsult && (
        <Link
          href={POWER_CONSULT_HREF}
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
            <path d="M9 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" />
            <path d="M9 3h6v3H9zM8 11h6M8 15h4" />
            <path d="m16.5 8.5 4-4 2 2-4 4h-2z" />
          </svg>
          <span>{site.cta.label}</span>
        </Link>
      )}
    </div>
  );
}
