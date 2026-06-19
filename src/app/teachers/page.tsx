import type { Metadata } from "next";
import TeacherPool from "@/components/TeacherPool";
import { site } from "@/data/site";

/*
 * 교사진 서브페이지 — /teachers
 *
 * 메인 랜딩에 있던 "검증된 선생님 / 우리 아이를 맡길 선생님들" 전체 그리드를 이 페이지로 이전.
 * 페이지 상단에 h1 헤더(페이지당 1개)를 두고, 그 아래 <TeacherPool withHeader={false} /> 로
 * 과목 필터 + 더보기 그리드를 렌더한다. 헤더/푸터/플로팅 CTA 는 루트 layout 에서 상속.
 */

const TITLE = "교사진";
const DESCRIPTION =
  "지식의참견과 함께하는 검증된 선생님 44명 — 국어·영어·수학·사회·과학·코딩 1:1 과외.";

export const metadata: Metadata = {
  // 루트 layout 의 title.template(%s | 지식의참견) 적용 → "교사진 | 지식의참견"
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/teachers" },
  openGraph: {
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/teachers",
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
  },
};

export default function TeachersPage() {
  return (
    <>
      {/* 페이지 헤더 — 유일한 h1 */}
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          검증된 선생님
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold leading-snug text-ink sm:text-4xl">
          우리 아이를 맡길 선생님들
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          국어·영어·수학·사회·과학부터 코딩까지 — 직접 가르쳐 본 선생님이 실력과
          성향을 보고 함께하는 선생님들입니다.
        </p>
      </section>

      {/* 과목 필터 + 카드 그리드 + 더보기 (헤더는 위에서 별도로 노출하므로 숨김) */}
      <TeacherPool withHeader={false} />
    </>
  );
}
