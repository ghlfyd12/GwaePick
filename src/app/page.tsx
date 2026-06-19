import CTAButton from "@/components/ui/CTAButton";
import Hero from "@/components/sections/Hero";
import Curriculum from "@/components/sections/Curriculum";
import WhyUs from "@/components/sections/WhyUs";
import TeacherIntro from "@/components/sections/TeacherIntro";
import Teachers from "@/components/sections/Teachers";
import TeacherPool from "@/components/TeacherPool";
import { site } from "@/data/site";

/*
 * 메인 랜딩.
 * Hero 섹션은 실제 구현 완료. Curriculum / Proof / Consult 는 다음 작업에서 진행.
 *
 * 각 섹션은 #앵커 목적지로서의 자리만 잡아 둔다.
 * h1 은 페이지당 1개 규칙에 따라 Hero 섹션에만 둔다.
 */
export default function Home() {
  return (
    <>
      {/* Hero — 페이지 유일의 h1 (헤드라인) */}
      <Hero />

      {/* 성적대별 1:1 맞춤 커리큘럼 */}
      <Curriculum />

      {/* 지식의참견이 다른 이유 (숫자 띠 + 강점 블록 5개) */}
      <WhyUs />

      {/* 선생님 소개 인트로 (좌 사진 · 우 텍스트) — 교사진 섹션 바로 위 */}
      <TeacherIntro />

      {/* 전문 선생님 소개 (검증된 교사진 카드) */}
      <Teachers />

      {/* 후기 & 성장 스토리 */}
      <section
        id="proof"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-2 border-t border-line bg-surface px-4 py-20 text-center"
      >
        <h2 className="text-xl font-bold text-ink sm:text-2xl">
          후기 &amp; 성장 스토리
        </h2>
        <p className="text-muted">다음 작업에서 구현</p>
      </section>

      {/* 소속 선생님 소개 (실제 44명 + 과목 필터) — 후기와 상담 폼 사이 */}
      <TeacherPool />

      {/* 무료 상담 신청 폼 — 모든 CTA 의 앵커 목적지(#consult) */}
      <section
        id="consult"
        className="flex min-h-[60vh] flex-col items-center justify-center gap-5 border-t border-line bg-primary px-4 py-20 text-center text-white"
      >
        <h2 className="text-xl font-bold sm:text-2xl">무료 상담 신청 폼</h2>
        <p className="text-white/80">다음 작업에서 구현</p>
        <CTAButton href={site.cta.href} size="lg">
          {site.cta.label}
        </CTAButton>
      </section>
    </>
  );
}
