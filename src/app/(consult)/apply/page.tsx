import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  fetchRegionOptions,
  fetchSubjectOptions,
  type SidoOption,
  type SubjectOption,
} from "@/lib/inquiryOptions";
import ApplyForm from "./ApplyForm";

/*
 * 과외 신청폼(/apply) — 정식 리드 창구.
 *
 * 서버 컴포넌트가 선택지(지역·과목)를 Supabase 에서 읽어 클라이언트 폼에 넘긴다.
 * 브라우저는 Supabase 를 직접 호출하지 않는다(RLS 로 anon 접근 차단).
 * 제출은 POST /api/inquiries, 학교 자동완성은 GET /api/schools/search 를 쓴다.
 * 선택지 로딩(fetchRegionOptions/fetchSubjectOptions)은 lib/inquiryOptions 에 모아 홈과 공유한다.
 *
 * 하루 한 번만 다시 만든다(12,000여 행을 매 요청 훑지 않도록).
 */

export const revalidate = false;

export const metadata: Metadata = {
  title: "과외 신청",
  description:
    "직접 가르쳐 온 상담 선생님이 지역·학교·과목에 맞는 선생님을 1:1로 연결해 드립니다. 신청은 무료입니다.",
  alternates: { canonical: "/apply" },
  // 2-B: 정식 리드 창구로 공개 전환 — 일반 색인 허용(noindex 제거).
};

export default async function ApplyPage() {
  let regions: SidoOption[] = [];
  let subjects: SubjectOption[] = [];
  let loadFailed = false;

  if (!isSupabaseConfigured()) {
    loadFailed = true;
  } else {
    try {
      [regions, subjects] = await Promise.all([
        fetchRegionOptions(),
        fetchSubjectOptions(),
      ]);
    } catch (err) {
      // 선택지를 못 읽어도 페이지 자체는 뜬다(안내 문구로 대체).
      console.error("[apply] 선택지 로딩 실패:", (err as Error)?.message);
      loadFailed = true;
    }
  }

  return (
    <div className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            과외 신청
          </h1>
          <p className="mt-3 text-base text-muted sm:text-lg">
            직접 가르쳐 온 상담 선생님이 신청 내용을 먼저 살펴본 뒤, 지역과 학교
            상황에 맞는 선생님을 1:1로 연결해 드립니다. 신청과 상담은 무료입니다.
          </p>
        </header>

        {loadFailed ? (
          <p
            role="status"
            className="rounded-lg border border-line bg-white p-6 text-base text-muted"
          >
            신청에 필요한 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <ApplyForm regions={regions} subjects={subjects} />
        )}
      </div>
    </div>
  );
}
