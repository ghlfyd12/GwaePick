/*
 * 학교 slug 충돌 해소(방안 B) — 일회성/재사용 dedup 스크립트.
 *
 * 배경: schools.ts 의 slug 는 학교명 로마자만으로 생성돼 지역 정보가 없어, 동명 학교가
 *   같은 slug 로 충돌한다. findSchoolBySlug 는 첫 매칭만 반환하므로 나머지(2,800개)는
 *   URL 로 접근 불가한 "그림자" 상태가 된다.
 *
 * 규칙:
 *   - 충돌 그룹에서 findSchoolBySlug 순회 순서(시도→시군구→schools 배열 순)상 "첫 매칭"
 *     학교는 기존 slug 를 그대로 유지한다(이미 색인됐을 URL 보존 — 이 방안의 핵심).
 *   - 나머지(그림자) 학교에만 접미사를 부여한다:
 *       1) `{slug}-{시군구slug}`
 *       2) 그래도 충돌 시 `{slug}-{시도slug}-{시군구slug}`
 *       3) 그래도 충돌 시 `...-2`, `-3` … (숫자)
 *   - 시군구/시도 slug 는 데이터의 기존 값을 재사용한다(재로마자화 금지).
 *
 * 실행: node scripts/dedupe-school-slugs.ts
 *   (검증을 모두 통과할 때만 src/data/schools.ts 를 덮어쓴다. 하나라도 실패하면 쓰지 않고 중단.)
 */
import type { SchoolSido } from "@/data/schools";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

type Rule = "kept" | "sigungu" | "sidoSigungu" | "numeric";

/** 학교 신원(슬러그 제외) — 보존 검증용. 이름+학교급+시도+시군구가 같으면 같은 학교. */
const ident = (
  name: string,
  level: string,
  sidoLabel: string,
  sigunguName: string,
) => `${name}|${level}|${sidoLabel}|${sigunguName}`;

