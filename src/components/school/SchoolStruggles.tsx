import type { SchoolContentVariant } from "@/data/schoolContent";

/*
 * SchoolStruggles — "이 학교 학생들이 자주 겪는 어려움" 섹션.
 * 콘텐츠는 schoolContent.ts(학교급×과목 변형)에서 주입받고, {school} 슬롯만 학교명으로 치환한다.
 * 카피 하드코딩 금지 — 이 컴포넌트는 표현만 담당한다.
 */
export default function SchoolStruggles({
  schoolName,
  struggles,
}: {
  schoolName: string;
  struggles: SchoolContentVariant["struggles"];
}) {
  const fill = (s: string) => s.replaceAll("{school}", schoolName);

  return (
    <section>
      <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
        {schoolName} 학생들이 자주 겪는 어려움
      </h2>
      <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">
        {fill(struggles.intro)}
      </p>
      <ul className="mt-5 space-y-3">
        {struggles.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 break-keep text-base leading-relaxed text-ink sm:text-lg"
          >
            <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
            {fill(item)}
          </li>
        ))}
      </ul>
    </section>
  );
}
