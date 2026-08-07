"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  GRADES,
  LESSON_TYPES,
  SCHOOL_FALLBACKS,
  REPRESENTATIVE_SUBJECTS,
  NAME_MAX,
  MEMO_MAX,
  DETAIL_MAX,
  normalizePhone,
  type SchoolFallback,
} from "@/data/applyFormOptions";
import type { SidoOption, SubjectOption } from "@/lib/inquiryOptions";
import { getUtm } from "@/lib/utm";

/*
 * 신청폼 본체(클라이언트) — 단순화판.
 *
 * 선택지(지역·과목)는 서버 컴포넌트(page.tsx)가 넘겨준다. 이 컴포넌트는 Supabase 를 모른다.
 * 입력 최소화: 필수 5개(이름·연락처·학년·과목·주소)만으로 신청된다.
 *   - 과목: 대표 과목 드롭다운 1개(REPRESENTATIVE_SUBJECTS) → subject_id 를 [id] 배열로 전송.
 *   - 주소: 다음(Daum) 우편번호 검색 → sido/sigungu 를 기존 지역 코드로 해석해 전송(API·DB 무변경).
 *   - 학교·수업형태·문의사항: 선택. 학교 자동완성은 GET /api/schools/search, 제출은 POST /api/inquiries.
 * 검증은 서버가 최종 판단하며, 여기서는 같은 규칙으로 먼저 걸러 왕복을 줄인다.
 *
 * 색은 accent 토큰(메인=코랄)만 쓴다 — 브랜드색 하드코딩 금지(CLAUDE.md §3).
 */

type SchoolHit = {
  school_code: string;
  school_name: string;
  school_level: string;
  sido_name: string;
  sigungu_name: string;
};

/** 서버가 돌려주는 필드명 → 화면 메시지. (지역 코드 오류는 주소 영역으로 모은다.) */
const FIELD_MESSAGE: Record<string, string> = {
  name: "이름을 입력해 주세요.",
  phone: "연락처 형식을 확인해 주세요. (예: 010-1234-5678)",
  address: "주소를 검색해 주세요.",
  school: "학교 항목을 다시 선택해 주세요.",
  schoolCode: "학교를 다시 선택해 주세요.",
  schoolFallback: "학교 항목을 다시 선택해 주세요.",
  grade: "학년을 1개 이상 선택해 주세요.",
  grades: "학년을 1개 이상 선택해 주세요.",
  subject: "과목을 1개 이상 선택해 주세요.",
  subjectIds: "과목을 1개 이상 선택해 주세요.",
  agree: "개인정보 수집·이용에 동의해 주세요.",
};

