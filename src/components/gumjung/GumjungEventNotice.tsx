import { GUMJUNG_EVENT_NOTICE } from "@/data/gumjung/eventNotice";

/*
 * 검고 이벤트 안내 배너 — 청록 accent(.gumjung-theme 스코프에서 렌더). 과장·느낌표 없음.
 * active=false 면 렌더하지 않는다. 노출 위치: /gumjung 허브·/gumjung/consult 상담폼 인근.
 */
export default function GumjungEventNotice({ className = "" }: { className?: string }) {
  if (!GUMJUNG_EVENT_NOTICE.active) return null;
  return (
    <div
      className={`mx-auto max-w-2xl break-keep rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 text-center ${className}`}
    >
      <p className="text-sm font-semibold text-ink sm:text-base">{GUMJUNG_EVENT_NOTICE.text}</p>
      <p className="mt-1 text-xs text-muted">{GUMJUNG_EVENT_NOTICE.fine}</p>
    </div>
  );
}
