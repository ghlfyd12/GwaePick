import { NextResponse } from "next/server";
import { insertConsultLead, type ConsultLead } from "@/lib/notion";

/*
 * 무료 상담 신청 수신(POST /api/consult) → 노션 DB 실시간 저장.
 *
 * 프런트(ConsultForm)가 보내는 본문: { name, phone, grades[], subjects[], address, addressDetail, message, agree }.
 * 노션 "지식의 참견 - 실시간 상담 접수 대장" DB 에 한 행으로 삽입한다(속성 매핑은 src/lib/notion.ts).
 * 환경변수(NOTION_API_KEY / NOTION_DATABASE_ID)는 .env.local(로컬)·Vercel(운영)에서 읽는다.
 *
 * 오류 처리: 노션 에러의 code·message·body 를 서버 로그로 남기고,
 *   개발 환경에서만 응답 JSON 에 debug 필드로 code·message 를 담는다(운영 응답엔 상세 미노출).
 */

export const runtime = "nodejs";

type ConsultPayload = {
  name?: string;
  phone?: string;
  grades?: string[];
  subjects?: string[];
  address?: string;
  addressDetail?: string;
  message?: string;
  agree?: boolean;
};

const isDev = process.env.NODE_ENV !== "production";
/** 키 전문은 절대 로깅하지 않는다 — 존재 여부 + 앞 4글자만. */
const head4 = (v?: string) => (v ? `${v.slice(0, 4)}…(len ${v.length})` : "(없음)");

export async function POST(request: Request) {
  // 1) 환경변수 존재 검사(키 전문 미출력).
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!apiKey || !databaseId) {
    console.error(
      "[consult] 환경변수 누락 — 노션에 저장할 수 없습니다.",
      `NOTION_API_KEY=${head4(apiKey)}`,
      `NOTION_DATABASE_ID=${databaseId ? `${databaseId.slice(0, 8)}…` : "(없음)"}`,
    );
    return NextResponse.json(
      { ok: false, error: "SERVER_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  // 2) 본문 파싱.
  let data: ConsultPayload;
  try {
    data = (await request.json()) as ConsultPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
  }

  // 3) 리드 구성 — 주소 + 상세주소를 "지역" 한 칸으로 결합. 유입페이지는 Referer 에서 확보.
  const lead: ConsultLead = {
    name: (data.name ?? "").trim(),
    phone: (data.phone ?? "").trim(),
    region: [data.address, data.addressDetail]
      .map((v) => (v ?? "").trim())
      .filter(Boolean)
      .join(" "),
    grades: Array.isArray(data.grades) ? data.grades : [],
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    message: (data.message ?? "").trim(),
    source: request.headers.get("referer") ?? "",
  };

  // 4) 노션 삽입(속성 로깅·재시도는 lib/notion.ts 내부에서 처리).
  try {
    const page = await insertConsultLead(databaseId, lead);
    return NextResponse.json({ ok: true, id: page.id });
  } catch (err) {
    // 노션 에러 상세를 서버 로그로 드러낸다(삼키지 않는다).
    const e = err as { code?: string; status?: number; message?: string; body?: unknown };
    console.error("[consult] Notion 저장 실패:", {
      code: e?.code,
      status: e?.status,
      message: e?.message,
      body: e?.body,
    });
    // 리드 유실 방지 — 저장 실패 시 리드를 서버 로그로 남겨 복구 가능하게 한다.
    // (별도 텔레그램/이메일 알림 채널이 없어, 최소한 로그로 보존한다.)
    console.error("[consult] 저장 실패 리드(복구용):", JSON.stringify(lead));

    return NextResponse.json(
      {
        ok: false,
        error: "NOTION_INSERT_FAILED",
        // 개발 환경에서만 디버그 노출(운영 응답엔 상세 미포함).
        ...(isDev ? { debug: { code: e?.code, message: e?.message } } : {}),
      },
      { status: 502 },
    );
  }
}
