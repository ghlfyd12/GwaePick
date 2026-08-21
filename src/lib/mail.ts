/**
 * 상담 문의 운영자 메일 알림 — Resend REST(fetch) 발송(신규).
 *
 * POST /api/inquiries 성공(Supabase 저장 + Notion 기록) 뒤에 1통 발송한다.
 * 리드 유실 방지가 우선이므로 이 모듈은 **어떤 경우에도 throw 하지 않는다**
 * (호출부는 await 만 하면 되고 try/catch 불필요). 실패·미설정은 서버 로그로만 남긴다.
 *
 * 필요한 환경변수(값은 Vercel/.env.local 에만, 코드·로그·저장소 노출 금지):
 *   - RESEND_API_KEY : Resend API 키(시크릿, 필수)
 *   - MAIL_TO        : 수신 메일 주소(운영자, 필수). 도메인 미인증 시 Resend 계정 이메일과 동일해야 도달.
 *   - MAIL_FROM      : 발신 주소(선택). 미설정 시 onboarding@resend.dev 기본 발신.
 * 키/MAIL_TO 미설정이면 조용히 skip(로그만) — Notion 미설정 폴백과 동일.
 *
 * 개인정보 취급: 이름·연락처는 **메일 본문에만** 담고, 로그에는 절대 남기지 않는다
 *   (실패 시 inquiry_id 와 에러 유형/상태코드만 기록).
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "onboarding@resend.dev";

/** 수업 형태 코드 → 표시 라벨. */
const LESSON_LABEL: Record<string, string> = {
  visit: "방문",
  remote: "화상",
  any: "무관",
};

export type InquiryNotification = {
  inquiryId: number;
  name: string;
  phone: string;
  regionName: string;
  schoolLabel: string;
  grades: string[];
  subjectNames: string[];
  /** 수업 형태 코드(visit/remote/any). */
  lessonType: string;
  /** 문의 본문(주소·태그 제외한 사용자 입력). */
  memo: string;
  /** 주소 텍스트(도로명/지번 + 상세). */
  address: string;
  /** 유입 표기(utm_source 또는 referrer). */
  inflow: string;
  /** 신청 시각(서버). */
  submittedAt: Date;
};

/** 신청일시 KST 표기. */
function formatKst(d: Date): string {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

/**
 * 운영자에게 새 상담 신청 메일 1통 발송. throw 없음(실패 완전 흡수).
 * 미설정 시 skip. 실패 시 inquiry_id·상태만 로깅(개인정보 미출력).
 */
export async function sendInquiryNotification(
  p: InquiryNotification,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.MAIL_TO;
  if (!apiKey || !to) {
    console.log("[inquiries] 메일 알림 skip(RESEND_API_KEY/MAIL_TO 미설정)");
    return;
  }
  const from = process.env.MAIL_FROM || DEFAULT_FROM;

  const lesson = LESSON_LABEL[p.lessonType] ?? p.lessonType;
  const subject = `[지식의참견] 새 상담 신청 — ${p.name} · ${p.regionName}`;
  const text = [
    "새 상담 신청이 접수되었습니다.",
    `· 이름: ${p.name}`,
    `· 연락처: ${p.phone}`,
    `· 지역: ${p.regionName}`,
    `· 학교: ${p.schoolLabel}`,
    `· 학년: ${p.grades.join(", ") || "-"}`,
    `· 희망 과목: ${p.subjectNames.join(", ") || "-"}`,
    `· 수업 형태: ${lesson}`,
    `· 문의내용: ${p.memo || "-"}`,
    `· 주소: ${p.address || "-"}`,
    `· 유입: ${p.inflow || "-"}`,
    `· 신청일시: ${formatKst(p.submittedAt)}`,
  ].join("\n");

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) {
      // 상태코드만 기록(응답 본문·개인정보 미출력).
      console.error("[inquiries] 메일 알림 실패", {
        inquiry_id: p.inquiryId,
        status: res.status,
      });
    }
  } catch (err) {
    console.error("[inquiries] 메일 알림 오류", {
      inquiry_id: p.inquiryId,
      error: err instanceof Error ? err.name : "unknown",
    });
  }
}
