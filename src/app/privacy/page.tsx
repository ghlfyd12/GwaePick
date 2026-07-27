import type { Metadata } from "next";
import { site } from "@/data/site";

/*
 * 개인정보처리방침(/privacy) — 초안.
 *
 * ⚠️ 아래 문구는 초안이며, 최종 문구·보유 기간·문의처는 운영자가 확정한다.
 *    보유 기간은 임시로 "1년"으로 두었고, 문의처는 placeholder 다.
 *    확정 시 이 파일의 해당 항목만 교체하면 된다(구조 변경 불필요).
 *
 * 공개 페이지이므로 noindex 를 걸지 않는다. 신청폼(/apply) 동의 문구에서 새 탭으로 연결된다.
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
  "지역(시/도·시/군/구)",
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
              상담 완료 후 1년간 보관한 뒤 지체 없이 파기합니다. 관계 법령에 따라
              보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
            <p className="mt-2 text-sm text-muted">
              (보유 기간은 초안이며 운영자 확정 후 갱신됩니다.)
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
            <p>
              개인정보 처리에 관한 문의는 아래로 접수할 수 있습니다.
            </p>
            <p className="mt-2 text-muted">
              (문의처 정보는 운영자 확정 후 기재됩니다.)
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
