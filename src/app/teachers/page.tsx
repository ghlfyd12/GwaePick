import type { Metadata } from "next";
import Image from "next/image";
import TeacherPool from "@/components/TeacherPool";
import { site } from "@/data/site";

/*
 * 교사진 서브페이지 — /teachers
 *
 * 메인 랜딩에 있던 "검증된 선생님 / 우리 아이를 맡길 선생님들" 전체 그리드를 이 페이지로 이전.
 * 페이지 상단에 h1 헤더(페이지당 1개)를 두고, 그 아래 <TeacherPool withHeader={false} /> 로
 * 과목 필터 + 더보기 그리드를 렌더한다. 헤더/푸터/플로팅 CTA 는 루트 layout 에서 상속.
 */

const TITLE = "교사진";
const DESCRIPTION =
  "지식의참견과 함께하는 검증된 선생님 44명 — 국어·영어·수학·사회·과학·코딩 1:1 과외.";

export const metadata: Metadata = {
  // 루트 layout 의 title.template(%s | 지식의참견) 적용 → "교사진 | 지식의참견"
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/teachers" },
  openGraph: {
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/teachers",
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    // 루트 openGraph 를 덮어쓰므로 공유 이미지를 함께 지정(미상속 보완)
    images: [site.ogImage],
  },
};

export default function TeachersPage() {
  return (
    <>
      {/* 상단 히어로 — 좌: 텍스트 / 우: 단체사진(모바일은 사진 위·텍스트 아래). 오버레이 없음. 유일한 h1 */}
      <section className="px-5 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* 왼쪽 — 텍스트(모바일 가운데 / 데스크톱 왼쪽 정렬) */}
          <div className="order-2 break-keep text-center md:order-1 md:text-left">
            <p className="text-base font-semibold uppercase tracking-widest text-accent md:text-lg">
              검증된 선생님
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-snug text-ink sm:text-4xl">
              우리 아이를 맡길 선생님들
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              국어·영어·수학·사회·과학부터 코딩까지 —<br />
              직접 가르쳐 본 선생님이 실력과 성향을 보고 함께하는 선생님들입니다.
            </p>
          </div>

          {/* 오른쪽 — 교사 단체사진(고정 비율, 인물 균형) */}
          <div className="relative order-1 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-line md:order-2">
            <Image
              src="/images/teachers-hero.jpg"
              alt="지식의참견 선생님들"
              fill
              priority
              sizes="(min-width: 768px) 512px, 100vw"
              className="object-cover object-center"
              // 개발 서버 이미지 최적화 이슈 회피. 배포 시 최적화를 원하면 제거.
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* 과목 필터 + 카드 그리드 + 더보기 (헤더는 위에서 별도로 노출하므로 숨김) */}
      <TeacherPool withHeader={false} />
    </>
  );
}
