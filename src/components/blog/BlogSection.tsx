import Link from "next/link";
import { getBlogPosts } from "@/lib/blogFeed";
import BlogCard from "@/components/blog/BlogCard";

/*
 * BlogSection — 홈 하단 네이버 블로그 최신글 연계 섹션(서버 컴포넌트).
 * 최신 6개를 카드로. RSS 수집 실패/미설정이면 섹션 자체를 숨긴다(홈이 깨지지 않게).
 * 데스크톱 3열·태블릿 2열·모바일 1열. 코랄 포인트, 보라 없음, 느낌표 없음.
 */
export default async function BlogSection() {
  const posts = await getBlogPosts(6);
  if (posts.length === 0) return null; // 폴백: 홈에서는 섹션 숨김

  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className="border-t border-line px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 id="blog-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            지식의참견 이야기
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            네이버 블로그에 담은 학교·지역별 과외 이야기를 전해 드립니다.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.link} post={post} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-accent px-6 text-sm font-bold text-accent transition-colors hover:bg-accent/5 sm:text-base"
          >
            블로그 더보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
