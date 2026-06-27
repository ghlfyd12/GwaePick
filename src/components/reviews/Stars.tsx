/*
 * Stars — 평점(0~5)을 별 5개로 표시. 같은 "★★★★★" 두 줄을 겹쳐, 위 줄을 비율(%)만큼만
 * 보이게 잘라 부분 채움을 표현한다. 색은 props 로 받아 배너(흰색)·카드(코랄) 모두 재사용.
 * 순수 시각 요소(aria-hidden) — 숫자 평점을 옆에 함께 노출하므로 접근성은 그 텍스트가 담당.
 */
export default function Stars({
  value,
  baseClass = "text-line",
  fillClass = "text-accent",
  className = "",
}: {
  value: number;
  baseClass?: string;
  fillClass?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      aria-hidden
      className={`relative inline-block select-none whitespace-nowrap leading-none ${className}`}
    >
      <span className={baseClass}>★★★★★</span>
      <span
        className={`absolute left-0 top-0 overflow-hidden ${fillClass}`}
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}
