import SelectReasons from "@/components/sections/SelectReasons";
import TutorQuality from "@/components/sections/TutorQuality";
import ReviewCardCarousel from "@/components/ReviewCardCarousel";
import { reviewCards } from "@/data/reviewCards";

/*
 * DetailTrustBlock — 지역별/학교별/과목별 공통 상세 신뢰 블록.
 * 순서: 3가지 이유 → 선생님 자질·역량(+상담 이미지) → 합격·성장 후기 캐러셀.
 * 후기 데이터가 0개면 캐러셀은 숨김. 모든 탭이 동일 블록을 재사용(워딩은 detailCopy.ts).
 */
export default function DetailTrustBlock() {
  return (
    <>
      <SelectReasons />
      <TutorQuality />
      {reviewCards.length > 0 && <ReviewCardCarousel />}
    </>
  );
}
