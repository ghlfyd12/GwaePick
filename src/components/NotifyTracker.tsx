"use client";

import { useEffect, type RefObject } from "react";
import { NOTIFY_URL } from "@/data/site";

/**
 * 문의 알림(텔레그램) — 여러 사이트 공용 우체국(Cloudflare Worker, NOTIFY_URL)으로 신호만 보낸다. 봇 토큰은 우체국에만 있다.
 * 루트 레이아웃에 한 번 — 지식의참견·/power(어학의참견)·/gumjung(검고의참견) 모두에 들어간다(이름은 우체국이 경로로 나눈다).
 *  - 새 방문: 한 방문(탭 세션)에 한 번, 소리 없이 — 끄고 켜기는 우체국의 사이트 목록(visit)
 *  - 전화(tel:)·문자(sms:)·카카오톡 링크 클릭: 소리 있게, 같은 종류 3초 안 연속 클릭은 한 번만
 *  - 상담 신청: 폼이 저장 성공 뒤 notifyLead() 로 보내는 "gp:lead" 이벤트로만 — 학년·과목·지역(시·군·구까지)만.
 *    이름·연락처·주소·문의 내용은 넣지 않는다(운영자가 따로 정할 때까지).
 *  - 폼 열기: 상담 폼이 화면에 처음 들어온 순간 한 번(useFormOpenNotice) — 소리 없이.
 *    전화 클릭 / 폼 열기 / 폼 제출 세 지점으로 전환 깔때기를 본다. 측정 시작일 = MEASURE_SINCE.
 * 처음 도착한 페이지·유입·검색어는 첫 페이지를 여는 순간 기록한다(몇 초 뒤 다른 페이지로 넘어가도 광고 검색어가 남는다).
 * 로봇·미리보기·자동화 브라우저는 보내지 않는다. 실패해도 화면·신청에는 영향 없음.
 */
const BOT = /bot|crawl|spider|slurp|yeti|daum|bingpreview|facebookexternalhit|kakaotalk-scrap|whatsapp|telegrambot|preview|headless|lighthouse|pagespeed|gtmetrix/i;
const KEY_LANDING = "gp_notify_landing";
const KEY_VISIT = "gp_notify_visit";
const LEAD_EVENT = "gp:lead";
const FORM_OPEN_EVENT = "gp:form-open";
const KEY_FORM_OPEN = "gp_notify_form_open";

/** 전환 깔때기(전화 클릭·폼 열기·폼 제출) 측정 시작일 — 이전 수치와 섞어 보지 않기 위한 기준. */
export const MEASURE_SINCE = "2026-11-02";

export type NotifyLead = { grade: string; subject: string; area: string };

/** 상담폼 저장 성공 뒤에 부른다 — 학년·과목·지역만(이름·연락처·주소·문의 내용 넣지 않음) */
export function notifyLead(lead: NotifyLead) {
  try {
    window.dispatchEvent(new CustomEvent<NotifyLead>(LEAD_EVENT, { detail: lead }));
  } catch {
    // 알림 실패는 신청에 영향 없음
  }
}

/** 상담 폼이 화면에 처음 들어왔을 때 한 번 — 한 방문(탭 세션)에 한 번만 */
export function notifyFormOpen() {
  if (store(KEY_FORM_OPEN)) return;
  store(KEY_FORM_OPEN, "1");
  try {
    window.dispatchEvent(new Event(FORM_OPEN_EVENT));
  } catch {
    // 알림 실패는 신청에 영향 없음
  }
}

/** 상담 폼 요소가 화면에 들어오면 notifyFormOpen() 을 부른다. 지원 안 되는 브라우저는 조용히 건너뛴다. */
export function useFormOpenNotice(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          notifyFormOpen();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/** 도로명주소에서 시·도 + 시·군·구까지만("서울 강남구 테헤란로 1" → "서울 강남구") */
export function areaOf(address: string): string {
  const out: string[] = [];
  for (const t of address.trim().split(/\s+/)) {
    if (out.length < 3 && /(특별시|광역시|특별자치시|특별자치도|도|시|군|구)$/.test(t)) out.push(t);
    else break;
  }
  return out.join(" ");
}

function store(k: string, v?: string): string | null {
  try {
    if (v !== undefined) sessionStorage.setItem(k, v);
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
}

/** 처음 도착한 페이지·유입 경로·검색어(광고 꼬리표) — 세션 첫 페이지에서 한 번 기록 */
function firstTouch(): { landing: string; ref: string; keyword: string } {
  const saved = store(KEY_LANDING);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  const u = new URL(location.href);
  const keyword = u.searchParams.get("n_query") || u.searchParams.get("utm_term") || u.searchParams.get("query") || "";
  const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "";
  const v = { landing: location.href, ref, keyword };
  store(KEY_LANDING, JSON.stringify(v));
  return v;
}

function send(type: string, extra: Record<string, unknown> = {}) {
  if (!NOTIFY_URL || BOT.test(navigator.userAgent) || navigator.webdriver) return;
  const body = JSON.stringify({
    type,
    title: document.title,
    url: location.href,
    device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "pc",
    ...firstTouch(),
    ...extra,
  });
  // text/plain 은 미리 묻기(preflight) 없이 바로 간다. keepalive 로 페이지를 떠나도 보낸다.
  fetch(NOTIFY_URL, { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {});
}

export default function NotifyTracker() {
  useEffect(() => {
    if (!NOTIFY_URL) return;
    // 처음 도착한 페이지·유입·검색어는 첫 페이지가 열린 순간 바로 기록
    firstTouch();
    const last: Record<string, number> = {};
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const type = href.startsWith("tel:") ? "tel" : href.startsWith("sms:") ? "sms" : /kakao\.com|kakao\.co\.kr/.test(href) ? "kakao" : null;
      if (!type) return;
      const now = Date.now();
      if (now - (last[type] ?? 0) < 3000) return;
      last[type] = now;
      send(type);
    };
    const onLead = (e: Event) => send("form", { lead: (e as CustomEvent<NotifyLead>).detail });
    const onFormOpen = () => send("form_open");
    document.addEventListener("click", onClick, true);
    window.addEventListener(LEAD_EVENT, onLead);
    window.addEventListener(FORM_OPEN_EVENT, onFormOpen);

    // 새 방문 — 로딩이 끝나고 브라우저가 한가할 때 한 번
    const visit = () => {
      if (store(KEY_VISIT)) return;
      store(KEY_VISIT, "1");
      send("visit");
    };
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(visit, { timeout: 5000 }) : setTimeout(visit, 2000));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(LEAD_EVENT, onLead);
      window.removeEventListener(FORM_OPEN_EVENT, onFormOpen);
    };
  }, []);
  return null;
}
