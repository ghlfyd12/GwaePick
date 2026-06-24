import SelectReasons from "@/components/sections/SelectReasons";
import TutorQuality from "@/components/sections/TutorQuality";
import ReviewCardCarousel from "@/components/ReviewCardCarousel";
import ConsultForm from "@/components/ConsultForm";
import { reviewCards } from "@/data/reviewCards";

/*
 * DetailTrustBlock — 지역별/학교별/과목별 공통 상세 신뢰 블록.
 * 순서: 3가지 이유 → 선생님 자질·역량(+상담 이미지) → 합격·성장 후기 캐러셀 → 체험 수업 신청 폼.
 * 후기 데이터가 0개면 캐러셀은 숨김. 폼은 기존 ConsultForm 재사용(id="consult" — 이 블록을 쓰는
 * 세 탭에는 다른 consult 폼이 없어 중복 없음). 모든 탭이 동일 블록 재사용(워딩은 detailCopy.ts).
 */
export default function DetailTrustBlock() {
  return (
    <>
      <SelectReasons />
      <TutorQuality />
      {reviewCards.length > 0 && <ReviewCardCarousel />}
      {/* 후기 직후 전환 동선 — 기존 체험 수업 신청 폼 재사용 */}
      <ConsultForm />
    </>
  );
}
