import type { Metadata } from "next";
import LanguageDetail from "@/components/LanguageDetail";
import { buildLanguageMetadata } from "@/data/languageDetail";

/*
 * /power/chinese — 어학의참견 중국어 상세.
 * 공용 템플릿(LanguageDetail) + languageDetail.ts 데이터로 렌더. 헤더/폼은 상속·재사용.
 */
export const metadata: Metadata = buildLanguageMetadata("chinese");

export default function PowerChinesePage() {
  return <LanguageDetail slug="chinese" />;
}
