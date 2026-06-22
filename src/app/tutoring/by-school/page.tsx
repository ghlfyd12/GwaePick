import type { Metadata } from "next";
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
    <CategoryLanding
      eyebrow="학교별"
      title="학교별 1:1 과외"
      intro={INTRO}
      items={schoolLevels}
    />
  );
}
