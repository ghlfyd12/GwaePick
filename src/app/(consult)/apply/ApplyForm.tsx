"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  GRADES,
  LESSON_TYPES,
  SCHOOL_FALLBACKS,
  NAME_MAX,
  MEMO_MAX,
  normalizePhone,
  type SchoolFallback,
} from "@/data/applyFormOptions";

/*
 * 신청폼 본체(클라이언트).
 *
 * 선택지(지역·과목)는 서버 컴포넌트(page.tsx)가 넘겨준다. 이 컴포넌트는 Supabase 를 모른다.
 * 학교 자동완성만 GET /api/schools/search 를 부르고, 제출은 POST /api/inquiries 로 보낸다.
 * 검증은 서버가 최종 판단하며, 여기서는 같은 규칙으로 먼저 걸러 왕복을 줄인다.
 *
 * 색은 accent 토큰(메인=코랄)만 쓴다 — 브랜드색 하드코딩 금지(CLAUDE.md §3).
 */

export type SidoOption = {
  code: string;
  name: string;
  sigungu: { code: string; name: string }[];
};
export type SubjectOption = { id: number; name: string; group: string };

type SchoolHit = {
  school_code: string;
  school_name: string;
  school_level: string;
  sido_name: string;
  sigungu_name: string;
};

/** 과목 그룹 표시 순서(시드 데이터의 subject_group 값). */
const GROUP_ORDER = ["수학", "영어", "국어", "과학", "사탐", "논술", "기타"];

/** 서버가 돌려주는 필드명 → 화면 메시지. */
const FIELD_MESSAGE: Record<string, string> = {
  name: "이름을 입력해 주세요.",
  phone: "연락처 형식을 확인해 주세요. (예: 010-1234-5678)",
  sidoCode: "지역을 선택해 주세요.",
  sigunguCode: "시/군/구를 선택해 주세요.",
  school: "학교를 선택하거나 아래 항목 중 하나를 골라 주세요.",
  schoolCode: "학교를 다시 선택해 주세요.",
  schoolFallback: "학교 항목을 다시 선택해 주세요.",
  grade: "학년을 선택해 주세요.",
  lessonType: "희망 수업 형태를 선택해 주세요.",
  subjectIds: "과목을 1개 이상 선택해 주세요.",
  agree: "개인정보 수집·이용에 동의해 주세요.",
};