/** SCHOOLS 를 사람이 읽기 쉬운(학교 1줄) TS 리터럴로 직렬화. 문자열은 JSON.stringify 로 안전 이스케이프. */
function serialize(sidos: SchoolSido[]): string {
  const q = (s: string) => JSON.stringify(s);
  const lines: string[] = ["["];
  for (const sido of sidos) {
    lines.push(`  { label: ${q(sido.label)}, slug: ${q(sido.slug)}, sigungu: [`);
    for (const sg of sido.sigungu) {
      lines.push(`    { name: ${q(sg.name)}, slug: ${q(sg.slug)}, schools: [`);
      for (const sc of sg.schools) {
        lines.push(
          `      { name: ${q(sc.name)}, slug: ${q(sc.slug)}, level: ${q(sc.level)} },`,
        );
      }
      lines.push(`    ] },`);
    }
    lines.push(`  ] },`);
  }
  lines.push("]");
  return lines.join("\n");
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const schoolsPath = join(here, "..", "src", "data", "schools.ts");

  // 데이터는 파싱본을 import(신원·순서 그대로), 원본 텍스트는 prefix/suffix 보존용으로 읽는다.
  const mod = (await import(pathToFileURL(schoolsPath).href)) as {
    SCHOOLS: SchoolSido[];
  };
  const SCHOOLS = mod.SCHOOLS;
  const raw = readFileSync(schoolsPath, "utf8");

  const totalBefore = SCHOOLS.reduce(
    (n, sido) => n + sido.sigungu.reduce((m, sg) => m + sg.schools.length, 0),
    0,
  );

  // BEFORE: 첫 매칭 slug → 학교 신원 (변경 전 기준, 순회 순서 = findSchoolBySlug 와 동일)
  const before = new Map<string, string>();
  for (const sido of SCHOOLS)
    for (const sg of sido.sigungu)
      for (const sc of sg.schools)
        if (!before.has(sc.slug))
          before.set(sc.slug, ident(sc.name, sc.level, sido.label, sg.name));

  // 접미사 부여: 첫 등장 slug 는 유지, 이후 중복(그림자)에만 접미사.
  const used = new Set<string>();
  const counts: Record<Rule, number> = {
    kept: 0,
    sigungu: 0,
    sidoSigungu: 0,
    numeric: 0,
  };
  const examples: string[] = [];

  for (const sido of SCHOOLS)
    for (const sg of sido.sigungu)
      for (const sc of sg.schools) {
        if (!used.has(sc.slug)) {
          used.add(sc.slug);
          counts.kept++;
          continue;
        }
        const orig = sc.slug;
        let cand = `${orig}-${sg.slug}`;
        let rule: Rule = "sigungu";
        if (used.has(cand)) {
          cand = `${orig}-${sido.slug}-${sg.slug}`;
          rule = "sidoSigungu";
        }
        if (used.has(cand)) {
          const base = `${orig}-${sido.slug}-${sg.slug}`;
          let n = 2;
          while (used.has(`${base}-${n}`)) n++;
          cand = `${base}-${n}`;
          rule = "numeric";
        }
        used.add(cand);
        sc.slug = cand;
        counts[rule]++;
        if (examples.length < 8)
          examples.push(`  ${orig} → ${cand}  (${sc.name}, ${sido.label} ${sg.name})`);
      }

  // ── 무결성 검증 (실패 시 쓰지 않고 즉시 중단) ──────────────────────────
  const after = new Map<string, string>();
  for (const sido of SCHOOLS)
    for (const sg of sido.sigungu)
      for (const sc of sg.schools) {
        if (after.has(sc.slug))
          throw new Error(`유니크 검증 실패: slug 중복 "${sc.slug}"`);
        after.set(sc.slug, ident(sc.name, sc.level, sido.label, sg.name));
      }

  const totalAfter = after.size;
  if (totalAfter !== totalBefore)
    throw new Error(`학교 수 변동: ${totalBefore} → ${totalAfter}`);
  if (totalAfter !== 12097)
    throw new Error(`학교 총수 12097 아님: ${totalAfter}`);

  // 기존 slug 보존: BEFORE 첫 매칭 slug 가 AFTER 에도 동일 학교로 남아 있어야 한다.
  let preserved = 0;
  for (const [slug, id] of before) {
    const now = after.get(slug);
    if (now !== id)
      throw new Error(
        `기존 slug 보존 실패: "${slug}" 가 [${id}] → [${now ?? "없음"}] 로 바뀜`,
      );
    preserved++;
  }

  // ── 검증 통과 → 파일 쓰기 (prefix/suffix 는 원본 그대로, SCHOOLS 리터럴만 교체) ──
  const iSchools = raw.indexOf("export const SCHOOLS");
  const iHelpers = raw.indexOf("export const getSchoolSido");
  if (iSchools < 0 || iHelpers < 0)
    throw new Error("schools.ts 구조 파싱 실패(SCHOOLS/getSchoolSido 경계)");

  const date = new Date().toISOString().slice(0, 10);
  const prefix = raw
    .slice(0, iSchools)
    .replace(
      "// 자동 생성 파일. level: elem(초)/middle(중)/high(고)\n",
      "// 자동 생성 파일. level: elem(초)/middle(중)/high(고)\n" +
        `// dedup 적용(동명 학교 slug 충돌 해소 — 지역 접미사): ${date} · scripts/dedupe-school-slugs.ts\n`,
    );
  const suffix = raw.slice(iHelpers);
  const out = `${prefix}export const SCHOOLS: SchoolSido[] = ${serialize(SCHOOLS)};\n\n${suffix}`;
  writeFileSync(schoolsPath, out);

  // ── 리포트 ────────────────────────────────────────────────────────────
  const suffixed = counts.sigungu + counts.sidoSigungu + counts.numeric;
  console.log("=== dedupe-school-slugs 완료 ===");
  console.log(`학교 총수:            ${totalAfter} (불변 확인: ${totalBefore})`);
  console.log(`유니크 slug:          ${totalAfter} (중복 0)`);
  console.log(`기존 slug 유지:       ${counts.kept}`);
  console.log(`접미사 부여:          ${suffixed}`);
  console.log(`  - {slug}-{시군구}:        ${counts.sigungu}`);
  console.log(`  - {slug}-{시도}-{시군구}: ${counts.sidoSigungu}`);
  console.log(`  - 숫자 접미사:            ${counts.numeric}`);
  console.log(`기존 slug 보존 검증:  ${preserved}건 전부 동일 학교 (전후 매핑 불변)`);
  console.log("접미사 예시:");
  for (const e of examples) console.log(e);
}

main().catch((err: unknown) => {
  console.error(
    "dedupe 실패(파일 미변경):",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
