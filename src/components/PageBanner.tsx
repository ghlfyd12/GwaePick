import Image from "next/image";
import {
  PAGE_BANNER_IMAGE,
  PAGE_BANNER_ALT,
  PAGE_BANNER_LINK_LABEL,
  PAGE_BANNER_HREF,
  type PageBannerContent,
} from "@/data/pageBannerCopy";

/*
 * PageBanner — 지식의참견 상세 페이지 공용 안내 배너(서버 컴포넌트).
 *
 * /power "학교별 안내 배너"와 같은 규격(이미지 좌 + 텍스트 우, 모바일 세로 스택).
 * 다른 점: 카드 전체 링크가 아니라 텍스트 링크 "무료 상담 신청 →"(상담 폼 #consult).
 * 색은 accent 토큰(메인=코랄). 이미지는 lazy(LCP 아님). break-keep, 390px 가로 스크롤 없음.
 */
export default function PageBanner({
  content,
  image = PAGE_BANNER_IMAGE,
  alt = PAGE_BANNER_ALT,
}: {
  content: PageBannerContent;
  image?: string;
  alt?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* 이미지 — 모바일 상단(16:10), 데스크톱 좌측(높이 채움) */}
        <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-full">
          <Image
            src={image}
            alt={alt}
            fill
            loading="lazy"
            sizes="(min-width: 768px) 512px, 100vw"
            className="object-cover object-center"
            unoptimized
          />
        </div>

        {/* 텍스트 — 제목·설명·상담 링크 */}
        <div className="flex flex-col justify-center gap-2 p-6 sm:p-8">
          <p className="break-keep text-lg font-bold text-ink sm:text-xl">
            {content.title}
          </p>
          <p className="break-keep text-sm leading-relaxed text-muted sm:text-base">
            {content.desc}
          </p>
          <a
            href={PAGE_BANNER_HREF}
            className="mt-1 inline-flex items-center gap-1 break-keep text-base font-semibold text-accent hover:underline"
          >
            {PAGE_BANNER_LINK_LABEL}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
