import { XMLParser } from "fast-xml-parser";

/**
 * 네이버 블로그 RSS 수집·파싱(서버 전용).
 *
 * - RSS URL 은 환경변수 NAVER_BLOG_RSS_URL (예: https://rss.blog.naver.com/{블로그아이디}.xml).
 * - fetch 는 ISR 캐시(next.revalidate)로 주기 갱신 — 매 요청 fetch 금지(성능·차단 회피).
 * - 원문 전체를 저장·노출하지 않는다. 요약(태그 제거 후 앞부분)과 원문 링크·썸네일만 추출.
 * - 실패(미설정·네트워크·파싱)하면 빈 배열 반환 + 에러 로깅 → 호출부에서 섹션 숨김/폴백.
 */

export const NAVER_BLOG_RSS_URL = process.env.NAVER_BLOG_RSS_URL ?? "";
/** ISR 갱신 주기(초) — 기본 3시간. */
export const BLOG_REVALIDATE_SECONDS = 60 * 60 * 3;
/** 요약 최대 길이(글자). */
const SUMMARY_MAX = 140;

export type BlogPost = {
  title: string;
  /** 네이버 원문 링크(새 탭). */
  link: string;
  /** ISO 발행일(정렬·datetime 속성용). */
  date: string;
  /** 표시용 날짜 "2026.07.13". */
  dateLabel: string;
  /** HTML 제거 + 100~150자 요약(원문 복제 아님). */
  summary: string;
  /** 썸네일 이미지 URL(없으면 null). */
  thumbnail: string | null;
};

/** RSS 블로그 홈 URL 유도(https://rss.blog.naver.com/{id}.xml → https://blog.naver.com/{id}). */
export function naverBlogHomeUrl(): string | null {
  const m = NAVER_BLOG_RSS_URL.match(/rss\.blog\.naver\.com\/([^./]+)\.xml/i);
  return m ? `https://blog.naver.com/${m[1]}` : null;
}

const decodeEntities = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** HTML 태그·엔티티 제거 후 공백 정리. */
const stripHtml = (html: string) =>
  decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

/** description 안 첫 이미지 src(썸네일). */
const firstImgSrc = (html: string): string | null => {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
};

const clamp = (s: string, max = SUMMARY_MAX) =>
  s.length <= max ? s : s.slice(0, max).trimEnd() + "…";

function formatDate(pubDate: string): { iso: string; label: string } {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return { iso: "", label: "" };
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    iso: d.toISOString(),
    label: `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`,
  };
}

type RawItem = {
  title?: unknown;
  link?: unknown;
  description?: unknown;
  pubDate?: unknown;
};

/** 최신 블로그 글을 limit 개까지 반환. 실패 시 빈 배열(폴백). */
export async function getBlogPosts(limit = 30): Promise<BlogPost[]> {
  if (!NAVER_BLOG_RSS_URL) return [];
  try {
    const res = await fetch(NAVER_BLOG_RSS_URL, {
      // ISR — 응답을 BLOG_REVALIDATE_SECONDS 동안 캐시(매 요청 재fetch 금지).
      next: { revalidate: BLOG_REVALIDATE_SECONDS },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; jisikchamgyeon-blog)" },
    });
    if (!res.ok) {
      console.error(`[blogFeed] RSS 응답 오류 ${res.status} ${NAVER_BLOG_RSS_URL}`);
      return [];
    }
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: true, trimValues: true });
    const data = parser.parse(xml) as {
      rss?: { channel?: { item?: RawItem | RawItem[] } };
    };
    const raw = data?.rss?.channel?.item;
    const items: RawItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

    return items
      .slice(0, limit)
      .map((it): BlogPost => {
        const descRaw = String(it.description ?? "");
        const { iso, label } = formatDate(String(it.pubDate ?? ""));
        // 원문 링크에서 fromRss 추적 파라미터 제거(정규화). 원문 자체는 유지.
        const link = String(it.link ?? "").split("?")[0];
        return {
          title: stripHtml(String(it.title ?? "")),
          link,
          date: iso,
          dateLabel: label,
          summary: clamp(stripHtml(descRaw)),
          thumbnail: firstImgSrc(descRaw),
        };
      })
      .filter((p) => p.title && p.link.startsWith("http"));
  } catch (err) {
    console.error("[blogFeed] RSS 수집/파싱 실패:", err);
    return [];
  }
}