export default function ApplyForm({
  regions,
  subjects,
}: {
  regions: SidoOption[];
  subjects: SubjectOption[];
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sidoCode, setSidoCode] = useState("");
  const [sigunguCode, setSigunguCode] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [school, setSchool] = useState<SchoolHit | null>(null);
  const [schoolFallback, setSchoolFallback] = useState<SchoolFallback | "">("");
  const [grade, setGrade] = useState("");
  const [lessonType, setLessonType] = useState("");
  const [subjectIds, setSubjectIds] = useState<number[]>([]);
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);

  const [hits, setHits] = useState<SchoolHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const sigunguList = useMemo(
    () => regions.find((r) => r.code === sidoCode)?.sigungu ?? [],
    [regions, sidoCode],
  );

  const groupedSubjects = useMemo(() => {
    const map = new Map<string, SubjectOption[]>();
    for (const s of subjects) {
      const list = map.get(s.group) ?? [];
      list.push(s);
      map.set(s.group, list);
    }
    return [...map.entries()].sort(
      (a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]),
    );
  }, [subjects]);

  const clearError = (key: string) =>
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));

  /* ── 학교 자동완성 — 250ms 디바운스 + 이전 요청 취소 ─────────────── */
  const boxRef = useRef<HTMLDivElement>(null);
  // 검색 가능 조건은 렌더 시점에 파생한다(effect 안에서 setState 로 지우지 않는다).
  const canSearch = !school && schoolQuery.trim().length >= 2;

  useEffect(() => {
    const q = schoolQuery.trim();
    if (school || q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setHits(Array.isArray(json.schools) ? json.schools : []);
      } catch {
        /* 취소·네트워크 오류는 무시(다음 입력에서 다시 시도) */
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [schoolQuery, school]);

  // 목록 바깥을 누르면 후보를 닫는다.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setHits([]);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pickSchool = (hit: SchoolHit) => {
    setSchool(hit);
    setSchoolQuery(hit.school_name);
    setSchoolFallback("");
    setHits([]);
    clearError("school");
  };

  const resetSchool = () => {
    setSchool(null);
    setSchoolQuery("");
  };

  const toggleSubject = (id: number) => {
    setSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
    clearError("subjectIds");
  };

  /* ── 제출 ───────────────────────────────────────────────────────── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = FIELD_MESSAGE.name;
    if (!normalizePhone(phone)) e.phone = FIELD_MESSAGE.phone;
    if (!sidoCode) e.sidoCode = FIELD_MESSAGE.sidoCode;
    if (!sigunguCode) e.sigunguCode = FIELD_MESSAGE.sigunguCode;
    if (!school && !schoolFallback) e.school = FIELD_MESSAGE.school;
    if (!grade) e.grade = FIELD_MESSAGE.grade;
    if (!lessonType) e.lessonType = FIELD_MESSAGE.lessonType;
    if (subjectIds.length === 0) e.subjectIds = FIELD_MESSAGE.subjectIds;
    if (!agree) e.agree = FIELD_MESSAGE.agree;
    return e;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    // 유입 파라미터는 제출 시점에만 필요하므로 주소창에서 직접 읽는다
    // (useSearchParams 는 정적 페이지에서 Suspense 경계를 요구해 폼 전체 hydration 을 막는다).
    const query = new URLSearchParams(window.location.search);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          sidoCode,
          sigunguCode,
          schoolCode: school?.school_code ?? null,
          schoolFallback: school ? null : schoolFallback || null,
          grade,
          lessonType,
          subjectIds,
          memo: memo.trim(),
          agree,
          // 유입 파라미터 — 서버가 memo 끝에 [utm:...] 로 덧붙인다.
          utmSource: query.get("utm_source") ?? undefined,
          utmCampaign: query.get("utm_campaign") ?? undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setStatus("success");
        return;
      }
      if (res.status === 400 && Array.isArray(json.fields)) {
        const mapped: Record<string, string> = {};
        for (const f of json.fields) mapped[f] = FIELD_MESSAGE[f] ?? "다시 확인해 주세요.";
        setErrors(mapped);
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-line bg-white p-8 text-center"
      >
        <p className="text-lg font-bold text-ink">신청이 접수되었습니다</p>
        <p className="mt-3 text-base text-muted">
          상담 선생님이 신청 내용을 확인한 뒤 순서대로 연락드립니다. 통화가 편한
          시간이 있다면 회신 문자로 알려 주세요.
        </p>
      </div>
    );
  }

  const err = (key: string) => errors[key] || "";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* 이름 */}
      <Field id={`${uid}-name`} label="이름" error={err("name")} required>
        <input
          id={`${uid}-name`}
          type="text"
          value={name}
          maxLength={NAME_MAX}
          autoComplete="name"
          onChange={(e) => {
            setName(e.target.value);
            clearError("name");
          }}
          aria-invalid={Boolean(err("name"))}
          placeholder="수업받을 회원 이름"
          className={inputClass(Boolean(err("name")))}
        />
      </Field>

      {/* 연락처 */}
      <Field id={`${uid}-phone`} label="연락처" error={err("phone")} required>
        <input
          id={`${uid}-phone`}
          type="tel"
          inputMode="tel"
          value={phone}
          maxLength={20}
          autoComplete="tel"
          onChange={(e) => {
            setPhone(e.target.value);
            clearError("phone");
          }}
          aria-invalid={Boolean(err("phone"))}
          placeholder="010-1234-5678"
          className={inputClass(Boolean(err("phone")))}
        />
      </Field>

      {/* 지역 — 시/도 → 시/군/구 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          지역 <RequiredMark />
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-sido`} className="sr-only">
              시/도
            </label>
            <select
              id={`${uid}-sido`}
              value={sidoCode}
              onChange={(e) => {
                setSidoCode(e.target.value);
                setSigunguCode("");
                clearError("sidoCode");
              }}
              aria-invalid={Boolean(err("sidoCode"))}
              className={inputClass(Boolean(err("sidoCode")))}
            >
              <option value="">시/도 선택</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-sigungu`} className="sr-only">
              시/군/구
            </label>
            <select
              id={`${uid}-sigungu`}
              value={sigunguCode}
              disabled={!sidoCode}
              onChange={(e) => {
                setSigunguCode(e.target.value);
                clearError("sigunguCode");
              }}
              aria-invalid={Boolean(err("sigunguCode"))}
              className={`${inputClass(Boolean(err("sigunguCode")))} disabled:bg-surface-alt disabled:text-muted`}
            >
              <option value="">
                {sidoCode ? "시/군/구 선택" : "시/도를 먼저 선택"}
              </option>
              {sigunguList.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ErrorText text={err("sidoCode") || err("sigunguCode")} />
      </fieldset>

      {/* 학교 — 자동완성 + 대체 선택지 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          학교 <RequiredMark />
        </legend>

        <div ref={boxRef} className="relative">
          <label htmlFor={`${uid}-school`} className="sr-only">
            학교명 검색
          </label>
          <input
            id={`${uid}-school`}
            type="text"
            value={schoolQuery}
            autoComplete="off"
            onChange={(e) => {
              setSchoolQuery(e.target.value);
              if (school) setSchool(null);
              setSchoolFallback("");
              clearError("school");
            }}
            aria-invalid={Boolean(err("school"))}
            placeholder="학교명을 2글자 이상 입력해 주세요"
            className={inputClass(Boolean(err("school")))}
          />

          {school && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="text-ink">
                {school.sido_name} {school.sigungu_name} · {school.school_name}
              </span>
              <button
                type="button"
                onClick={resetSchool}
                className="min-h-11 rounded-md px-2 text-accent underline underline-offset-2"
              >
                다시 선택
              </button>
            </p>
          )}

          {canSearch && hits.length > 0 && (
            <ul
              role="listbox"
              aria-label="학교 검색 결과"
              className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-line bg-white p-1 shadow-lg"
            >
              {hits.map((hit) => (
                <li key={hit.school_code} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => pickSchool(hit)}
                    className="w-full rounded-md px-3 py-2.5 text-left text-base hover:bg-surface-alt"
                  >
                    <span className="text-ink">{hit.school_name}</span>
                    <span className="ml-2 text-sm text-muted">
                      {hit.sido_name} {hit.sigungu_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {canSearch && searching && (
            <p className="mt-2 text-sm text-muted">학교를 찾는 중입니다</p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SCHOOL_FALLBACKS.map((option) => {
            const on = schoolFallback === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setSchoolFallback(on ? "" : option);
                  setSchool(null);
                  setSchoolQuery("");
                  clearError("school");
                }}
                className={`min-h-11 rounded-full border px-4 text-base transition-colors ${
                  on
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-ink hover:bg-surface-alt"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <ErrorText text={err("school")} />
      </fieldset>

      {/* 학년 */}
      <Field id={`${uid}-grade`} label="학년" error={err("grade")} required>
        <select
          id={`${uid}-grade`}
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            clearError("grade");
          }}
          aria-invalid={Boolean(err("grade"))}
          className={inputClass(Boolean(err("grade")))}
        >
          <option value="">학년 선택</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Field>

      {/* 과목 — 다중 선택 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          과목 <RequiredMark />
          <span className="ml-2 text-sm font-normal text-muted">
            여러 개 선택할 수 있습니다
          </span>
        </legend>
        <div className="space-y-4">
          {groupedSubjects.map(([group, list]) => (
            <div key={group}>
              <p className="mb-2 text-sm font-semibold text-muted">{group}</p>
              <div className="flex flex-wrap gap-2">
                {list.map((s) => {
                  const on = subjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleSubject(s.id)}
                      className={`min-h-11 rounded-full border px-4 text-base transition-colors ${
                        on
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-white text-ink hover:bg-surface-alt"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <ErrorText text={err("subjectIds")} />
      </fieldset>

      {/* 희망 수업 형태 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          희망 수업 형태 <RequiredMark />
        </legend>
        <div className="space-y-2">
          {LESSON_TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 ${
                lessonType === t.value ? "border-accent" : "border-line"
              }`}
            >
              <input
                type="radio"
                name={`${uid}-lesson`}
                value={t.value}
                checked={lessonType === t.value}
                onChange={() => {
                  setLessonType(t.value);
                  clearError("lessonType");
                }}
                className="h-5 w-5 accent-accent"
              />
              <span className="text-base text-ink">{t.label}</span>
              <span className="text-sm text-muted">{t.hint}</span>
            </label>
          ))}
        </div>
        <ErrorText text={err("lessonType")} />
      </fieldset>

      {/* 상담 내용(선택) */}
      <Field id={`${uid}-memo`} label="상담 내용" error="" hint="선택">
        <textarea
          id={`${uid}-memo`}
          value={memo}
          maxLength={MEMO_MAX}
          rows={4}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="현재 어려워하는 부분이나 원하는 수업 방식을 적어 주시면 상담에 도움이 됩니다."
          className={inputClass(false)}
        />
      </Field>

      {/* 동의 */}
      <div>
        <label className="flex min-h-12 items-start gap-3 rounded-lg border border-line bg-white p-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked);
              clearError("agree");
            }}
            aria-invalid={Boolean(err("agree"))}
            className="mt-1 h-5 w-5 shrink-0 accent-accent"
          />
          <span className="text-base text-ink">
            상담 연락을 위한 개인정보 수집·이용에 동의합니다.
            {/* 새 탭으로 연다 — 같은 탭 이동 시 폼 입력값이 사라진다.
                라벨 안이라 링크 클릭이 체크박스를 토글하지 않도록 전파를 막는다. */}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-2 text-sm text-accent underline underline-offset-2"
            >
              자세히 보기
            </a>
          </span>
        </label>
        <ErrorText text={err("agree")} />
      </div>

      {status === "error" && (
        <p role="alert" className="text-base text-red-600">
          신청을 접수하지 못했습니다. 잠시 후 다시 시도해 주시거나 전화로 문의해 주세요.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-6 text-lg font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
      >
        {status === "submitting" ? "접수하는 중" : "무료 상담 신청"}
      </button>
    </form>
  );
}

/* ── 작은 조각들 ─────────────────────────────────────────────────────── */

function inputClass(invalid: boolean) {
  return `min-h-12 w-full rounded-lg border bg-white px-4 py-3 text-base text-ink placeholder:text-muted md:text-lg ${
    invalid ? "border-red-400" : "border-line"
  }`;
}

function RequiredMark() {
  return (
    <span className="text-accent" aria-hidden>
      *
    </span>
  );
}

function ErrorText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="mt-2 text-sm text-red-600">
      {text}
    </p>
  );
}

function Field({
  id,
  label,
  error,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  error: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base font-semibold text-ink">
        {label} {required && <RequiredMark />}
        {hint && <span className="ml-2 text-sm font-normal text-muted">{hint}</span>}
      </label>
      {children}
      <ErrorText text={error} />
    </div>
  );
}
