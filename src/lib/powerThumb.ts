/**
 * /power(어학의참견)·/gumjung(검고의참견) 동적 썸네일 URL 단일 소스.
 *
 * 라우트는 `/api/power-thumb/{kind}/{region}/{item}[/{버전}]`(catch-all). 버전은 **경로 세그먼트**다.
 * 예전에는 `?v=8` 쿼리로 캐시를 무효화했는데, 2026-09 어학 축 실측에서 페이지는 재크롤됐는데도
 * 썸네일만 구버전(v7 이전 CTA바)이 계속 노출됐다 — 쿼리 버전은 일부 크롤러·중간 캐시가 무시한다.
 * 그래서 버전을 경로로 올려 URL 자체를 새 리소스로 만든다. 산출물(디자인)은 v8 그대로다.
 *
 * 구 URL(`…/{item}` · `…/{item}?v=8`)도 라우트가 계속 200 으로 응답한다 — 이미 색인된 참조를
 * 깨뜨리지 않기 위해서다. 새로 내보내는 메타·본문은 전부 이 모듈의 빌더만 쓴다.
 */

/**
 * og URL 경로 버전 — 썸네일 산출물이 실제로 바뀔 때만 올린다(캐시 무효화 목적).
 * **축마다 따로 올린다**: 2026-10 어학 2종은 텍스트형 회귀로 v10, 검고 6종은 키워드 축소(v9 → v11)로 각각 따로 올렸다. 검고는
 * 배치·뱃지는 v8 그대로고 키워드줄 문구만 짧아졌다. 바뀌지 않은 축의 버전을 같이 올리면 내용 변경이
 * 없는 URL 을 새로 통지하게 된다(IndexNow 남용).
 */
export const POWER_THUMB_VERSION_LANG = "v10";
export const POWER_THUMB_VERSION_GUMJUNG = "v11";

/** kind — 어학 2종 + 검고 6종 = 8종(라우트 resolveContent 와 1:1). */
export type PowerThumbKind =
  | "exam"
  | "conversation"
  | "gumjung-subject"
  | "gumjung-region"
  | "gumjung-level"
  | "gumjung-guide"
  | "gumjung-age"
  | "gumjung-schedule";

/** 썸네일 경로(상대 — metadataBase 로 절대화). region 은 한글 slug 가 올 수 있어 항상 인코딩한다. */
export function powerThumbPath(
  kind: PowerThumbKind,
  region: string,
  item: string,
): string {
  const v =
    kind === "exam" || kind === "conversation"
      ? POWER_THUMB_VERSION_LANG
      : POWER_THUMB_VERSION_GUMJUNG;
  return `/api/power-thumb/${kind}/${encodeURIComponent(region)}/${item}/${v}`;
}

/** 정사각(1:1) 변형 — 비율만 쿼리로 가른다(라우트 `?r=sq`). */
export function powerThumbSq(path: string): string {
  return `${path}?r=sq`;
}

/** og 1.91:1 규격. */
export const POWER_THUMB_SIZE = { width: 1200, height: 630 } as const;
/** 정사각 규격. */
export const POWER_THUMB_SQ_SIZE = { width: 1080, height: 1080 } as const;
