/**
 * 어학의참견(/power) 지역×시험·지역×회화 페이지별 동적 썸네일 라우트.
 *
 * GET /api/power-thumb/{kind}/{region}/{item} → 800×600 PNG
 *   - kind: "exam"(지역×시험) | "conversation"(지역×회화·과외 subject)
 *          | "gumjung-subject"(급별×과목) | "gumjung-region"(지역×검정고시)
 *          | "gumjung-level"(급별 상세) | "gumjung-guide"(유형 가이드) — 검고(청록 칩)
 *   - region: 지역 slug(한글) — 알려진 파워 지역/확장 지역만 허용, 그 외 404(스팸 생성 차단)
 *   - item: exam slug(examBySlug) 또는 회화 subject slug(POWER_SUBJECTS). 그 외 404.
 *
 * 구성: 성인 인물 배경(로고 크롭본 og-profiles/bg-exam·bg-conv) + 어두운 오버레이 위 3단 텍스트
 *   — 1줄 지역(흰), 2줄 "{시험/과목} 과외"(흰 볼드, 세이프존 폭 최대 fit), 칩 2개(#1:1맞춤·#첫상담무료,
 *   퍼플 #7D0096 / 검고는 청록). 모든 텍스트를 중앙 600×600 정사각 크롭 세이프존 안에 배치.
 * 문구는 데이터 파생 + 고정 카피(느낌표 없음). 규격 800×600·폰트·immutable 캐시 유지.
 * og URL 은 메타에서 v=3 파라미터로 캐시 무효화(정사각 크롭 대응·3단 개편 배포).
 *
 * 캐시: 조합 결정론적 → 장기 immutable(배포 단위 무효화). 유효 조합만 렌더, 그 외 404로 비용 상한.
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildByExamData } from "@/data/byRegionExam";
import { buildByRegionData } from "@/data/byRegionSubject";
import { buildGumjungSubjectData } from "@/data/gumjung/subjects";
import { buildGumjungRegionData } from "@/data/byRegionGumjung";
import { getGumjungLevel } from "@/data/gumjung/levels";
import { getGumjungGuide } from "@/data/gumjung/guides";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

const W = 800;
const H = 600;
const PURPLE = "#7D0096"; // 어학의참견 칩색(기존)
const TEAL = "#0F766E"; // 검고의참견 칩색(청록)

const slugKey = (s: string) => decodeURIComponent(s).normalize("NFC");

/* ── 에셋 로드(모듈 스코프 1회 캐시) ──────────────────────────────────── */
let fontPromise: Promise<Buffer> | null = null;
function loadFont(): Promise<Buffer> {
  if (!fontPromise) {
    fontPromise = readFile(
      join(process.cwd(), "src/fonts/Pretendard-Bold-subset.ttf"),
    );
  }
  return fontPromise;
}

// 배경: og-profiles 성인 인물을 로고 없는 우측 영역만 크롭해 재구성한 800×600 배경
// (bg-exam=4.jpg 남성·bg-conv=2.jpg 여성). 지식의참견 로고·워드마크 완전 제외 — 브랜드 혼선 방지.
const bgCache: Record<string, Promise<string>> = {};
function loadBackground(kind: string): Promise<string> {
  const file = kind === "exam" ? "bg-exam.jpg" : "bg-conv.jpg";
  if (!bgCache[file]) {
    bgCache[file] = readFile(join(process.cwd(), "public/og-profiles", file)).then(
      (b) => `data:image/jpeg;base64,${b.toString("base64")}`,
    );
  }
  return bgCache[file];
}

/* ── 텍스트 레이아웃 — 정사각(600×600) 세이프 존 대응 ──────────────────────
 * og:image 는 800×600 이지만 SNS·검색이 중앙 정사각(600×600)으로 크롭하는 경우가 많아,
 * 모든 텍스트를 중앙 600 폭(좌우 여백 제외 560) 세이프 존 안에 배치하고 그 폭에 맞춰
 * 최대 크기로 fit 한다(포인트 줄 제거로 확보한 세로 공간만큼 큰 제목 상한도 상향).
 */
const SAFE_W = 600; // 중앙 정사각 크롭 세이프 존 폭
const CONTENT_W = 560; // 세이프 존 내 텍스트 최대 폭(좌우 여백)
const MAIN_MAX = 150; // 큰 제목 상한(세로 공간 확보분 반영)
const MAIN_MIN = 44;
const REGION_MAX = 60; // 지역 줄 상한(기존 44 → 확대, 동명 식별)
const REGION_MIN = 32;

/** 한글=1em, ASCII≈0.56em, 공백≈0.34em 근사 폭. */
function estEm(str: string): number {
  let w = 0;
  for (const ch of str) {
    const c = ch.codePointAt(0) ?? 0;
    if (ch === " ") w += 0.34;
    else if (c <= 0x7e) w += 0.56;
    else w += 1.0;
  }
  return w;
}

/** 문자열이 targetW(px) 폭을 넘지 않는 최대 폰트 크기(min~max clamp). */
function fitFontSize(str: string, targetW: number, minFs: number, maxFs: number): number {
  return Math.max(minFs, Math.min(maxFs, Math.floor(targetW / estEm(str))));
}

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

