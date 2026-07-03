import Image from "next/image";
import type { LanguageTeacher } from "@/data/languageTeachers";

/*
 * TeacherCard — 어학 교사 1명 카드(서버 컴포넌트).
 *  - 상단: 세로 비율 사진(object-cover, 얼굴 중심). alt="{이름} 선생님".
 *  - 이름 + 수업 방식(전화/화상) 칩(코랄 톤).
 *  - 좌우명(인용 강조) · 학력 · 강점 · 경력 — 값이 있는 행만 노출.
 *  라벨은 한국어(break-keep), 값은 영어 원문(정상 워드랩).
 */
export default function TeacherCard({ teacher }: { teacher: LanguageTeacher }) {
  const rows: { label: string; value?: string; quote?: boolean }[] = [
    { label: "좌우명", value: teacher.motto, quote: true },
    { label: "학력", value: teacher.education },
    { label: "강점", value: teacher.strength },
    { label: "경력", value: teacher.experience },
  ];
  const visible = rows.filter((r) => r.value && r.value.trim().length > 0);

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      {/* 사진 — 세로 3:4, 얼굴 중심 크롭 */}
      <div className="relative aspect-[3/4] w-full bg-surface-alt">
        <Image
          src={teacher.photo}
          alt={`${teacher.name} 선생님`}
          fill
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 100vw"
          className="object-cover object-top"
          unoptimized
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 이름 + 수업 방식 칩 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-ink">{teacher.name}</h3>
          <ul className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {teacher.lessonModes.map((mode) => (
              <li
                key={mode}
                className="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent"
              >
                {mode}
              </li>
            ))}
          </ul>
        </div>

        {/* 항목: 좌우명·학력·강점·경력 (값 있는 행만) */}
        {visible.length > 0 && (
          <dl className="flex flex-col gap-2.5">
            {visible.map((r) => (
              <div key={r.label}>
                <dt className="break-keep text-xs font-bold text-accent">
                  {r.label}
                </dt>
                {r.quote ? (
                  <dd className="mt-1 border-l-2 border-accent/40 pl-2.5 text-sm italic leading-relaxed text-ink">
                    {r.value}
                  </dd>
                ) : (
                  <dd className="mt-1 text-sm leading-relaxed text-muted">
                    {r.value}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        )}
      </div>
    </li>
  );
}
