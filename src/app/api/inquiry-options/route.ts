import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { fetchRegionOptions, fetchSubjectOptions } from "@/lib/inquiryOptions";

/*
 * 신청폼 선택지(지역·과목) 런타임 제공 — GET /api/inquiry-options
 *
 * /apply·홈 #consult 는 서버 렌더에서 선택지를 구워 폼에 주입한다(빠른 happy path).
 * 그러나 두 페이지는 정적(revalidate=false)이라, 빌드 시점에 Supabase 가 잠시 죽어 있으면
 * "불러오지 못함" 상태가 그대로 구워져 재배포 전까지 폼이 사라진다(2026-11-03 장애의 원인).
 *
 * 이 라우트는 폼이 런타임에 선택지를 보강하도록 한다 — 구운 시드가 비어 있어도 ApplyForm 이
 * 이 엔드포인트로 live Supabase 에서 선택지를 받아 스스로 채운다. 제출·검증 경로는 무변경
 * (같은 lib/inquiryOptions 단일 소스를 공유하므로 코드가 서버 검증과 항상 일치한다).
 */

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    console.error("[inquiry-options] Supabase 환경변수 누락");
    return NextResponse.json({ error: "SERVER_NOT_CONFIGURED" }, { status: 500 });
  }

  try {
    const [regions, subjects] = await Promise.all([
      fetchRegionOptions(),
      fetchSubjectOptions(),
    ]);
    return NextResponse.json(
      { regions, subjects },
      {
        // 선택지는 거의 바뀌지 않는다 — Vercel CDN 에서 1시간 캐시(+SWR 하루)로 Supabase 부하·지연 최소화.
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    console.error("[inquiry-options] 선택지 로딩 실패:", (err as Error)?.message);
    return NextResponse.json({ error: "OPTIONS_FAILED" }, { status: 502 });
  }
}
