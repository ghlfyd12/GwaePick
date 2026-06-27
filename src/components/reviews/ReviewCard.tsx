import Stars from "./Stars";
import type { ReviewItem } from "@/data/reviewItems";

/*
 * ReviewCard — 후기 카드 1개. 제목 + 별점(★ + 숫자) + 본문.
 * 날짜는 데이터에 없으므로 표시하지 않는다(없는 정보 생성 금지).
 */
export default function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <li className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="break-keep text-base font-bold text-ink sm:text-lg">
          {item.title}
        </h3>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">
          <Stars value={item.rating} className="text-sm" />
          {item.rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-2 break-keep text-sm leading-relaxed text-muted">
        {item.body}
      </p>
    </li>
  );
}