export default function ApplyForm({
  regions,
  subjects,
  successTitle = "신청이 접수되었습니다",
  successBody = "상담 선생님이 신청 내용을 확인한 뒤 순서대로 연락드립니다. 통화가 편한 시간이 있다면 회신 문자로 알려 주세요.",
}: {
  regions: SidoOption[];
  subjects: SubjectOption[];
  /** 제출 완료 화면 제목·본문 — 홈/apply 가 다른 카피를 쓸 수 있게 주입. */
  successTitle?: string;
  successBody?: string;
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // 학년·과목은 다중 선택(각각 독립 저장 — inquiry_grades / inquiry_subjects).
  const [grades, setGrades] = useState<string[]>([]);
  const [subjectIds, setSubjectIds] = useState<number[]>([]);

  // 주소 — 검색 결과에서 지역 코드를 해석해 보관한다(제출 payload 는 기존 sidoCode/sigunguCode 유지).
  const [sidoCode, setSidoCode] = useState("");
  const [sigunguCode, setSigunguCode] = useState("");
  const [baseAddress, setBaseAddress] = useState(""); // 도로명/지번 표시용
  const [addressDetail, setAddressDetail] = useState("");
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  // 학교 — 선택(미입력 제출 허용).
  const [schoolQuery, setSchoolQuery] = useState("");
  const [school, setSchool] = useState<SchoolHit | null>(null);
  const [schoolFallback, setSchoolFallback] = useState<SchoolFallback | "">("");

  const [lessonType, setLessonType] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);

  const [hits, setHits] = useState<SchoolHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // 대표 과목 옵션 — subjects 에 실재하는 과목명만 사용(방어적). label 은 표시, id 는 저장.
  const subjectOptions = useMemo(() => {
    const byName = new Map(subjects.map((s) => [s.name, s.id]));
    return REPRESENTATIVE_SUBJECTS.flatMap((r) => {
      const id = byName.get(r.subjectName);
      return id ? [{ id, label: r.label }] : [];
    });
  }, [subjects]);

  const clearError = (key: string) =>
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));

  const toggleGrade = (g: string) => {
    setGrades((prev) => (prev.includes(g) ? prev.filter((v) => v !== g) : [...prev, g]));
    clearError("grade");
  };
  const toggleSubject = (id: number) => {
    setSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
    clearError("subject");
  };

  /* ── 학교 자동완성 — 250ms 디바운스 + 이전 요청 취소 + 최신 응답만 반영 ─────── */
  const boxRef = useRef<HTMLDivElement>(null);
  // 요청 시퀀스 토큰 — 늦게 도착한 이전 응답이 최신 결과를 덮어쓰지 않게 한다(iOS Safari 등).
  const reqIdRef = useRef(0);
  const canSearch = !school && schoolQuery.trim().length >= 2;

  useEffect(() => {
    const q = schoolQuery.trim();
    // 학교 선택됨 또는 2글자 미만(빈 입력 포함) → 이전 결과 즉시 비우고 드롭다운 닫기.
    if (school || q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    // 입력이 바뀌면 이전 결과를 즉시 비워 옛 검색어 결과가 잔존하지 않게 한다.
    setHits([]);
    const myId = ++reqIdRef.current;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        // 최신 요청이 아니면 폐기(순서 역전 방지).
        if (myId !== reqIdRef.current) return;
        setHits(Array.isArray(json.schools) ? json.schools : []);
      } catch {
        /* 취소·네트워크 오류는 무시(다음 입력에서 다시 시도) */
      } finally {
        if (myId === reqIdRef.current) setSearching(false);
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

  /* ── 주소 검색(Daum 우편번호) ────────────────────────────────────── */
  const postcodeLayerRef = useRef<HTMLDivElement>(null);

  const openPostcode = async () => {
    try {
      await loadDaumPostcode();
    } catch {
      setErrors((e) => ({
        ...e,
        address: "주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      }));
      return;
    }
    setPostcodeOpen(true);
  };

  // 레이어가 열리면 그 자리에 우편번호 위젯을 임베드한다(팝업 차단 회피).
  useEffect(() => {
    if (!postcodeOpen) return;
    const el = postcodeLayerRef.current;
    const daum = getDaum();
    if (!el || !daum?.Postcode) return;
    el.innerHTML = "";
    new daum.Postcode({
      oncomplete: (data) => {
        const base = data.roadAddress || data.jibunAddress || "";
        const resolved = resolveRegion(regions, data.sido, data.sigungu);
        if (!resolved) {
          // schools 캐시에 없는 지역(극히 드묾) — 다른 주소로 재검색을 유도한다.
          setErrors((e) => ({
            ...e,
            address: "이 주소의 지역을 자동으로 인식하지 못했습니다. 다른 주소로 검색해 주세요.",
          }));
          setSidoCode("");
          setSigunguCode("");
          setBaseAddress("");
          setPostcodeOpen(false);
          return;
        }
        setSidoCode(resolved.sidoCode);
        setSigunguCode(resolved.sigunguCode);
        setBaseAddress(base);
        clearError("address");
        setPostcodeOpen(false);
      },
      width: "100%",
      height: "100%",
    }).embed(el);
  }, [postcodeOpen, regions]);

  /* ── 제출 ───────────────────────────────────────────────────────── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = FIELD_MESSAGE.name;
    if (!normalizePhone(phone)) e.phone = FIELD_MESSAGE.phone;
    if (grades.length === 0) e.grade = FIELD_MESSAGE.grade;
    if (subjectIds.length === 0) e.subject = FIELD_MESSAGE.subject;
    if (!sidoCode || !sigunguCode) e.address = FIELD_MESSAGE.address;
    if (!agree) e.agree = FIELD_MESSAGE.agree;
    return e;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    // 최초 유입(first-touch) UTM 을 sessionStorage 에서 읽어 함께 전송한다(폼 UI 에는 미노출).
    const utm = getUtm();
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
          // 학년 다중 선택 — 각 학년을 독립 저장(inquiry_grades). grade 컬럼엔 대표(첫) 학년.
          grades,
          // 수업 형태는 선택 — 미선택이면 서버가 'any'(무관)로 저장한다.
          lessonType: lessonType || null,
          // 대표 과목 다중 선택 — inquiry_subjects 에 각 과목 독립 저장.
          subjectIds,
          // 주소 — 도로명/지번 + 상세주소(선택). 서버가 memo 태그·Notion 본문으로 기록.
          roadAddress: baseAddress,
          addressDetail: addressDetail.trim(),
          memo: memo.trim(),
          agree,
          // 유입 UTM 5종 + referrer(전용 컬럼/속성에 분리 저장).
          utm,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setStatus("success");
        return;
      }
      if (res.status === 400 && Array.isArray(json.fields)) {
        const mapped: Record<string, string> = {};
        for (const f of json.fields) {
          // 지역 코드 오류는 주소 영역에 표시한다.
          const key = f === "sidoCode" || f === "sigunguCode" ? "address" : f;
          mapped[key] = FIELD_MESSAGE[key] ?? "다시 확인해 주세요.";
        }
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
        <p className="text-lg font-bold text-ink">{successTitle}</p>
        <p className="mt-3 text-base text-muted">{successBody}</p>
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

      {/* 학년 — 다중 선택 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          학년 <RequiredMark />
          <span className="ml-2 text-sm font-normal text-muted">
            여러 개 선택할 수 있습니다
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => {
            const on = grades.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGrade(g)}
                className={`min-h-11 rounded-full border px-4 text-base transition-colors ${
                  on
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-ink hover:bg-surface-alt"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
        <ErrorText text={err("grade")} />
      </fieldset>

      {/* 희망 과목 — 대표 과목 다중 선택 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          희망 과목 <RequiredMark />
          <span className="ml-2 text-sm font-normal text-muted">
            여러 개 선택할 수 있습니다
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {subjectOptions.map((s) => {
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
                {s.label}
              </button>
            );
          })}
        </div>
        <ErrorText text={err("subject")} />
      </fieldset>

      {/* 주소 — Daum 우편번호 검색 + 상세주소(선택) */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          주소 <RequiredMark />
        </legend>
        <div className="flex gap-2">
          <input
            type="text"
            value={baseAddress}
            readOnly
            aria-invalid={Boolean(err("address"))}
            placeholder="주소 검색을 눌러 주소를 선택해 주세요"
            className={`${inputClass(Boolean(err("address")))} cursor-default bg-surface-alt`}
          />
          <button
            type="button"
            onClick={openPostcode}
            className="min-h-12 shrink-0 rounded-lg border border-accent px-4 text-base font-semibold text-accent transition-colors hover:bg-accent/5"
          >
            주소 검색
          </button>
        </div>
        {baseAddress && (
          <div className="mt-3">
            <label htmlFor={`${uid}-address-detail`} className="sr-only">
              상세주소
            </label>
            <input
              id={`${uid}-address-detail`}
              type="text"
              value={addressDetail}
              maxLength={DETAIL_MAX}
              autoComplete="address-line2"
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="상세주소 (동·호수 등, 선택)"
              className={inputClass(false)}
            />
          </div>
        )}
        <ErrorText text={err("address")} />
      </fieldset>

      {/* 학교 — 선택. 자동완성 + 대체 선택지 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          학교{" "}
          <span className="text-sm font-normal text-muted">(선택)</span>
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

      {/* 희망 수업 형태 — 선택 */}
      <fieldset>
        <legend className="mb-2 block text-base font-semibold text-ink">
          희망 수업 형태{" "}
          <span className="text-sm font-normal text-muted">(선택)</span>
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
                onChange={() => setLessonType(t.value)}
                className="h-5 w-5 accent-accent"
              />
              <span className="text-base text-ink">{t.label}</span>
              <span className="text-sm text-muted">{t.hint}</span>
            </label>
          ))}
        </div>
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

      {/* 우편번호 검색 레이어 — 팝업 차단 없이 화면 안에서 검색한다. */}
      {postcodeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="우편번호 검색"
        >
          <div className="flex h-[70vh] max-h-[560px] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-base font-semibold text-ink">주소 검색</span>
              <button
                type="button"
                onClick={() => setPostcodeOpen(false)}
                className="min-h-11 rounded-md px-3 text-base text-muted hover:text-ink"
              >
                닫기
              </button>
            </div>
            <div ref={postcodeLayerRef} className="flex-1" />
          </div>
        </div>
      )}
    </form>
  );
}

