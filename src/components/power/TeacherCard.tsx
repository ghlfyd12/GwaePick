import SafeImage from "@/components/SafeImage";
import type { LanguageTeacher } from "@/data/languageTeachers";

/*
 * TeacherCard — 어학 교사 1명 카드(서버 컴포넌트). 원어민/한국인 포맷 모두 렌더.
 *  - 상단: 세로 3:4 사진(object-cover, 얼굴 중심). 파일 없으면 이니셜 플레이스홀더(레이아웃 유지).
 *  - 이름 + 수업 방식(전화/화상) 칩 — lessonModes 있을 때만.
 *  - 한국인: 헤드라인(코랄 강조) + 이력 리스트 + 전문분야 칩.
 *  - 원어민: 좌우명(인용) · 학력 · 강점 · 경력.
 *  값이 있는 항목만 노출. 라벨은 한국어(break-keep), 영어 값은 정상 워드랩.
 */
export default function TeacherCard({ teacher }: { teacher: LanguageTeacher }) {
  const initial = teacher.name.trim().charAt(0) || "·";
  const modes = teacher.lessonModes ?? [];
  const credentials = teacher.credentials ?? [];
  const specialties = teacher.specialties ?? [];

  // 원어민 포맷 행(값 있는 것만)
  const nativeRows = [
    { label: "좌우명", value: teacher.motto, quote: true },
    { label: "학력", value: teacher.education },
    { label: "강점", value: teacher.strength },
    { label: "경력", value: teacher.experience },
  ].filter((r) => r.value && r.value.trim().length > 0);

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      {/* 사진 — 세로 3:4. 이미지 없으면 이니셜이 보인다(SafeImage 가 onError 시 사라짐). */}
      <div className="relative aspect-[3/4] w-full bg-surface-alt">
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted/40"
        >
          {initial}
        </div>
        <SafeImage
          src={teacher.photo}
          alt={`${teacher.name} 선생님`}
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 100vw"
          className="object-cover object-top"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 이름 + 수업 방식 칩 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="break-keep text-lg font-bold text-ink">{teacher.name}</h3>
          {modes.length > 0 && (
            <ul className="flex shrink-0 flex-wrap justify-end gap-1.5">
              {modes.map((mode) => (
                <li
                  key={mode}
                  className="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent"
                >
                  {mode}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 한국인 포맷 — 헤드라인 */}
        {teacher.headline && (
          <p className="break-keep border-l-2 border-accent/50 pl-2.5 text-sm font-medium leading-relaxed text-ink">
            {teacher.headline}
          </p>
        )}

        {/* 한국인 포맷 — 이력 리스트 */}
        {credentials.length > 0 && (
          <div>
            <p className="break-keep text-xs font-bold text-accent">이력</p>
            <ul className="mt-1 space-y-1">
              {credentials.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 break-keep text-sm leading-relaxed text-muted"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 한국인 포맷 — 전문분야 칩 */}
        {specialties.length > 0 && (
          <div>
            <p className="break-keep text-xs font-bold text-accent">전문분야</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {specialties.map((s) => (
                <li
                  key={s}
                  className="inline-flex break-keep rounded-full border border-accent/40 px-2.5 py-1 text-xs font-semibold text-accent"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 원어민 포맷 — 좌우명·학력·강점·경력 */}
        {nativeRows.length > 0 && (
          <dl className="flex flex-col gap-2.5">
            {nativeRows.map((r) => (
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
