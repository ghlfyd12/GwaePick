import type { Metadata } from "next";

/*
 * /power/reviews — 어학의참견 수업후기(빈 카테고리).
 *
 * 메인 /reviews(reviewItems.ts 기반 후기)와 완전히 분리된 /power 전용 라우트다.
 * 제목·섹션 래퍼만 두고 내부는 비운다(reviewItems·reviewCards import·렌더 없음 → 메인 영향 0).
 * 내용은 이후 별도 구축. 더미/날조 후기/안내문구는 넣지 않는다.
 * 헤더(어학의참견)·푸터·플로팅 CTA 는 루트 layout 에서 상속(/power/* → 어학 변형).
 */
export const metadata: Metadata = {
  title: "수업후기",
  alternates: { canonical: "/power/reviews" },
};

export default function PowerReviewsPage() {
  return (
    <section
      aria-labelledby="power-reviews-heading"
      className="mx-auto min-h-[40vh] max-w-5xl px-5 py-14 sm:px-6 sm:py-20"
    >
      <h1
        id="power-reviews-heading"
        className="break-keep text-3xl font-bold text-ink sm:text-4xl"
      >
        수업후기
      </h1>
      {/* 내부 콘텐츠 비움 — 어학의참견 후기는 이후 별도 구축(더미/날조 없음). */}
      <div className="mt-8" />
    </section>
  );
}