/* ── Daum 우편번호 로딩·지역 해석 ─────────────────────────────────────── */

type DaumPostcodeData = {
  sido: string;
  sigungu: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  userSelectedType?: string;
};

type DaumPostcodeInstance = { open: () => void; embed: (el: HTMLElement) => void };
type DaumNamespace = {
  Postcode: new (opts: {
    oncomplete: (data: DaumPostcodeData) => void;
    width?: string | number;
    height?: string | number;
  }) => DaumPostcodeInstance;
};

/**
 * window.daum 접근 — 전역 타입 선언(declare global) 대신 지역 캐스팅으로 읽는다.
 * (같은 프로젝트의 다른 폼도 Window.daum 을 선언하므로 전역 병합 충돌을 피한다.)
 */
function getDaum(): DaumNamespace | undefined {
  return (window as unknown as { daum?: DaumNamespace }).daum;
}

const DAUM_POSTCODE_SRC =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

/** 공식 CDN 스크립트를 1회만 로드한다(폼이 있는 페이지에서만 실행). */
function loadDaumPostcode(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (getDaum()?.Postcode) return resolve();
    const existing = document.getElementById("daum-postcode-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }
    const s = document.createElement("script");
    s.id = "daum-postcode-script";
    s.src = DAUM_POSTCODE_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(s);
  });
}

