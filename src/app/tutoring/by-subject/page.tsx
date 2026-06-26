import type { Metadata } from "next";
import HeroSearch from "@/components/HeroSearch";
import CategoryLanding from "@/components/CategoryLanding";
import { subjects } from "@/data/categories";

const INTRO =
  "국어·영어·수학·사회·과학·역사·논술·코딩까지, 과목별로 가장 잘 맞는 선생님과 1:1로 시작하세요.";

export const metadata: Metadata = {
  title: "과목별 1:1 과외", // 루트 template → "과목별 1:1 과외 | 지식의참견"
  description: INTRO,
  alternates: { canonical: "/tutoring/by-subject" },
};

export default function BySubjectPage() {
  return (
    <>
      <HeroSearch
        eyebrow="과목별"
        headlineLines={["우리 아이 과목에 맞춘", "집중 관리", "1:1 맞춤 과외"]}
        subCopyLines={[INTRO]}
        searchKind="subject"
        searchLabel="과목 빠르게 검색"
        searchPlaceholder="과목 빠르게 검색 (예: 수학, 영어, 역사, 논술)"
      />
      <CategoryLanding
        hideHeader
        eyebrow="과목별"
        title="과목별 1:1 과외"
        intro={INTRO}
        items={subjects}
      />
    </>
  );
}
