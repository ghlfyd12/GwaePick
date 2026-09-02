"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import {
  POWER_CONSULT_HREF,
  GUMJUNG_CONSULT_HREF,
  serviceFromPath,
  SERVICE,
} from "@/data/service";

/*
 * 상담 바로가기 — 데스크톱(≥1024px)은 우측 하단 세로 플로팅(현행 유지),
 * 모바일·태블릿(<1024px)은 화면 하단 전폭 고정 바로 전환한다.
 *
 * 색: accent 토큰 + 차콜/그레이 + 흰색 + 카카오 노랑. 토큰이라 메인은 코랄,
 * /power 는 퍼플로 자동 렌더된다(.power-theme 스코프). 브랜드색 하드코딩은
 * 카카오 노랑(#FEE500)뿐이며, /power 에서는 .cta-kakao 가 퍼플로 덮어쓴다.
 *
 * 버튼 3종(워딩 고정): 카톡 상담 / 상담전화연결 / 무료 상담 신청.
 *  - 카톡: kakaoChannelUrl(새 탭)  - 전화: tel:  - 상담: 사이트별 폼 경로
 *  - 상담 도착지: /power → /power/consult, 메인 → site.cta.href(/#consult)
 * 데스크톱은 현행 그대로(메인은 상담 버튼 없이 2개, /power 는 3개)이고,
 * 모바일 바에서만 메인에도 상담 버튼(→ /#consult)을 노출해 3버튼을 맞춘다.
 *
 * prefers-reduced-motion 이면 스크롤 탑이 즉시 이동한다.
 */

// tel: 전화번호 — 실제 번호로 교체하려면 이 값만 수정.
const PHONE = "01021772720";
// 스크롤 탑 버튼이 나타나는 스크롤 기준(px) — 조절하려면 이 값만 수정.
const SCROLL_TOP_THRESHOLD = 300;

/* ── 아이콘 (데스크톱 스택·모바일 바 공용) ─────────────────── */
function KakaoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 3C6.48 3 2 6.48 2 11c0 2.5 1.36 4.73 3.5 6.19 0 .7-.35 1.9-.7 2.66-.12.26.09.53.36.46.02 0 .04-.01.06-.02 1.2-.5 2.44-1.06 3.02-1.4.86.2 1.77.31 2.7.31 5.52 0 10-3.48 10-8s-4.48-8-10-8z" />
    </svg>
  );
}
function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function ConsultIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" />
      <path d="M9 3h6v3H9zM8 11h6M8 15h4" />
      <path d="m16.5 8.5 4-4 2 2-4 4h-2z" />
    </svg>
  );
}
function ArrowUpIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const [reduced, setReduced] = useState(false);
  const pathname = usePathname();

  // 경로 → 서비스(service.ts). /power·/gumjung 은 전용 상담 폼을 가진 축.
  const service = serviceFromPath(pathname);
  const isPower = service === SERVICE.power;
  const isGumjung = service === SERVICE.gumjung;
  const isAxis = isPower || isGumjung;
  // 상담 도착지 — 축별 전용 폼(메인은 site.cta.href).
  const consultHref = isGumjung
    ? GUMJUNG_CONSULT_HREF
    : isPower
      ? POWER_CONSULT_HREF
      : site.cta.href;
  // 이미 해당 축 상담 폼 페이지면 상담 버튼을 다시 노출하지 않는다.
  const onAxisConsult = pathname === consultHref;

  // 데스크톱: 축(상담 폼 페이지 제외)에서만 상담 버튼 + 전화 아웃라인.
  const desktopConsult = isAxis && !onAxisConsult;
  // 모바일 바: 메인은 항상 상담 버튼, 축은 상담 폼 페이지에서만 숨김.
  const mobileConsult = isAxis ? !onAxisConsult : true;

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

  // 모바일 바 버튼 공통(세로: 아이콘 + 라벨). min-w-0 로 셀 축소 허용 → 가로 스크롤 방지.
  const barBtn =
    "flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <>
      {/* ════ 데스크톱(≥1024px): 현행 세로 플로팅 — 변경 없음 ════ */}
      <div className="fixed bottom-5 right-4 z-50 hidden flex-col items-end gap-3 sm:right-6 lg:flex">
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
          <ArrowUpIcon />
        </button>

        {/* 카톡 상담 — 항상 표시. 카카오 노랑(메인) / 퍼플(.power-theme). */}
        <a
          href={site.contact.kakaoChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="카카오톡으로 상담 문의"
          className="cta-kakao inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FEE500] px-5 font-semibold text-black shadow-lg transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <KakaoIcon />
          <span>카톡 상담</span>
        </a>

        {/* 상담전화연결 — 항상 표시. /power(상담 버튼 동반)에서는 아웃라인으로 위계 구분. */}
        <a
          href={`tel:${PHONE}`}
          aria-label="상담전화연결"
          className={`inline-flex min-h-12 items-center gap-2 rounded-full px-5 font-semibold shadow-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            desktopConsult
              ? "border-2 border-accent bg-white text-accent hover:bg-accent/5"
              : "bg-accent text-white hover:bg-accent-dark"
          }`}
        >
          <PhoneIcon />
          <span>상담전화연결</span>
        </a>

        {/* 무료 상담 신청 — 데스크톱은 /power 전용(현행 유지). 어학 폼(/power/consult)으로 이동. */}
        {desktopConsult && (
          <Link
            href={consultHref}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-white shadow-lg transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ConsultIcon />
            <span>{site.cta.label}</span>
          </Link>
        )}
      </div>

      {/* ════ 모바일·태블릿(<1024px): 스크롤 탑 — 하단 바 위에 뜸 ════ */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        style={{ opacity: showTop ? 1 : 0 }}
        className={`fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md transition-opacity duration-300 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden ${
          showTop ? "" : "pointer-events-none"
        }`}
      >
        <ArrowUpIcon className="h-5 w-5" />
      </button>

      {/* ════ 모바일·태블릿(<1024px): 하단 고정 상담 바 ════ */}
      <nav
        aria-label="상담 바로가기"
        className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-2xl items-stretch gap-2 px-3 py-2">
          {/* 카톡 상담 */}
          <a
            href={site.contact.kakaoChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="카카오톡으로 상담 문의"
            className={`cta-kakao ${barBtn} bg-[#FEE500] text-black hover:brightness-95`}
          >
            <KakaoIcon />
            <span className="whitespace-nowrap">카톡 상담</span>
          </a>

          {/* 상담전화연결 — 메인 코랄 solid / 어학 퍼플 아웃라인 */}
          <a
            href={`tel:${PHONE}`}
            aria-label="상담전화연결"
            className={`${barBtn} ${
              isAxis
                ? "border-2 border-accent bg-white text-accent hover:bg-accent/5"
                : "bg-accent text-white hover:bg-accent-dark"
            }`}
          >
            <PhoneIcon />
            <span className="whitespace-nowrap">상담전화연결</span>
          </a>

          {/* 무료 상담 신청 — 메인 차콜(진한 색·구분) / 어학 퍼플. 메인은 /#consult, 어학은 /power/consult. */}
          {mobileConsult && (
            <Link
              href={consultHref}
              aria-label={site.cta.label}
              className={`${barBtn} ${
                isAxis
                  ? "bg-accent text-white hover:bg-accent-dark"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              <ConsultIcon />
              <span className="whitespace-nowrap">{site.cta.label}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
