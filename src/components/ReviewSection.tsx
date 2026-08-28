import Link from "next/link";
import type { ReviewItem } from "@/data/reviewItems";

/*
 * ReviewSection — 학교·과목·지역 상세에 매칭 후기(reviewItems) 본문 전문을 노출(공용).
 *
 * 목적: "유성고 수학과외" 등 검색어 매칭 — 후기 본문 텍스트가 SSR/SSG HTML 에 그대로 실린다.
 * 규칙: 매칭 0건이면 렌더하지 않는다(빈 섹션·placeholder 금지). 코랄 포인트(text-accent),
 *   느낌표 없음, break-keep, 390px 무스크롤. 합격 캐러셀(reviewCards)·DetailTrustBlock 과 병행.
 */
export default function ReviewSection({
  reviews,
  heading,
}: {
  reviews: ReviewItem[];
  heading: string;
}) {
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="matched-reviews-heading" className="mx-auto max-w-3xl">
      <h2
        id="matched-reviews-heading"
        className="break-keep text-2xl font-bold text-ink sm:text-3xl"
      >
        {heading}
      </h2>
      <ul className="mt-6 space-y-4">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="break-keep text-sm font-bold text-accent sm:text-base">
                {r.title}
              </span>
              <span aria-label={`별점 ${r.rating}점`} className="text-sm text-accent">
                ★ {r.rating.toFixed(1)}
              </span>
              <span className="break-keep text-xs text-muted sm:text-sm">
                {r.grade} · {r.subject}
              </span>
            </div>
            <p className="mt-3 break-keep text-sm leading-relaxed text-ink/90 sm:text-base">
              {r.body}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <Link
          href="/reviews"
          className="inline-flex min-h-11 items-center break-keep rounded-full border border-accent/50 px-5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
        >
          전체 후기 보기
        </Link>
      </div>
    </section>
  );
}
