/**
 * 어학의참견(/power) 지역×시험·지역×회화 페이지별 동적 썸네일 라우트.
 *
 * GET /api/power-thumb/{kind}/{region}/{item} → 800×600 PNG
 *   - kind: "exam"(지역×시험) | "conversation"(지역×회화·과외 subject)
 *   - region: 지역 slug(한글) — 알려진 파워 지역/확장 지역만 허용, 그 외 404(스팸 생성 차단)
 *   - item: exam slug(examBySlug) 또는 회화 subject slug(POWER_SUBJECTS). 그 외 404.
 *
 * 지식의참견 썸네일(/api/thumb) 템플릿을 그대로 재사용하되, 텍스트 색만 보라(#7D0096)로,
 * 배경만 /power 자산(power-school-banner.png)으로 바꾼다. 오버레이·흰 띠·규격·폰트·캐시는 동일.
 * 문구는 데이터 파생만("{지역명}" / "{시험명}과외" 또는 subject.label) — 과장·느낌표·"원어민" 금지.
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

let bgPromise: Promise<string> | null = null;
function loadBackground(): Promise<string> {
  if (!bgPromise) {
    bgPromise = readFile(
      join(process.cwd(), "public/images/power-school-banner.png"),
    ).then((b) => `data:image/png;base64,${b.toString("base64")}`);
  }
  return bgPromise;
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
function resolveLines(
  kind: string,
  regionParam: string,
  itemSlug: string,
): [string, string] | null {
  if (kind === "exam") {
    const d = buildByExamData(regionParam, itemSlug);
    if (!d) return null;
    return [d.regionName, `${d.exam.name}과외`];
  }
  if (kind === "conversation") {
    const d = buildByRegionData(regionParam, itemSlug);
    if (!d) return null;
    return [d.regionName, d.label]; // label = subject.label(영어회화·중국어과외 등)
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
  const lines = resolveLines(kind, regionParam, itemSlug);
  if (!lines) return notFound();
  const fontSize = fitFontSize(lines);
  const [fontData, bg] = await Promise.all([loadFont(), loadBackground()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bg}
          width={W}
          height={H}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            objectFit: "cover",
          }}
          alt=""
        />
        {/* 밝은 오버레이 — 배경을 은은한 질감으로 낮춰 텍스트가 주인공이 되게 한다(school 과 동일 55%). */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            background: "rgba(255,255,255,0.55)",
            display: "flex",
          }}
        />
        {/* 중앙 흰 가로 띠 */}
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.96)",
            paddingTop: 46,
            paddingBottom: 46,
            paddingLeft: 40,
            paddingRight: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: "Pretendard",
                fontWeight: 700,
                fontSize,
                lineHeight: 1.08,
                color: PURPLE,
                letterSpacing: "-0.02em",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {line}
            </div>
          ))}
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