/**
 * Daum 이 돌려준 시/도·시/군/구 표시명 → 기존 지역 코드(sido_code/sigungu_code).
 *
 * Daum 은 시/도를 약칭(서울·경기·강원…) 위주로, schools 캐시는 전체명(서울특별시…)으로 쓰므로
 * 시/도는 교육청 코드 별칭표로, 시/군/구는 같은 시/도의 후보에서 공백 무시 매칭으로 찾는다.
 * (regions 는 schools 캐시에서 파생되므로 코드/이름이 저장값과 정확히 일치한다.)
 * 매칭에 실패하면 null — 호출측이 재검색을 유도한다.
 */
const SIDO_CODE_BY_NAME: Record<string, string> = {
  서울: "B10", 서울특별시: "B10",
  부산: "C10", 부산광역시: "C10",
  대구: "D10", 대구광역시: "D10",
  인천: "E10", 인천광역시: "E10",
  광주: "F10", 광주광역시: "F10",
  대전: "G10", 대전광역시: "G10",
  울산: "H10", 울산광역시: "H10",
  세종: "I10", 세종특별자치시: "I10",
  경기: "J10", 경기도: "J10",
  강원: "K10", 강원도: "K10", 강원특별자치도: "K10",
  충북: "M10", 충청북도: "M10",
  충남: "N10", 충청남도: "N10",
  전북: "P10", 전라북도: "P10", 전북특별자치도: "P10",
  전남: "Q10", 전라남도: "Q10",
  경북: "R10", 경상북도: "R10",
  경남: "S10", 경상남도: "S10",
  제주: "T10", 제주도: "T10", 제주특별자치도: "T10",
};

function resolveRegion(
  regions: SidoOption[],
  sido: string,
  sigungu: string,
): { sidoCode: string; sigunguCode: string } | null {
  const code = SIDO_CODE_BY_NAME[(sido ?? "").trim()];
  if (!code) return null;
  const sidoOpt = regions.find((r) => r.code === code);
  if (!sidoOpt) return null;

  const norm = (s: string) => (s ?? "").replace(/\s+/g, "");
  const target = norm(sigungu);
  let match = target
    ? sidoOpt.sigungu.find((s) => norm(s.name) === target)
    : undefined;
  // 시/군/구가 비었거나(세종 등) 후보가 하나뿐이면 그 값을 쓴다.
  if (!match && sidoOpt.sigungu.length === 1) match = sidoOpt.sigungu[0];
  if (!match) return null;

  return { sidoCode: sidoOpt.code, sigunguCode: match.code };
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
