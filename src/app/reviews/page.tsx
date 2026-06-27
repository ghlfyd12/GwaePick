import type { Metadata } from "next";
import ReviewsClient from "@/components/reviews/ReviewsClient";
import { REVIEW_COUNT } from "@/data/reviewItems";

/*
 * 후기 — /reviews. 평점 요약 배너 + 과목/학년 필터 + 후기 카드 리스트.
 * 데이터는 reviewItems.ts(평점·건수 상수 그대로). 본문 UI 는 ReviewsClient(클라이언트).
 * 헤더/푸터/플로팅 CTA 는 루트 layout 에서 상속. h1 은 ReviewsClient 안에 1개.
 */
export const metadata: Metadata = {
  title: "수업 후기",
  description: `직접 가르쳐 온 선생님이 1:1로 연결한 ${REVIEW_COUNT}건의 학부모 후기. 과목·학년별로 우리 아이와 비슷한 사례를 찾아보세요.`,
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
