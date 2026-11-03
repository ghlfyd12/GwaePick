import type { Metadata } from "next";
import Image from "next/image";
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

  // 선택지를 서버에서 미리 구워 두면 폼이 즉시 쓰인다(happy path). 빌드 시점에 Supabase 가
  // 잠시 죽어 시드가 비어 와도 폼은 그대로 렌더하고, ApplyForm 이 런타임에
  // /api/inquiry-options 로 보강한다(2026-11-03 정적 폴백 영구 고착 재발 방지).
  if (isSupabaseConfigured()) {
    try {
      [regions, subjects] = await Promise.all([
        fetchRegionOptions(),
        fetchSubjectOptions(),
      ]);
    } catch (err) {
      console.error("[apply] 선택지 빌드 로딩 실패(런타임 보강 예정):", (err as Error)?.message);
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

        {/* 상담 자리 사진 — 신청 폼 바로 위. 생성 인물 컷 대신 실제 상담 테이블. */}
        <div className="mb-8 overflow-hidden rounded-2xl ring-1 ring-line">
          <Image
            src="/images/trust/trust-02-consult.webp"
            alt="상담 테이블에 마주 놓인 찻잔 두 잔과 상담 노트"
            width={1600}
            height={1067}
            sizes="(min-width: 672px) 672px, 100vw"
            className="h-auto w-full"
          />
        </div>

        <ApplyForm regions={regions} subjects={subjects} />
      </div>
    </div>
  );
}
