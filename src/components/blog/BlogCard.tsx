import Image from "next/image";
import type { BlogPost } from "@/lib/blogFeed";

/*
 * BlogCard — 네이버 블로그 글 카드(원문 링크, 새 탭).
 * 흰 배경·얇은 테두리·둥근 모서리, 코랄 포인트(hover). 썸네일 aspect-video + object-cover.
 * 원문 전체 복제 없음 — 제목·요약(100~150자)·발행일 + 원문 링크만.
 */
export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-colors hover:border-accent"
    >
      {/* 썸네일 — 없으면 대체 배경 */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-alt">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-alt to-surface">
            <span className="text-sm font-semibold text-muted">지식의참견</span>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {post.dateLabel && (
          <time dateTime={post.date} className="text-xs font-medium text-muted">
            {post.dateLabel}
          </time>
        )}
        <h3 className="mt-1.5 line-clamp-2 break-keep text-base font-bold leading-snug text-ink transition-colors group-hover:text-accent sm:text-lg">
          {post.title}
        </h3>
        {post.summary && (
          <p className="mt-2 line-clamp-2 break-keep text-sm leading-relaxed text-muted">
            {post.summary}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          네이버 블로그에서 보기 →
        </span>
      </div>
    </a>
  );
}
