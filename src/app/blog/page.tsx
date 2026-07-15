import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { getBlogPosts, naverBlogHomeUrl } from "@/lib/blogFeed";
import BlogCard from "@/components/blog/BlogCard";

/*
 * /blog — 네이버 블로그 최신글 전체 목록(서버 컴포넌트, ISR).
 * 원문은 네이버 링크로 유도(사이트 내 복제 없음). h1 1개. 카드 양식은 홈 섹션과 동일.
 * ISR 갱신 주기는 getBlogPosts 내부 fetch 의 next.revalidate(=BLOG_REVALIDATE_SECONDS, 3시간)가 결정한다.
 */

const PAGE_TITLE = "블로그";
const PAGE_DESCRIPTION =
  "지식의참견 네이버 블로그의 학교·지역별 과외 이야기 최신글을 모았습니다. 각 글은 네이버 블로그 원문으로 연결됩니다.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `${PAGE_TITLE} | ${site.name}`,
    description: PAGE_DESCRIPTION,
    url: "/blog",
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | ${site.name}`,
    description: PAGE_DESCRIPTION,
    images: [site.ogImage],
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts(30);
  const blogHome = naverBlogHomeUrl();

  return (
    <>
      {/* 히어로 — 페이지 유일 h1 */}
      <section className="border-b border-line bg-surface px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {site.name} 이야기
        </p>
        <h1 className="mx-auto mt-2 max-w-2xl break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          블로그
        </h1>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
          {PAGE_DESCRIPTION}
        </p>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          {posts.length > 0 ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.link} className="flex">
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            // 폴백 — RSS 수집 실패/미설정 시 빈 상태(깨지지 않게)
            <div className="mx-auto max-w-md rounded-2xl border border-line bg-white px-6 py-12 text-center">
              <p className="break-keep text-base leading-relaxed text-muted">
                블로그 글을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
              </p>
              {blogHome && (
                <a
                  href={blogHome}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-accent px-6 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
                >
                  네이버 블로그 바로가기 →
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
