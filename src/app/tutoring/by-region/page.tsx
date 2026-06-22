import type { Metadata } from "next";
import CategoryLanding from "@/components/CategoryLanding";
import { regions } from "@/data/categories";

const INTRO =
  "우리 동네에서 시작하는 1:1 과외. 현재 대치·목동을 시작으로 점차 확대하고 있습니다.";

export const metadata: Metadata = {
  title: "지역별 1:1 과외", // 루트 template → "지역별 1:1 과외 | 지식의참견"
  description: INTRO,
  alternates: { canonical: "/tutoring/by-region" },
};

export default function ByRegionPage() {
  return (
    <CategoryLanding
      eyebrow="지역별"
      title="지역별 1:1 과외"
      intro={INTRO}
      items={regions}
      note="그 외 지역도 상담 가능합니다."
    />
  );
}
