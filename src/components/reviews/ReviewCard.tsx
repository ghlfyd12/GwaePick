import Stars from "./Stars";
import type { ReviewItem } from "@/data/reviewItems";

/*
 * ReviewCard — 후기 카드 1개. 제목 + 별점(★ + 숫자) + 본문.
 * 날짜(date)는 있을 때만 별점 아래에 작게 표시한다(없는 후기엔 가짜 날짜를 만들지 않음).
 */
export default function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <li className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="break-keep text-base font-bold text-ink sm:text-lg">
          {item.title}
        </h3>
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="flex items-center gap-1 text-sm font-semibold text-accent">
            <Stars value={item.rating} className="text-sm" />
            {item.rating.toFixed(1)}
          </span>
          {item.date && (
            <time dateTime={item.date} className="text-xs text-muted">
              {item.date}
            </time>
          )}
        </span>
      </div>
      <p className="mt-2 break-keep text-sm leading-relaxed text-muted">
        {item.body}
      </p>
    </li>
  );
}
