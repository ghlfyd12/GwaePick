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
      {/* 상단 히어로 — 단체 사진 위에 헤더 문구 오버레이(유일한 h1) */}
      <section className="px-4 pt-10 sm:px-6 sm:pt-12">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-2xl shadow-md ring-1 ring-line">
          <Image
            src="/images/teachers-hero.jpg"
            alt="지식의참견 선생님들 단체 사진"
            width={1024}
            height={677}
            priority
            sizes="(min-width: 1180px) 1180px, 100vw"
            className="h-auto w-full"
            // 개발 서버 이미지 최적화 이슈 회피. 배포 시 최적화를 원하면 제거.
            unoptimized
          />

          {/* 가독성용 상단 스크림 + 텍스트 레이어(가로 가운데·세로 상단) */}
          <div className="absolute inset-0 flex flex-col items-center justify-start break-keep bg-gradient-to-b from-black/55 via-black/20 to-transparent px-5 pt-10 text-center sm:px-8 md:pt-14">
            <p className="text-base font-semibold uppercase tracking-widest text-accent md:text-lg">
              검증된 선생님
            </p>
            <h1 className="mt-1.5 text-2xl font-bold text-white drop-shadow-md sm:mt-2 md:text-4xl">
              우리 아이를 맡길 선생님들
            </h1>
            <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-relaxed text-white/90 drop-shadow md:mt-3 md:text-base">
              국어·영어·수학·사회·과학부터 코딩까지 —<br />
              직접 가르쳐 본 선생님이 실력과 성향을 보고 함께하는 선생님들입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 과목 필터 + 카드 그리드 + 더보기 (헤더는 위에서 별도로 노출하므로 숨김) */}
      <TeacherPool withHeader={false} />
    </>
  );
}
