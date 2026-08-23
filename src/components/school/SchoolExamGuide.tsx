import type { SchoolExamGuide as GuideData } from "@/data/schoolExamGuide";

/*
 * SchoolExamGuide — 학교×과목 상세의 "내신·기출" 정보 섹션(서버 컴포넌트).
 * 고교 × 핵심5과목에서만 데이터가 만들어지며, 없으면(null) 라우트에서 미렌더.
 * 배치: 커리큘럼 뒤·최종 CTA 앞. 정보 탐색 의도("OO고 내신/기출") 수용용.
 */
export default function SchoolExamGuide({ guide }: { guide: GuideData }) {
  return (
    <section id="naesin-gichul" aria-labelledby="naesin-gichul-heading" className="scroll-mt-24">
      <h2
        id="naesin-gichul-heading"
        className="break-keep text-xl font-bold text-ink sm:text-2xl"
      >
        {guide.heading}
      </h2>
      <div className="mt-4 space-y-3">
        {guide.paragraphs.map((p, i) => (
          <p key={i} className="break-keep text-base leading-relaxed text-muted sm:text-lg">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
