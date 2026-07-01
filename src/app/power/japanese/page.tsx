import type { Metadata } from "next";
import LanguageDetail from "@/components/LanguageDetail";
import { buildLanguageMetadata } from "@/data/languageDetail";

/*
 * /power/japanese — 어학의참견 일본어 상세.
 * 공용 템플릿(LanguageDetail) + languageDetail.ts 데이터로 렌더. 헤더/폼은 상속·재사용.
 */
export const metadata: Metadata = buildLanguageMetadata("japanese");

export default function PowerJapanesePage() {
  return <LanguageDetail slug="japanese" />;
}
