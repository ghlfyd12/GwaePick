"use client";

import { useState } from "react";
import SafeImage from "@/components/SafeImage";
import {
  LANGUAGE_LABEL,
  TYPE_LABEL,
  type LanguageTeacher,
} from "@/data/languageTeachers";

/*
 * TeacherCard — 어학 교사 콤팩트 카드(/power/teachers 전용, 메인 사이트 미사용).
 *  - 사진(4:5, 얼굴 중심, 없으면 이니셜 플레이스홀더) → 이름 → [언어·유형] 배지 →
 *    한 줄 요약(headline 또는 원어민 좌우명, line-clamp-2) → 수업 방식 칩.
 *  - 상세(이력·전문분야·학력/강점/경력)는 기본 접힘, "자세히" 토글로 펼침.
 */
export default function TeacherCard({ teacher }: { teacher: LanguageTeacher }) {
  const [open, setOpen] = useState(false);
  const initial = teacher.name.trim().charAt(0) || "·";
  const modes = teacher.lessonModes ?? [];
  const credentials = teacher.credentials ?? [];
  const specialties = teacher.specialties ?? [];
  const badge = `${LANGUAGE_LABEL[teacher.language]} ${TYPE_LABEL[teacher.type]}`;
  // 요약 한 줄: 한국인은 headline, 원어민은 좌우명(motto).
  const summary = teacher.headline ?? teacher.motto;
  // 원어민 상세(좌우명은 요약으로 노출하므로 제외).
  const nativeRows = [
    { label: "학력", value: teacher.education },
    { label: "강점", value: teacher.strength },
    { label: "경력", value: teacher.experience },
  ].filter((r) => r.value && r.value.trim().length > 0);
  const hasDetail =
    credentials.length > 0 || specialties.length > 0 || nativeRows.length > 0;

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      {/* 사진 — 4:5, 이미지 없으면 이니셜 노출 */}
      <div className="relative aspect-[4/5] w-full bg-surface-alt">
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-muted/40"
        >
          {initial}
        </div>
        <SafeImage
          src={teacher.photo}
          alt={`${teacher.name} 선생님`}
          sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
          className="object-cover object-top"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="break-keep text-sm font-bold text-ink">{teacher.name}</h3>
          {modes.length > 0 && (
            <ul className="flex shrink-0 gap-1">
              {modes.map((m) => (
                <li
                  key={m}
                  className="inline-flex rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent"
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="inline-flex w-fit rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
          {badge}
        </span>

        {summary && (
          <p className="line-clamp-2 break-keep text-xs leading-relaxed text-muted">
            {summary}
          </p>
        )}

        {hasDetail && (
          <>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-auto self-start pt-1 text-xs font-semibold text-accent transition-colors hover:text-accent-dark"
            >
              {open ? "접기" : "자세히"}
            </button>

            {open && (
              <div className="mt-1 flex flex-col gap-2 border-t border-line pt-2">
                {credentials.length > 0 && (
                  <ul className="space-y-1">
                    {credentials.map((c, i) => (
                      <li
                        key={i}
                        className="flex gap-1.5 break-keep text-xs leading-relaxed text-muted"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60"
                        />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {specialties.length > 0 && (
                  <ul className="flex flex-wrap gap-1">
                    {specialties.map((s) => (
                      <li
                        key={s}
                        className="inline-flex break-keep rounded-full border border-accent/40 px-2 py-0.5 text-[11px] font-semibold text-accent"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {nativeRows.length > 0 && (
                  <dl className="flex flex-col gap-1.5">
                    {nativeRows.map((r) => (
                      <div key={r.label}>
                        <dt className="break-keep text-[11px] font-bold text-accent">
                          {r.label}
                        </dt>
                        <dd className="text-xs leading-relaxed text-muted">
                          {r.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}
