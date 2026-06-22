import type { Metadata } from "next";
import CategoryLanding from "@/components/CategoryLanding";
import { subjects } from "@/data/categories";

const INTRO =
  "국어·영어·수학·사회·과학·코딩까지, 과목별로 가장 잘 맞는 선생님과 1:1로 시작하세요.";

export const metadata: Metadata = {
  title: "과목별 1:1 과외", // 루트 template → "과목별 1:1 과외 | 지식의참견"
  description: INTRO,
  alternates: { canonical: "/tutoring/by-subject" },
};

export default function BySubjectPage() {
  return (
    <CategoryLanding
      eyebrow="과목별"
      title="과목별 1:1 과외"
      intro={INTRO}
      items={subjects}
    />
  );
}
