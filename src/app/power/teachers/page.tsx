import type { Metadata } from "next";

/*
 * /power/teachers — 어학의참견 교사진(빈 카테고리).
 *
 * 메인 /teachers(지식의참견 교사진 44명)와 완전히 분리된 /power 전용 라우트다.
 * 제목·섹션 래퍼만 두고 내부는 비운다(teachers.ts import·렌더 없음 → 메인 영향 0).
 * 내용은 이후 별도 구축. 더미/플레이스홀더/안내문구는 넣지 않는다.
 * 헤더(어학의참견)·푸터·플로팅 CTA 는 루트 layout 에서 상속(/power/* → 어학 변형).
 */
export const metadata: Metadata = {
  title: "교사진",
  alternates: { canonical: "/power/teachers" },
};

export default function PowerTeachersPage() {
  return (
    <section
      aria-labelledby="power-teachers-heading"
      className="mx-auto min-h-[40vh] max-w-5xl px-5 py-14 sm:px-6 sm:py-20"
    >
      <h1
        id="power-teachers-heading"
        className="break-keep text-3xl font-bold text-ink sm:text-4xl"
      >
        교사진
      </h1>
      {/* 내부 콘텐츠 비움 — 어학의참견 교사진은 이후 별도 구축(더미 없음). */}
      <div className="mt-8" />
    </section>
  );
}
