import type { Metadata } from "next";
import HeroSearch from "@/components/HeroSearch";
import CategoryLanding from "@/components/CategoryLanding";
import { schoolLevels } from "@/data/categories";

const INTRO =
  "초등·중등·고등, 우리 아이 단계에 꼭 맞는 1:1 과외를 안내해 드립니다.";

export const metadata: Metadata = {
  title: "학교별 1:1 과외", // 루트 template → "학교별 1:1 과외 | 지식의참견"
  description: INTRO,
  alternates: { canonical: "/tutoring/by-school" },
};

export default function BySchoolPage() {
  return (
    <>
      <HeroSearch
        eyebrow="학교별"
        headlineLines={["우리 아이 학교에 맞춘", "단계별", "1:1 맞춤 과외"]}
        subCopyLines={[INTRO]}
        searchKind="school"
        searchLabel="학교 빠르게 검색"
        searchPlaceholder="학교 빠르게 검색 (예: ○○중학교, ○○고등학교)"
        searchEmptyMessage="학교 데이터 준비 중입니다. 상담에서 학교별 내신·기출을 함께 준비해 드립니다."
      />
      <CategoryLanding
        hideHeader
        eyebrow="학교별"
        title="학교별 1:1 과외"
        intro={INTRO}
        items={schoolLevels}
      />
    </>
  );
}
