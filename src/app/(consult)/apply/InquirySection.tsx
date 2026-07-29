import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  fetchRegionOptions,
  fetchSubjectOptions,
  type SidoOption,
  type SubjectOption,
} from "@/lib/inquiryOptions";
import { site } from "@/data/site";
import ApplyForm from "./ApplyForm";

/*
 * 무료 상담 신청 섹션(홈 #consult) — 표준 폼(ApplyForm)을 감싸는 서버 컴포넌트.
 *
 * 홈과 /apply 가 같은 폼(ApplyForm)을 공유한다(복제 없음). 이 컴포넌트는 홈에서 쓰며,
 * 선택지(지역·과목)를 Supabase 에서 읽어 폼에 주입한다. 제출은 표준 경로(POST /api/inquiries).
 *
 * ⚠️ id 는 기본값 "consult" — 블로그 등 외부 유입이 /#consult 로 도착하므로 절대 바꾸지 않는다.
 * 섹션 제목·안내 문구는 홈 기존 카피를 그대로 주입받는다. 전화·카톡 버튼도 기존 동선을 유지한다.
 */

export default async function InquirySection({
  id = "consult",
  eyebrow,
  titleTop,
  titleAccent,
  intro,
  successTitle,
  successBody,
}: {
  id?: string;
  eyebrow: string;
  titleTop: string;
  titleAccent: string;
  intro: string;
  successTitle?: string;
  successBody?: string;
}) {
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
      console.error("[consult] 선택지 로딩 실패:", (err as Error)?.message);
      loadFailed = true;
    }
  }

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-line bg-accent/5 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto w-full max-w-[600px] rounded-3xl bg-white p-6 shadow-md ring-1 ring-black/5 sm:p-9">
        <div className="text-center">
          <p className="text-sm font-semibold text-accent">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="mt-2 text-4xl font-bold leading-tight text-ink md:text-5xl"
          >
            {titleTop}
            <br />
            <span className="text-accent">{titleAccent}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted md:text-lg">
            {intro}
          </p>
        </div>

        {/* 전화 / 카카오 — 기존 홈 동선 유지. 전화 강조. */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`tel:${site.contact.phone}`}
            className="flex min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-accent bg-white px-3 py-3.5 text-accent transition-colors hover:bg-accent/5"
          >
            <PhoneIcon />
            <span className="whitespace-nowrap text-xl font-extrabold leading-none tracking-tight md:text-2xl">
              {site.contact.phone}
            </span>
          </a>
          <a
            href={site.contact.kakaoChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-kakao flex min-w-0 items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-3 py-3.5 text-base font-bold text-[#3C1E1E] transition-[filter] hover:brightness-95 sm:text-lg"
          >
            <ChatIcon />
            <span className="whitespace-nowrap">카톡 상담</span>
          </a>
        </div>

        <div className="mt-7">
          {loadFailed ? (
            <p
              role="status"
              className="rounded-lg border border-line bg-white p-6 text-center text-base text-muted"
            >
              신청에 필요한 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주시거나 전화로
              문의해 주세요.
            </p>
          ) : (
            <ApplyForm
              regions={regions}
              subjects={subjects}
              successTitle={successTitle}
              successBody={successBody}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.7 2.6-.8 3-.1.5.2.5.4.4.2-.1 2.6-1.8 3.7-2.5.7.1 1.4.2 2 .2 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
    </svg>
  );
}
