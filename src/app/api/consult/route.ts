import { NextResponse } from "next/server";

/*
 * 무료 상담 신청 수신 골격(POST /api/consult).
 *
 * 현재는 본문을 파싱해 서버 콘솔에 로그만 남기고 { ok: true } 를 반환한다.
 * 실제 리드 전송(이메일/구글시트/CRM 등)은 다음 단계에서 연동한다.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 서버 콘솔 로그(개발 확인용). 개인정보이므로 운영에선 안전한 저장소로만 보낼 것.
    console.log("[consult] 새 상담 신청:", data);

    // TODO: 리드 전송 연동(이메일/시트). 예) 메일 발송, 구글시트 append, CRM webhook 등.

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[consult] 처리 실패:", err);
    return NextResponse.json(
      { ok: false, error: "INVALID_REQUEST" },
      { status: 400 },
    );
  }
}
