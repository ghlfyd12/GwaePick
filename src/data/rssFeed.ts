/**
 * RSS 피드(/rss.xml) 항목별 발행일(pubDate) 소스.
 *
 * pubDate 는 런타임 현재 시각(new Date())이 아니라 여기 고정된 날짜를 쓴다.
 * → 크롤러가 "언제 갱신됐는지" 신호를 항목별 고정값으로 받는다(요청마다 바뀌지 않음).
 * 콘텐츠를 실제로 보강하면 해당 항목의 날짜만 이 파일에서 갱신한다.
 * 날짜는 ISO 8601 문자열. RFC 822 변환(pubDate 출력)은 toRfc822 로 수행.
 */

/**
 * 실제 최근 개편 시점을 모르는 항목의 기본 기준일.
 * 사이트 구축 시점(첫 커밋 2026-06-19)을 기준일로 둔다 — 실제 개편 시 항목별로 갱신할 것.
 */
export const RSS_DEFAULT_DATE = "2026-06-19T00:00:00Z";

/**
 * 정적 섹션 항목 발행일(항목 path 기준). 없으면 RSS_DEFAULT_DATE.
 * 해당 섹션을 실제로 개편하면 그 path 의 날짜만 갱신한다.
 */
export const rssStaticDates: Record<string, string> = {
  "/": RSS_DEFAULT_DATE,
  "/teachers": RSS_DEFAULT_DATE,
  "/tutoring/by-school": RSS_DEFAULT_DATE,
  "/tutoring/by-region": RSS_DEFAULT_DATE,
  "/tutoring/by-subject": RSS_DEFAULT_DATE,
};

/**
 * 지역(/[id]) 항목 발행일(지역 id 기준). 비어 있으면 전부 RSS_DEFAULT_DATE.
 * 특정 지역 랜딩을 개편하면 { "gangnam": "2026-08-01T00:00:00Z" } 처럼 그 지역만 추가·갱신.
 */
export const rssRegionDates: Record<string, string> = {};

/** ISO 8601 → RFC 822(RSS pubDate) 문자열. 예: "Fri, 19 Jun 2026 00:00:00 GMT". */
export function toRfc822(iso: string): string {
  return new Date(iso).toUTCString();
}
