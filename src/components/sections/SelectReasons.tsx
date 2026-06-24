import { SELECT_REASONS } from "@/data/detailCopy";

/*
 * SelectReasons — '1:1 맞춤 과외를 선택하는 3가지 이유'. 카피는 detailCopy.ts.
 * 번호(01~03) 코랄 포인트, 차분한 카드. h2(섹션 제목). 모바일 1열 → 데스크톱 3열.
 */
export default function SelectReasons() {
  const { title, items } = SELECT_REASONS;
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl">
          {title}
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.no}
              className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-sm"
            >
              <span className="text-2xl font-bold text-accent">{it.no}</span>
              <p className="mt-3 break-keep text-lg font-bold text-ink">
                {it.title}
              </p>
              <p className="mt-2 break-keep text-base leading-relaxed text-muted">
                {it.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
