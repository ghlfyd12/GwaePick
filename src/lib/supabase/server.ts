/**
 * Supabase 서버 전용 클라이언트(service role) — 단일 소스.
 *
 * ⚠️ service role 키는 RLS 를 우회한다. 이 모듈은 절대 클라이언트 번들에 들어가면 안 되며,
 *    "server-only" import 가 그것을 빌드 타임에 강제한다(클라이언트에서 import 시 빌드 실패).
 *
 * supabase-setup.sql 기준으로 모든 테이블에 RLS 가 켜져 있고 정책이 없다.
 *   → anon 키로는 아무 것도 읽히지 않으므로, DB 접근은 반드시 이 클라이언트(=API Route)를 거친다.
 *
 * 환경변수: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (.env.local · Vercel).
 * 값이 없으면 모듈 로드 시점이 아니라 호출 시점에 던진다(빌드·프리렌더가 키 없이도 통과하도록).
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    // 키 값은 절대 로그·에러 메시지에 넣지 않는다(존재 여부만).
    throw new Error(
      `SUPABASE_NOT_CONFIGURED (url=${url ? "있음" : "없음"}, serviceRole=${
        serviceRoleKey ? "있음" : "없음"
      })`,
    );
  }

  _client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/** 환경변수가 모두 있는지 — 라우트가 500 을 내려주기 전에 확인용. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
