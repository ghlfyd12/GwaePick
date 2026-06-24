"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";
import { schoolLevels, subjects } from "@/data/categories";

/*
 * ConsultForm(#consult) — 무료 상담 신청 섹션 + 폼.
 *
 * 톤: 레퍼런스 기준 진녹색 + 카카오 옐로우(연한 녹색 배경 위 흰 카드). 차분한 신뢰감.
 * 전화번호(CONSULT_PHONE)를 가장 크게 강조, tel: 링크로 즉시 연결.
 * 학년·과목은 다중 선택(categories.ts 재사용), 주소는 Daum 우편번호로 채운다.
 * 제출은 POST /api/consult → 성공 시 안심 메시지로 교체. (실제 리드 전송 백엔드는 다음 단계)
 *
 * 색 메모: 포인트색은 사이트 전역 브랜드 주황 토큰(accent / accent-dark)을 그대로 사용한다.
 *   메인 "무료 상담 신청"·플로팅 버튼과 동일 색. 카카오 버튼만 카카오 옐로우 유지(브랜드색).
 */

const CONSULT_PHONE = "010-2177-2720";
// 실제 카카오 채널 주소가 정해지면 이 상수만 교체한다.
const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_여기에_채널주소";

type FormState = {
  name: string;
  phone: string;
  grades: string[];
  subjects: string[];
  address: string;
  addressDetail: string;
  message: string;
  agree: boolean;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  grades: [],
  subjects: [],
  address: "",
  addressDetail: "",
  message: "",
  agree: false,
};

