/**
 * 어학의참견(/power) 지역×시험·지역×회화 페이지별 동적 썸네일 라우트.
 *
 * GET /api/power-thumb/{kind}/{region}/{item} → 800×600 PNG
 *   - kind: "exam"(지역×시험) | "conversation"(지역×회화·과외 subject)
 *   - region: 지역 slug(한글) — 알려진 파워 지역/확장 지역만 허용, 그 외 404(스팸 생성 차단)
 *   - item: exam slug(examBySlug) 또는 회화 subject slug(POWER_SUBJECTS). 그 외 404.
 *
 * 구성: 성인 인물 배경(로고 크롭본 og-profiles/bg-exam·bg-conv) + 어두운 오버레이 위 4단 텍스트
 *   — 1줄 지역(흰), 2줄 "{시험/과목} 과외"(흰 볼드), 3줄 포인트(옐로), 하단 칩 3개(퍼플 #7D0096).
 * 문구는 데이터 파생 + 고정 카피(느낌표 없음). 규격 800×600·폰트·immutable 캐시 유지.
 * og URL 은 메타에서 v=2 파라미터로 캐시 무효화(레이아웃 개편 배포).
 *
 * 캐시: 조합 결정론적 → 장기 immutable(배포 단위 무효화). 유효 조합만 렌더, 그 외 404로 비용 상한.
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildByExamData } from "@/data/byRegionExam";
import { buildByRegionData } from "@/data/byRegionSubject";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

const W = 800;
const H = 600;
const PURPLE = "#7D0096";

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

/* ── 텍스트 레이아웃(지식의참견 템플릿과 동일 알고리즘) ─────────────────────
 * 2줄(지역명 / 접미어) 모두 동일 폰트로, 더 넓은 줄이 폭 90%를 채우도록 자동 크기.
 * 지역명은 항상 표기(1줄)하므로 school 의 "5자→1:1" 폴백은 두지 않는다.
 */
const TARGET_W = Math.round(W * 0.9); // 720px
const MAX_FS = 180;
const MIN_FS = 40;

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

function fitFontSize(lines: string[]): number {
  const widest = Math.max(...lines.map(estEm));
  return Math.max(MIN_FS, Math.min(MAX_FS, Math.floor(TARGET_W / widest)));
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
  const mainFs = Math.min(fitFontSize([c.main]), 116);
  const [fontData, bg] = await Promise.all([loadFont(), loadBackground(kind)]);
  const YELLOW = "#FFD84D";

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
        {/* 중앙 텍스트 구성(지역 / 주제 / 포인트 / 칩) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            padding: "0 48px",
          }}
        >
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 44, color: "#FFFFFF", letterSpacing: "-0.02em", display: "flex" }}>
            {c.region}
          </div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: mainFs, color: "#FFFFFF", letterSpacing: "-0.02em", whiteSpace: "nowrap", display: "flex" }}>
            {c.main}
          </div>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 46, color: YELLOW, letterSpacing: "-0.02em", display: "flex" }}>
            {c.point}
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 14, marginTop: 8 }}>
            {c.chips.map((chip, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: 30,
                  color: "#FFFFFF",
                  background: PURPLE,
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
