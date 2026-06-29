import type { Metadata } from "next";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import { site } from "@/data/site";
import {
  powerRegionSlugs,
  resolvePowerRegionName,
} from "@/data/powerRegions";

/*
 * /power/[region] — 파워 홈페이지 지역별 영어회화 동적 상세(pSEO).
 *
 * [지역명 + 영어 회화] 검색 유입 획득용. 파라미터(한글/로마자/시군구 id)를
 * resolvePowerRegionName 으로 표시용 지역명으로 해석한 뒤 타이틀·본문에 녹인다.
 * 헤더·푸터·플로팅 CTA 는 루트 layout 에서 자동 상속한다.
 *
 * 정적 생성: powerRegionSlugs(경기 동 + 그 외 자치구)만 미리 빌드하고,
 * 그 외 임의 지역(예: 신림동·역삼동)은 dynamicParams 로 요청 시 렌더한다.
 */

export const dynamicParams = true;

type Params = { region: string };

export function generateStaticParams(): Params[] {
  return powerRegionSlugs.map((region) => ({ region }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { region } = await params;
  const name = resolvePowerRegionName(region);

  const title = `${name} 영어 회화 과외 추천 - 1:1 맞춤 원어민/교포 선생님 매칭 | 지식의 참견`;
  const description = `학원을 다녀도 입이 떨어지지 않았다면 문제는 방법이 아닌 선생님입니다. ${name} 인근 방문 및 온라인 1:1 영어 회화 전문 과외. 검증된 선생님 상담 신청하기.`;
  const canonical = `/power/${encodeURIComponent(region)}`;

  return {
    // 레이아웃 title.template 중복을 피하려 absolute 로 고정(요청 타이틀 그대로).
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ko_KR",
      siteName: site.name,
      url: canonical,
      images: [site.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [site.ogImage],
    },
  };
}

const CONSULT_ANCHOR = "#consult";

export default async function PowerRegionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { region } = await params;
  const name = resolvePowerRegionName(region);

  // 지역명을 자연스럽게 녹인 본문 블록(데이터로 분리하기보다 변수 보간이 핵심이라 페이지에 둠).
  const learnerLines = [
    {
      title: "직장인 비즈니스 영어",
      body: `회의·이메일·발표에서 바로 쓰는 표현부터, ${name} 인근 방문 또는 온라인으로 일정에 맞춰 수업합니다.`,
    },
    {
      title: "왕초보 생활 회화",
      body: `알파벳·발음이 막막한 분도 입이 트일 때까지, 한 문장씩 직접 말해 보며 ${name}에서 천천히 시작합니다.`,
    },
    {
      title: "학생 스피킹·시험",
      body: `내신 수행평가부터 말하기 시험까지, ${name} 학생의 수준과 목표에 맞춰 선생님을 매칭합니다.`,
    },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="power-region-heading"
        className="border-b border-line bg-surface px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            지역별 1:1 영어 회화
          </p>

          <h1
            id="power-region-heading"
            className="mt-3 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight"
          >
            <span className="text-accent">{name}</span> 영어 회화 과외
            <span className="block text-xl font-semibold text-muted sm:text-2xl">
              - 지식의 참견
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            학원을 다녀도 입이 떨어지지 않았다면, 문제는 방법이 아니라
            선생님입니다. <span className="font-semibold text-ink">{name}</span>
            에서 직장인 비즈니스 영어, 주부 왕초보 회화, 학생 스피킹 시험까지
            호흡이 딱 맞는 선생님을 직접 매칭해 드립니다.
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label}
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {["방문·온라인 모두 가능", "원어민·교포 선생님", "무료 체험·교체 무료"].map(
              (badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-1.5 break-keep text-sm font-semibold text-ink"
                >
                  <CheckIcon />
                  {badge}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      {/* ── 지역 맞춤 본문 ───────────────────────────────────────── */}
      <section
        aria-labelledby="power-region-detail-heading"
        className="px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="power-region-detail-heading"
            className="break-keep text-2xl font-bold text-ink sm:text-3xl"
          >
            {name}에서 이렇게 도와드립니다
          </h2>
          <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {name} 인근 방문 수업과 온라인 수업을 모두 운영합니다. 직접 가르쳐 온
            상담 선생님이 먼저 수준을 확인하고, 목표에 가장 잘 맞는 선생님을
            연결해 드립니다.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {learnerLines.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <h3 className="break-keep text-base font-bold text-ink sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl bg-surface-alt p-6 sm:p-8">
            <h3 className="break-keep text-lg font-bold text-ink sm:text-xl">
              왜 {name}에서 1:1 매칭일까요
            </h3>
            <p className="mt-3 break-keep text-sm leading-relaxed text-muted sm:text-base">
              같은 교재라도 누구에게 배우느냐에 따라 결과가 달라집니다. 진도만
              나가는 수업 대신, {name}의 생활 반경과 일정에 맞춰 말하기 양을
              채우는 수업으로 설계합니다. 한 번 수업해 보고 맞지 않으면 선생님
              교체도 부담 없이 도와드립니다.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {name} 영어 회화 상담 신청 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 상담 폼(#consult) — 기존 공통 컴포넌트 재사용 ─────────── */}
      <ConsultForm
        defaultMessage={`${name} 영어 회화 과외 상담 문의드립니다.`}
      />
    </>
  );
}

/* ── 아이콘 ──────────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-accent"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
