import type { LanguageCase } from "@/data/languageCases";

/*
 * CaseCard — 검색용 학습사례 카드 1개. [카테고리 칩] + [연령/학년 칩] + 한 줄 문구.
 * 별점·날짜·실명·후기 인용 없음. 코랄 포인트는 카테고리 칩 테두리에만.
 * className: 그룹의 "더 보기" 접힘 상태에서 hidden 클래스를 얹어 DOM 은 유지(크롤링 가능).
 */
export default function CaseCard({
  item,
  className = "",
}: {
  item: LanguageCase;
  className?: string;
}) {
  return (
    <li
      className={`flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 ${className}`}
    >
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex break-keep rounded-full border border-accent/40 px-2.5 py-0.5 text-xs font-semibold text-accent">
          {item.category}
        </span>
        <span className="inline-flex break-keep rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-muted">
          {item.ageGroup}
        </span>
      </div>
      <p className="break-keep text-sm leading-relaxed text-ink">{item.text}</p>
    </li>
  );
}
