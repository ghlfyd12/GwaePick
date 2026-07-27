import type { Metadata } from "next";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import ApplyForm, { type SidoOption, type SubjectOption } from "./ApplyForm";

/*
 * 과외 신청폼(/apply) — Phase 1.
 *
 * 서버 컴포넌트가 선택지(지역·과목)를 Supabase 에서 읽어 클라이언트 폼에 넘긴다.
 * 브라우저는 Supabase 를 직접 호출하지 않는다(RLS 로 anon 접근 차단 · 지시서 §1).
 * 제출은 POST /api/inquiries, 학교 자동완성은 GET /api/schools/search 를 쓴다.
 *
 * 지역 선택지는 schools 캐시에서 파생한다 — 별도 지역 테이블이 스키마에 없기 때문이다.
 * 하루 한 번만 다시 만든다(12,000여 행을 매 요청 훑지 않도록).
 */

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "과외 신청",
  description:
    "직접 가르쳐 온 상담 선생님이 지역·학교·과목에 맞는 선생님을 1:1로 연결해 드립니다. 신청은 무료입니다.",
  alternates: { canonical: "/apply" },
  /*
   * Phase 1 동안은 색인에서 제외한다 — 메인(/)의 무료 상담 섹션과 성격이 겹쳐
   * 브랜드 검색에서 서로 경쟁할 수 있다. 이 폼이 정식 신청 경로가 되면 해제한다.
   */
  robots: { index: false, follow: true },
};

/** PostgREST 한 번 응답의 행 수 상한(Supabase 기본 1000) — 나눠 읽는다. */
const PAGE = 1000;

type RegionRow = {
  sido_code: string;
  sido_name: string;
  sigungu_code: string;
  sigungu_name: string;
};

/** schools 캐시 → 시/도 → 시/군/구 2단 선택지(중복 제거 + 가나다순). */
async function fetchRegionOptions(): Promise<SidoOption[]> {
  const supabase = supabaseServer();
  const rows: RegionRow[] = [];

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("schools")
      .select("sido_code, sido_name, sigungu_code, sigungu_name")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    rows.push(...(data as RegionRow[]));
    if (data.length < PAGE) break;
  }

  const sidoMap = new Map<string, SidoOption>();
  for (const r of rows) {
    let sido = sidoMap.get(r.sido_code);
    if (!sido) {
      sido = { code: r.sido_code, name: r.sido_name, sigungu: [] };
      sidoMap.set(r.sido_code, sido);
    }
    if (!sido.sigungu.some((s) => s.code === r.sigungu_code)) {
      sido.sigungu.push({ code: r.sigungu_code, name: r.sigungu_name });
    }
  }

  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, "ko");
  const list = [...sidoMap.values()].sort(byName);
  for (const sido of list) sido.sigungu.sort(byName);
  return list;
}

/** subjects 시드 22건 → 과목 선택지(그룹 유지). */
async function fetchSubjectOptions(): Promise<SubjectOption[]> {
  const { data, error } = await supabaseServer()
    .from("subjects")
    .select("subject_id, subject_name, subject_group")
    .order("subject_id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({
    id: s.subject_id as number,
    name: s.subject_name as string,
    group: s.subject_group as string,
  }));
}

export default async function ApplyPage() {
  let regions: SidoOption[] = [];
  let subjects: SubjectOption[] = [];
  let loadFailed = false;

  if (!isSupabaseConfigured()) {
    loadFailed = true;
  } else {
    try {
      [regions, subjects] = await Promise.all([
        fetchRegionOptions(),
        fetchSubjectOptions(),
      ]);
    } catch (err) {
      // 선택지를 못 읽어도 페이지 자체는 뜬다(안내 문구로 대체).
      console.error("[apply] 선택지 로딩 실패:", (err as Error)?.message);
      loadFailed = true;
    }
  }

  return (
    <div className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            과외 신청
          </h1>
          <p className="mt-3 text-base text-muted sm:text-lg">
            직접 가르쳐 온 상담 선생님이 신청 내용을 먼저 살펴본 뒤, 지역과 학교
            상황에 맞는 선생님을 1:1로 연결해 드립니다. 신청과 상담은 무료입니다.
          </p>
        </header>

        {loadFailed ? (
          <p
            role="status"
            className="rounded-lg border border-line bg-white p-6 text-base text-muted"
          >
            신청에 필요한 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <ApplyForm regions={regions} subjects={subjects} />
        )}
      </div>
    </div>
  );
}