type Errors = Partial<Record<keyof FormState, string>>;

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: {
        oncomplete: (data: {
          address: string;
          roadAddress: string;
          jibunAddress: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

export default function ConsultForm({
  defaultMessage = "",
}: {
  /** 문의사항 프리필(예: "{지역} {과목} 과외 문의드립니다."). */
  defaultMessage?: string;
} = {}) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, message: defaultMessage });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const addressDetailRef = useRef<HTMLInputElement>(null);

  const gradeOptions = schoolLevels.map((s) => s.title);
  const subjectOptions = subjects.map((s) => s.title);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "학생 이름을 입력해 주세요.";
    const digits = form.phone.replace(/[^0-9]/g, "");
    if (!form.phone.trim()) e.phone = "연락처를 입력해 주세요.";
    else if (!/^[0-9-]+$/.test(form.phone) || digits.length < 9 || digits.length > 11)
      e.phone = "연락처 형식을 확인해 주세요. (숫자/하이픈)";
    if (form.grades.length === 0) e.grades = "학년을 1개 이상 선택해 주세요.";
    if (form.subjects.length === 0) e.subjects = "과목을 1개 이상 선택해 주세요.";
    if (!form.address.trim()) e.address = "주소를 검색해 주세요.";
    if (!form.agree) e.agree = "개인정보 수집·이용에 동의해 주세요.";
    return e;
  };

  const openPostcode = () => {
    if (!window.daum?.Postcode) {
      alert("주소 검색을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        set("address", data.roadAddress || data.address || data.jibunAddress);
        addressDetailRef.current?.focus(); // 주소 선택 후 상세주소로 포커스
      },
    }).open();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="consult"
      aria-labelledby="consult-heading"
      className="border-t border-line bg-accent/5 px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* Daum 우편번호 스크립트 — 클라이언트 로드(키 불필요) */}
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

      <div className="mx-auto w-full max-w-[600px] rounded-3xl bg-white p-6 shadow-md ring-1 ring-black/5 sm:p-9">
        {status === "success" ? (
          <SuccessMessage phone={CONSULT_PHONE} />
        ) : (
          <>
            {/* 헤더 */}
            <div className="text-center">
              <p className="text-sm font-semibold text-accent">문의 및 신청</p>
              <h2
                id="consult-heading"
                className="mt-2 text-4xl font-bold leading-tight text-ink md:text-5xl"
              >
                체험 수업
                <br />
                <span className="text-accent">신청하기</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted md:text-lg">
                데이터로 검증된 우리 학교 맞춤 전략, 지금 바로 확인 가능합니다.
                상세한 상담을 원하신다면 아래 내용을 작성해 주세요.
              </p>
            </div>

            {/* 전화 / 카카오 버튼 — 전화 강조. 모바일 세로 스택(전화 위) → sm+ 동일폭 2열(50:50). */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={`tel:${CONSULT_PHONE}`}
                className="flex min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-accent bg-white px-3 py-3.5 text-accent transition-colors hover:bg-accent/5"
              >
                <PhoneIcon />
                <span className="whitespace-nowrap text-xl font-extrabold leading-none tracking-tight md:text-2xl">
                  {CONSULT_PHONE}
                </span>
              </a>
              <a
                href={KAKAO_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-3 py-3.5 text-base font-bold text-[#3C1E1E] transition-[filter] hover:brightness-95 sm:text-lg"
              >
                <ChatIcon />
                <span className="whitespace-nowrap">카카오 채널 상담</span>
              </a>
            </div>

            {/* 폼 */}
            <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
              {/* 이름 + 연락처 (데스크톱 2열) */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="학생 이름" required error={errors.name}>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="이름"
                      className={inputCls(!!errors.name)}
                    />
                  )}
                </Field>
                <Field label="상담받으실 연락처" required error={errors.phone}>
                  {(id) => (
                    <input
                      id={id}
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="010-0000-0000"
                      className={inputCls(!!errors.phone)}
                    />
                  )}
                </Field>
              </div>

              {/* 학년 (다중) */}
              <Field label="학년" required hint="(중복 선택 가능)" error={errors.grades}>
                {(id) => (
                  <MultiSelect
                    id={id}
                    placeholder="학년을 선택해주세요"
                    options={gradeOptions}
                    selected={form.grades}
                    onChange={(v) => set("grades", v)}
                    invalid={!!errors.grades}
                  />
                )}
              </Field>

              {/* 과목 (다중) */}
              <Field label="희망 과목" required hint="(중복 선택 가능)" error={errors.subjects}>
                {(id) => (
                  <MultiSelect
                    id={id}
                    placeholder="과목을 선택해주세요"
                    options={subjectOptions}
                    selected={form.subjects}
                    onChange={(v) => set("subjects", v)}
                    invalid={!!errors.subjects}
                  />
                )}
              </Field>

              {/* 주소 + 검색 버튼 */}
              <Field label="주소" required error={errors.address}>
                {(id) => (
                  <div className="flex gap-2">
                    <input
                      id={id}
                      type="text"
                      value={form.address}
                      readOnly
                      onClick={openPostcode}
                      placeholder="주소 검색을 눌러 입력하세요"
                      className={`${inputCls(!!errors.address)} cursor-pointer`}
                    />
                    <button
                      type="button"
                      onClick={openPostcode}
                      className="shrink-0 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-dark md:text-lg"
                    >
                      주소 검색
                    </button>
                  </div>
                )}
              </Field>

              {/* 상세주소 */}
              <Field label="상세주소">
                {(id) => (
                  <input
                    id={id}
                    ref={addressDetailRef}
                    type="text"
                    value={form.addressDetail}
                    onChange={(e) => set("addressDetail", e.target.value)}
                    placeholder="동·호수 등 상세주소 (선택)"
                    className={inputCls(false)}
                  />
                )}
              </Field>

              {/* 문의사항 */}
              <Field label="문의사항" hint="(선택)">
                {(id) => (
                  <textarea
                    id={id}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    rows={3}
                    placeholder="궁금한 점을 자유롭게 적어주세요."
                    className={`${inputCls(false)} resize-none`}
                  />
                )}
              </Field>

              {/* 동의 체크박스 */}
              <div>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={(e) => set("agree", e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-line accent-accent"
                  />
                  <span className="text-sm leading-relaxed text-ink md:text-base">
                    개인정보(이름·연락처·주소) 수집·이용에 동의합니다.
                  </span>
                </label>
                {errors.agree && <ErrorText>{errors.agree}</ErrorText>}
              </div>

              {/* 제출 */}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-1 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-accent px-6 text-lg font-bold text-white shadow-md transition-colors hover:bg-accent-dark disabled:opacity-60 md:text-xl"
              >
                {status === "submitting" ? "접수 중…" : "체험 수업 신청하기 →"}
              </button>

              {status === "error" && (
                <p className="text-center text-sm text-red-600">
                  잠시 후 다시 시도하거나{" "}
                  <a href={`tel:${CONSULT_PHONE}`} className="font-bold underline">
                    {CONSULT_PHONE}
                  </a>
                  으로 전화 주세요.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </section>
  );
}

/* ── 안심 완료 메시지 ─────────────────────────────────────────────── */
function SuccessMessage({ phone }: { phone: string }) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="mt-5 text-2xl font-bold text-ink sm:text-3xl">
        신청이 접수되었습니다.
      </h2>
      <p className="mt-3 text-base text-muted md:text-lg">
        담당선생님이 곧 연락드립니다.
      </p>
      <p className="mt-5 text-sm text-muted">
        상담 → 맞춤 선생님 소개 → 첫 수업 무료 체험
      </p>
      <a
        href={`tel:${phone}`}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-accent bg-white px-5 py-3 text-accent transition-colors hover:bg-accent/5"
      >
        <PhoneIcon />
        <span className="text-base font-semibold md:text-lg">
          더 빠른 상담은 전화 주세요 →{" "}
          <span className="text-lg font-extrabold md:text-xl">{phone}</span>
        </span>
      </a>
    </div>
  );
}

/* ── 다중 선택 드롭다운 ───────────────────────────────────────────── */
function MultiSelect({
  id,
  placeholder,
  options,
  selected,
  onChange,
  invalid,
}: {
  id?: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt],
    );

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-4 py-3 text-left text-base md:text-lg ${
          invalid ? "border-red-400" : "border-line"
        }`}
      >
        <span className={selected.length ? "text-ink" : "text-muted"}>
          {selected.length ? selected.join(", ") : placeholder}
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable
          className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-line bg-white p-1 shadow-lg"
        >
          {options.map((opt) => {
            const on = selected.includes(opt);
            return (
              <li key={opt} role="option" aria-selected={on}>
                <button
                  type="button"
                  onClick={() => toggle(opt)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-base hover:bg-surface-alt md:text-lg"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      on ? "border-accent bg-accent" : "border-[#D1D5DB]"
                    }`}
                  >
                    {on && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="text-ink">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── 공통 필드 래퍼(라벨-입력 연결: 자식에 id 주입) ───────────────── */
function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-ink md:text-base"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
        {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
      </label>
      {children(id)}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-sm text-red-600">{children}</p>;
}

const inputCls = (invalid: boolean) =>
  `min-h-12 w-full rounded-lg border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 md:text-lg ${
    invalid
      ? "border-red-400 focus:ring-red-200"
      : "border-line focus:ring-accent/30 focus:border-accent"
  }`;

/* ── 아이콘 ──────────────────────────────────────────────────────── */
function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.7 2.5-.8 2.9 0 0 0 .2.1.3.1 0 .2 0 .3-.1.3-.2 2.8-1.9 3.6-2.5.6.1 1.3.2 1.9.2 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
    </svg>
  );
}
