import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";

/*
 * 학교명 자동완성 — GET /api/schools/search?q=검색어
 *
 * 신청폼(/apply)의 학교 입력에서만 호출한다. 브라우저는 Supabase 를 직접 호출하지 않고
 * 반드시 이 라우트를 경유한다(schools 는 RLS 로 anon 접근이 차단돼 있다).
 *
 * 규칙: 2글자 미만이면 빈 배열, school_name ILIKE 부분일치, 최대 10건.
 */

export const runtime = "nodejs";
/** 검색어마다 결과가 달라지므로 캐시하지 않는다. */
export const dynamic = "force-dynamic";

const MIN_QUERY_LENGTH = 2;
const LIMIT = 10;

/** ILIKE 와일드카드(%, _)와 이스케이프 문자를 무력화한다. */
function sanitize(q: string): string {
  return q.replace(/[\\%_]/g, " ").trim().slice(0, 40);
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const q = sanitize(raw);

  // 2글자 미만은 조회하지 않는다(전체 스캔 방지).
  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ schools: [] });
  }

  if (!isSupabaseConfigured()) {
    console.error("[schools/search] Supabase 환경변수 누락");
    return NextResponse.json({ error: "SERVER_NOT_CONFIGURED" }, { status: 500 });
  }

  const { data, error } = await supabaseServer()
    .from("schools")
    .select("school_code, school_name, school_level, sido_name, sigungu_name")
    .ilike("school_name", `%${q}%`)
    .order("school_name")
    .limit(LIMIT);

  if (error) {
    // 검색어는 개인정보가 아니지만, 로그에는 오류 메시지만 남긴다.
    console.error("[schools/search] 조회 실패:", error.message);
    return NextResponse.json({ error: "SEARCH_FAILED" }, { status: 502 });
  }

  return NextResponse.json({ schools: data ?? [] });
}
