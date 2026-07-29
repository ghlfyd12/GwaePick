/**
 * 신청폼(표준폼) 선택지 로딩 — 서버 전용 단일 소스.
 *
 * /apply 페이지와 홈 #consult 섹션이 같은 선택지(지역·과목)를 쓰므로,
 * Supabase 조회를 이 모듈에 모은다(중복 정의 금지). 브라우저는 이 코드를 부르지 않는다.
 *
 * 지역은 schools 캐시에서 파생한다(별도 지역 테이블이 스키마에 없음).
 */
import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

export type SidoOption = {
  code: string;
  name: string;
  sigungu: { code: string; name: string }[];
};
export type SubjectOption = { id: number; name: string; group: string };

/** PostgREST 한 번 응답의 행 수 상한(Supabase 기본 1000) — 나눠 읽는다. */
const PAGE = 1000;

type RegionRow = {
  sido_code: string;
  sido_name: string;
  sigungu_code: string;
  sigungu_name: string;
};

/** schools 캐시 → 시/도 → 시/군/구 2단 선택지(중복 제거 + 가나다순). */
export async function fetchRegionOptions(): Promise<SidoOption[]> {
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
export async function fetchSubjectOptions(): Promise<SubjectOption[]> {
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
