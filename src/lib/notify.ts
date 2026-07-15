import type { ConsultLead } from "@/lib/notion";

/*
 * 새 상담 리드 운영자 알림 — 첫 줄에 서비스명 표기: "[어학의참견] 새 상담 신청" / "[지식의참견] 새 상담 신청".
 *
 * - Notion 저장 성공 이후에 호출한다(저장 → 알림 순서. 리드 유실 방지).
 * - 알림 실패는 삼켜서 사용자 응답/성공 화면에 영향 주지 않는다.
 * - TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID 가 설정돼 있으면 텔레그램으로 전송, 없으면 서버 로그로 보존.
 *   (별도 알림 채널이 아직 없어 로그 폴백. 채널 추가 시 이 함수만 확장.)
 */
export async function notifyNewLead(lead: ConsultLead): Promise<void> {
  const text = [
    `[${lead.service}] 새 상담 신청`,
    `이름: ${lead.name || "(미입력)"}`,
    `연락처: ${lead.phone || "(미입력)"}`,
    `학년: ${lead.grades.join(", ") || "-"}`,
    `희망과목: ${lead.subjects.join(", ") || "-"}`,
    `주소: ${lead.region || "-"}`,
    `문의: ${lead.message ? lead.message.slice(0, 200) : "-"}`,
  ].join("\n");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      });
      if (res.ok) return;
      console.error("[notify] 텔레그램 전송 실패", res.status);
    } catch (err) {
      console.error("[notify] 텔레그램 오류:", err);
    }
  }
  // 텔레그램 미설정/실패 → 서버 로그로 보존(운영자 확인·복구 가능).
  console.log(`[notify]\n${text}`);
}
