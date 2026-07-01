import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

/*
 * 무료 상담 신청 수신(POST /api/consult) → 노션 DB 실시간 저장.
 *
 * 프런트(ConsultForm)가 보내는 본문: { name, phone, grades[], subjects[], address, addressDetail, message, agree }.
 * 노션 "지식의 참견 - 실시간 과외 상담 접수 현황" DB(scripts/setup-notion.ts 로 생성)에 한 행으로 삽입한다.
 * 환경변수(NOTION_API_KEY / NOTION_DATABASE_ID)는 .env.local 에서 읽는다.
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

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/** 문자열 → 노션 rich_text(내용 없으면 빈 배열, 2000자 제한 대비 자름). */
const richText = (content: string) =>
  content ? [{ type: "text" as const, text: { content: content.slice(0, 2000) } }] : [];

/** 문자열 배열 → 노션 multi_select 값(빈 값 제거). */
const multiSelect = (values: unknown) =>
  (Array.isArray(values) ? values : [])
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((name) => ({ name }));

export async function POST(request: Request) {
  let data: ConsultPayload;
  try {
    data = (await request.json()) as ConsultPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
  }

  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!process.env.NOTION_API_KEY || !databaseId) {
    console.error("[consult] Notion 환경변수 누락(NOTION_API_KEY / NOTION_DATABASE_ID)");
    return NextResponse.json(
      { ok: false, error: "SERVER_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const name = (data.name ?? "").trim();
  const phone = (data.phone ?? "").trim();
  const region = [data.address, data.addressDetail]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const message = (data.message ?? "").trim();
  // 유입페이지 — 폼을 제출한 페이지(Referer). 폼 수정 없이 서버에서 확보.
  const referer = request.headers.get("referer") ?? "";

  try {
    const page = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        이름: { title: richText(name || "(이름 미입력)") },
        연락처: { phone_number: phone || null },
        지역: { rich_text: richText(region) },
        학년: { multi_select: multiSelect(data.grades) },
        과목: { multi_select: multiSelect(data.subjects) },
        문의내용: { rich_text: richText(message) },
        유입페이지: { rich_text: richText(referer) },
        "상담 상태": { select: { name: "신규" } },
      },
    });

    return NextResponse.json({ ok: true, id: page.id });
  } catch (err) {
    // Notion 오류 상세는 서버 로그로만(개인정보·키 노출 방지).
    console.error("[consult] Notion 저장 실패:", err);
    return NextResponse.json(
      { ok: false, error: "NOTION_INSERT_FAILED" },
      { status: 502 },
    );
  }
}
