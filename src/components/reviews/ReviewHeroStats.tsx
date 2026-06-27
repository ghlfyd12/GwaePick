import Stars from "./Stars";
import { REVIEW_AVG, REVIEW_COUNT } from "@/data/reviewItems";

/*
 * ReviewHeroStats — 상단 평점 요약 배너(코랄 그라데이션).
 * 평점·건수는 reviewItems.ts 의 REVIEW_AVG·REVIEW_COUNT 상수를 그대로 사용(하드코딩 금지).
 */
export default function ReviewHeroStats() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-dark px-6 py-8 text-center text-white shadow-md sm:py-10">
      <p className="text-5xl font-bold leading-none sm:text-6xl">
        {REVIEW_AVG.toFixed(2)}
      </p>
      <Stars
        value={REVIEW_AVG}
        baseClass="text-white/35"
        fillClass="text-white"
        className="mt-3 text-2xl sm:text-3xl"
      />
      <p className="mt-3 break-keep text-sm font-medium text-white/90 sm:text-base">
        {REVIEW_COUNT}건의 학부모 후기
      </p>
    </div>
  );
}
