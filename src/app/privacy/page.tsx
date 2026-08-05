import type { Metadata } from "next";
import { site } from "@/data/site";

/*
 * 개인정보처리방침(/privacy).
 *
 * 공개 페이지이므로 noindex 를 걸지 않는다. 신청폼(/apply·홈 #consult) 동의 문구에서
 * 새 탭으로 연결된다. 문의처는 site.ts 의 카카오톡 채널 링크를 단일 소스로 쓴다.
 */

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "지식의참견이 무료 상담 신청 시 수집하는 개인정보의 항목과 목적, 보유 기간, 이용자 권리를 안내합니다.",
  alternates: { canonical: "/privacy" },
};

/** 수집 항목 — /apply 신청폼 필드와 일치. */
const COLLECTED = [
  "이름",
  "연락처",
  "주소(시/도·시/군/구·상세주소)",
  "학교",
  "학년",
  "희망 과목",
  "상담 내용",
];

export default function PrivacyPage() {
  return (
    <div className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <main className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">
          개인정보처리방침
        </h1>
        <p className="mt-3 text-base text-muted">
          {site.name}은 무료 상담 신청을 위해 아래와 같이 개인정보를 수집·이용합니다.
        </p>

        <div className="mt-8 space-y-8">
          <Section title="1. 수집하는 개인정보 항목">
            <ul className="list-disc space-y-1 pl-5">
              {COLLECTED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-muted">
              상담 내용은 신청자가 직접 적는 선택 항목으로, 입력하지 않아도 신청할 수 있습니다.
            </p>
          </Section>

          <Section title="2. 수집·이용 목적">
            <p>
              과외 상담 진행과 신청 내용에 맞는 선생님 연결을 위해 수집한 정보를
              이용합니다. 이 밖의 목적으로는 이용하지 않습니다.
            </p>
          </Section>

          <Section title="3. 보유 및 이용 기간">
            <p>
              수집일로부터 1년간 보관한 뒤 지체 없이 파기합니다. 관계 법령에 따라
              보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </Section>

          <Section title="4. 처리 위탁">
            <p>수집한 개인정보의 처리를 외부에 위탁하지 않습니다.</p>
          </Section>

          <Section title="5. 동의를 거부할 권리와 불이익">
            <p>
              신청자는 개인정보 수집·이용 동의를 거부할 수 있습니다. 다만 동의가
              없으면 상담 신청과 선생님 연결이 이루어지지 않습니다.
            </p>
          </Section>

          <Section title="6. 문의처">
            <p>개인정보 처리에 관한 문의는 아래 카카오톡 채널로 접수할 수 있습니다.</p>
            <p className="mt-2">
              <a
                href={site.contact.kakaoChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                카카오톡 채널로 문의하기
              </a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
      <div className="mt-2 space-y-2 text-base leading-relaxed text-ink">
        {children}
      </div>
    </section>
  );
}
