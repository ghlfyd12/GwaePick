import type { Metadata } from "next";
import LanguageDetail from "@/components/LanguageDetail";
import { buildLanguageMetadata } from "@/data/languageDetail";

/*
 * /power/english — 어학의참견 영어 상세.
 * 공용 템플릿(LanguageDetail) + languageDetail.ts 데이터로 렌더. 헤더/폼은 상속·재사용.
 * ([region] 동적 라우트와의 슬러그 충돌을 피하려 정적 라우트로 둔다 — 정적이 우선.)
 */
export const metadata: Metadata = buildLanguageMetadata("english");

export default function PowerEnglishPage() {
  return <LanguageDetail slug="english" />;
}
