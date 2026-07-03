"use client";

import { useMemo, useState } from "react";
import TeacherCard from "./TeacherCard";
import {
  TEACHER_DISPLAY_GROUPS,
  teacherInGroup,
  type LanguageTeacher,
} from "@/data/languageTeachers";

/*
 * TeacherList — /power/teachers 교사 리스트(클라이언트). 필터·더보기 상태만 담당.
 *  - 영역 필터 칩: "전체" + 데이터가 있는 (언어·유형) 그룹만 자동 생성.
 *  - 더보기: 초기 INITIAL 개만 렌더, STEP 개씩 추가. 칩 변경 시 노출 개수 리셋.
 * 데이터는 languageTeachers.ts 그대로(하드코딩·변경 없음).
 */

const INITIAL = 12;
const STEP = 12;
const ALL = "all";

export default function TeacherList({
  teachers,
}: {
  teachers: LanguageTeacher[];
}) {
  // 데이터가 있는 표시 그룹만(영어는 원어민/한국인 분리, 일본어·중국어는 합침).
  const groups = useMemo(
    () =>
      TEACHER_DISPLAY_GROUPS.map((g) => ({
        ...g,
        count: teachers.filter((t) => teacherInGroup(t, g)).length,
      })).filter((g) => g.count > 0),
    [teachers],
  );

  const [selected, setSelected] = useState<string>(ALL);
  const [visible, setVisible] = useState(INITIAL);

  // 그룹 순서대로 평탄화(카드 배지 = 그룹 라벨) 후, 선택 칩에 맞게 필터.
  const filtered = useMemo(() => {
    const ordered = groups.flatMap((g) =>
      teachers
        .filter((t) => teacherInGroup(t, g))
        .map((t) => ({ teacher: t, badge: g.label, groupKey: g.key })),
    );
    return selected === ALL
      ? ordered
      : ordered.filter((x) => x.groupKey === selected);
  }, [groups, teachers, selected]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  const pick = (key: string) => {
    setSelected(key);
    setVisible(INITIAL);
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-full px-4 py-1.5 text-sm font-semibold break-keep transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      active
        ? "bg-accent text-white"
        : "border border-line bg-white text-ink hover:border-accent hover:text-accent"
    }`;

  return (
    <div>
      {/* 영역 필터 칩 */}
      <ul className="flex flex-wrap gap-2" aria-label="영역 필터">
        <li>
          <button
            type="button"
            aria-pressed={selected === ALL}
            onClick={() => pick(ALL)}
            className={chipClass(selected === ALL)}
          >
            전체
          </button>
        </li>
        {groups.map((g) => (
          <li key={g.key}>
            <button
              type="button"
              aria-pressed={selected === g.key}
              onClick={() => pick(g.key)}
              className={chipClass(selected === g.key)}
            >
              {g.label}
            </button>
          </li>
        ))}
      </ul>

      {/* 카드 그리드 — 모바일 2열 → 태블릿 3열 → 데스크톱 4열 */}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {shown.map((x) => (
          <TeacherCard key={x.teacher.id} teacher={x.teacher} badge={x.badge} />
        ))}
      </ul>

      {/* 더 보기 */}
      {remaining > 0 && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + STEP)}
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-2.5 text-base font-bold text-accent transition-colors hover:bg-accent/5"
          >
            더 보기 ({remaining}명)
          </button>
        </div>
      )}
    </div>
  );
}
