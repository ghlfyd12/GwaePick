import Hero from "@/components/sections/Hero";
import Curriculum from "@/components/sections/Curriculum";
import WhyUs from "@/components/sections/WhyUs";
import TeacherIntro from "@/components/sections/TeacherIntro";
import Teachers from "@/components/sections/Teachers";
import ReviewVideos from "@/components/ReviewVideos";
import InquirySection from "@/app/(consult)/apply/InquirySection";
import BlogSection from "@/components/blog/BlogSection";
import { site } from "@/data/site";
import { consultFormConfig } from "@/data/consultFormOptions";
import { SERVICE } from "@/data/service";

/*
 * 홈은 #consult 상담 섹션이 Supabase 선택지를 읽으므로 ISR 로 둔다.
 * 기존 블로그 섹션 revalidate(3시간)와 동일 창을 유지한다(선택지는 자주 바뀌지 않음).
 */
export const revalidate = false;

/*
 * 메인 페이지 구조화 데이터(JSON-LD) — 구글이 '지식의참견'을 교육 서비스(Organization)로 인지하도록.
 * 브랜드명·도메인·로고·소개는 site.ts 단일 소스에서 가져온다(중복/불일치 방지).
 * alternateName 으로 띄어쓴 '지식의 참견' 검색도 같은 브랜드로 묶는다.
 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: site.name,
  // 띄어쓴 표기와 영문 표기를 같은 브랜드로 묶는다(붙여쓰기는 위 name 이 담당).
  alternateName: ["지식의 참견", "gwae-pick"],
  url: site.url,
  logo: `${site.url}/icon.png`,
  description: site.description,
  // 서비스 제공 지역 — 국내 전역.
  areaServed: "KR",
};

/*
 * 메인 랜딩.
 * Hero 섹션은 실제 구현 완료. Curriculum / Proof / Consult 는 다음 작업에서 진행.
 *
 * 각 섹션은 #앵커 목적지로서의 자리만 잡아 둔다.
 * h1 은 페이지당 1개 규칙에 따라 Hero 섹션에만 둔다.
 */
export default function Home() {
  return (
    <>
      {/* 구조화 데이터(Organization) — 검색 로봇용. 화면에는 보이지 않는다. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Hero — 페이지 유일의 h1 (헤드라인) */}
      <Hero />

      {/* 성적대별 1:1 맞춤 커리큘럼 */}
      <Curriculum />

      {/* 지식의참견이 다른 이유 (숫자 띠 + 강점 블록 5개) */}
      <WhyUs />

      {/* 선생님 소개 인트로 (좌 사진 · 우 텍스트) — 교사진 섹션 바로 위 */}
      <TeacherIntro />

      {/* 전문 선생님 소개 (검증된 교사진 카드) */}
      <Teachers />

      {/* 후기 & 성장 스토리 */}
      <section
        id="proof"
        className="border-t border-line bg-surface px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">
            후기 &amp; 성장 스토리
          </h2>
          <p className="mt-3 text-base font-semibold text-ink sm:text-lg">
            영상으로 만나는 후기
          </p>
          <p className="mt-1 text-base leading-relaxed text-muted sm:text-lg">
            직접 수업을 경험한 학생과 학부모의 이야기입니다.
          </p>
        </div>

        {/* 영상으로 만나는 후기 (텍스트 후기 슬라이더는 다음 작업에서 구현) */}
        <ReviewVideos />
      </section>

      {/* 네이버 블로그 최신글 연계 (RSS · ISR). 수집 실패/미설정 시 자동 숨김. */}
      <BlogSection />

      {/* 무료 상담 신청 폼 — 모든 CTA 의 앵커 목적지(#consult).
          표준 폼(ApplyForm) 공유. 섹션 제목·안내 문구는 기존 홈 카피 유지. */}
      <InquirySection
        eyebrow={consultFormConfig(SERVICE.main).header.eyebrow}
        titleTop={consultFormConfig(SERVICE.main).header.titleTop}
        titleAccent={consultFormConfig(SERVICE.main).header.titleAccent}
        intro={consultFormConfig(SERVICE.main).header.intro}
        successTitle="상담 신청이 접수되었습니다"
        successBody="상담 선생님이 곧 연락드립니다."
      />
    </>
  );
}