/**
 * kind·region·item → 2줄 문구. 페이지 데이터 빌더(byRegionExam·byRegionSubject)를 그대로
 * 재사용해 지역명 표기가 실제 페이지 H1/메타와 정확히 일치하게 한다(재해석 불일치 방지).
 * 빌더가 null(무효 조합/미존재 지역)이면 null → 404.
 */
type Content = { region: string; main: string; point: string; chips: string[] };
function resolveContent(kind: string, regionParam: string, itemSlug: string): Content | null {
  if (kind === "exam") {
    const d = buildByExamData(regionParam, itemSlug);
    if (!d) return null;
    return {
      region: d.regionName,
      main: `${d.exam.name} 과외`,
      point: "목표 점수까지 1:1 관리",
      chips: ["#1:1맞춤", "#기출분석", "#첫상담무료"],
    };
  }
  if (kind === "conversation") {
    const d = buildByRegionData(regionParam, itemSlug);
    if (!d) return null;
    const main = d.label.endsWith("과외") ? d.label : `${d.label} 과외`;
    return {
      region: d.regionName,
      main,
      point: "왕초보도 1:1로 시작",
      chips: ["#1:1맞춤", "#원어민·교포", "#첫상담무료"],
    };
  }
  // ── 검고의참견(청록) kind — additive. 기존 exam·conversation 경로/출력 무변경. ──
  if (kind === "gumjung-subject") {
    // region=급별 slug, item=과목 slug → "{급별} 검정고시" / "{과목} 과외"
    const d = buildGumjungSubjectData(regionParam, itemSlug);
    if (!d) return null;
    return {
      region: `${d.levelName} 검정고시`,
      main: `${d.subjectLabel} 과외`,
      point: "1:1 맞춤 준비",
      chips: ["#1:1맞춤", "#개념부터", "#첫상담무료"],
    };
  }
  if (kind === "gumjung-region") {
    // region=지역 slug, item 무시 → "{지역}" / "검정고시 과외"
    const d = buildGumjungRegionData(regionParam);
    if (!d) return null;
    return {
      region: d.regionName,
      main: "검정고시 과외",
      point: "고졸·중졸 1:1 준비",
      chips: ["#1:1맞춤", "#급별 안내", "#첫상담무료"],
    };
  }
  if (kind === "gumjung-level") {
    // region=급별 slug, item 무시 → "검고의참견" / "{급별} 검정고시"
    const level = getGumjungLevel(regionParam);
    if (!level) return null;
    return {
      region: "검고의참견",
      main: `${level.name} 검정고시`,
      point: "나에게 맞는 속도로",
      chips: ["#1:1맞춤", "#급별 준비", "#첫상담무료"],
    };
  }
  if (kind === "gumjung-guide") {
    // region=유형 slug, item 무시 → "검정고시 가이드" / "{유형}"
    const guide = getGumjungGuide(regionParam);
    if (!guide) return null;
    return {
      region: "검정고시 가이드",
      main: guide.navLabel,
      point: "1:1 맞춤 상담",
      chips: ["#1:1맞춤", "#유형별", "#첫상담무료"],
    };
  }
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string; region: string; item: string }> },
) {
  const { kind, region, item } = await params;
  const regionParam = slugKey(region);
  const itemSlug = slugKey(item);

  // ── 검증 우선(렌더 전) — 무효 조합 404(페이지 빌더 기준으로 존재하는 조합만) ──
  const c = resolveContent(kind, regionParam, itemSlug);
  if (!c) return notFound();
  // 세이프 존(560px) 폭에 맞춰 각 줄 최대 크기로 fit — 포인트 줄 제거로 큰 제목 상한 상향.
  const mainFs = fitFontSize(c.main, CONTENT_W, MAIN_MIN, MAIN_MAX);
  const regionFs = fitFontSize(c.region, CONTENT_W, REGION_MIN, REGION_MAX);
  // 칩 2개(각 kind 배열의 첫·끝 = #1:1맞춤 · #첫상담무료)로 통일.
  const chips = [c.chips[0], c.chips[c.chips.length - 1]];
  const [fontData, bg] = await Promise.all([loadFont(), loadBackground(kind)]);
  // 칩색: 검고(청록) / 그 외(어학 퍼플). 기존 exam·conversation 은 PURPLE 유지 → 출력 무변경.
  const chipColor = kind.startsWith("gumjung") ? TEAL : PURPLE;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bg}
          width={W}
          height={H}
          style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }}
          alt=""
        />
        {/* 어두운 반투명 오버레이 — 텍스트 대비 확보 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            background: "rgba(20,10,28,0.62)",
            display: "flex",
          }}
        />
        {/* 중앙 텍스트 3단(지역 / 큰 제목 / 칩 2개) — 중앙 600 세이프 존 안에 배치 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            width: SAFE_W,
            padding: "0 20px",
          }}
        >
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: regionFs, color: "#FFFFFF", letterSpacing: "-0.02em", whiteSpace: "nowrap", display: "flex" }}>
            {c.region}
          </div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: mainFs, color: "#FFFFFF", letterSpacing: "-0.02em", whiteSpace: "nowrap", display: "flex" }}>
            {c.main}
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 14, marginTop: 4 }}>
            {chips.map((chip, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: 30,
                  color: "#FFFFFF",
                  background: chipColor,
                  borderRadius: 999,
                  padding: "10px 22px",
                  display: "flex",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Pretendard", data: fontData, weight: 700, style: "normal" },
      ],
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
