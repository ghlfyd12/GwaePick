/**
 * UTM 캡처 유틸 — first-touch 기준(클라이언트 전용).
 *
 * 최초 진입 시 URL 쿼리의 UTM 5종 + document.referrer 를 sessionStorage 에 한 번 저장한다.
 * 이미 저장돼 있으면 덮어쓰지 않는다(랜딩 후 내부 이동해도 최초 유입 채널 유지 = first-touch).
 * sessionStorage 라 브라우저/탭 종료 시 초기화된다(과도한 추적 방지).
 *
 * 값 정제: trim + 최대 200자. 그 외 변형·해석은 하지 않는다.
 * 폼 제출 시 getUtm() 으로 읽어 payload 에 실어 보낸다(폼 UI 에는 노출하지 않음).
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmData = Record<UtmKey, string> & { referrer: string };

const STORAGE_KEY = "utm_params";
const MAX_LEN = 200;

/** trim 후 최대 200자로 자른다. null/undefined 는 빈 문자열. */
function clean(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, MAX_LEN);
}

/** 빈 UTM 레코드(직접 방문 등). */
function emptyUtm(): UtmData {
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    referrer: "",
  };
}

/**
 * 최초 진입 시 1회 캡처. 이미 저장돼 있으면 아무것도 하지 않는다(first-touch).
 * UTM 이 전혀 없어도 최초 방문으로 기록한다(referrer 는 있으면 함께 저장).
 * 이후 UTM 을 달고 재진입해도 최초 값을 유지한다.
 */
export function captureUtm(): void {
  if (typeof window === "undefined") return;
  try {
    // 이미 최초 유입이 기록돼 있으면 유지(덮어쓰지 않음).
    if (window.sessionStorage.getItem(STORAGE_KEY) !== null) return;

    const params = new URLSearchParams(window.location.search);
    const data = emptyUtm();
    for (const key of UTM_KEYS) data[key] = clean(params.get(key));
    data.referrer = clean(document.referrer);

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* 프라이빗 모드 등 sessionStorage 접근 불가 시 조용히 무시 */
  }
}

/** 저장된 최초 유입 값을 읽는다. 없으면 빈 값. 제출 payload 조립용. */
export function getUtm(): UtmData {
  if (typeof window === "undefined") return emptyUtm();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyUtm();
    const parsed = JSON.parse(raw) as Partial<UtmData>;
    const out = emptyUtm();
    for (const key of UTM_KEYS) out[key] = clean(parsed[key]);
    out.referrer = clean(parsed.referrer);
    return out;
  } catch {
    return emptyUtm();
  }
}
