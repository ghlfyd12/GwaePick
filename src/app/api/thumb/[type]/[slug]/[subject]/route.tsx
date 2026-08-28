/**
 * pSEO 페이지별 동적 썸네일 이미지 생성 라우트 (파일럿 1단계).
 *
 * GET /api/thumb/{type}/{slug}/{subject} → 800×600 PNG
 *   - type: 현재 "school" 만 유효(지역·기타는 파일럿 제외 → 404).
 *   - slug: 학교 slug. findSchoolBySlug 로 검증하며, 파일럿은 고등학교(level:"high")만 허용.
 *   - subject: 핵심 5과목(국어/영어/수학/사회/과학) slug 만 허용. 그 외 404.
 *
 * 이미지 문구는 "{학교명} {과목}과외" 만 넣는다(성과 보장·과장·연락처 등 금지, 느낌표 금지).
 * 디자인: 학습 사진 배경(기존 에셋 재사용) + 중앙 흰 가로 띠 + 주황(#FF6B4A) 볼드 텍스트 + 검정 외곽선.
 * 폰트: Pretendard Bold 서브셋(ttf, wght 700 고정, 현대 한글 완성형 전체).
 *
 * 캐시: 조합이 결정론적이라 장기 immutable 캐시(재배포 시 Vercel CDN 이 배포 단위로 무효화).
 * 유효 조합만 생성하고 그 외는 404 로 막아 스팸 생성으로 인한 비용 폭증을 차단한다.
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findSchoolBySlug } from "@/lib/findSchool";
import { subjectBySlug } from "@/data/subjects";
import { getSido } from "@/data/sidoRegions";
import { findDong } from "@/data/gyeonggi";
import { getLandingRegion } from "@/data/mainDistricts";
import { THUMB_SUBJECTS, THUMB_SIZE } from "@/lib/thumb";

export const runtime = "nodejs";
// 시간 기반 재생성 없음 — 콘텐츠는 slug×과목으로 결정론적.
export const dynamic = "force-static";
export const revalidate = false;

const { width: W, height: H } = THUMB_SIZE;

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
      join(process.cwd(), "public/images/school-students.png"),
    ).then((b) => `data:image/png;base64,${b.toString("base64")}`);
  }
  return bgPromise;
}

/* ── 텍스트 레이아웃 ────────────────────────────────────────────────────
 * 텍스트를 주인공으로 — 더 긴 줄이 이미지 폭의 ~90%(=TARGET_W)를 채우도록 폰트를 최대한 키운다.
 * 학교명(데이터 약칭 기준) 글자 수로 두 갈래(둘 다 2줄·동일 폰트/띠 높이로 톤 통일):
 *   - 4자 이하: "{학교명}" / "{과목}과외" 2줄(학교명 표기).
 *   - 5자 이상: 긴 이름을 이미지에 넣으면 폰트가 작아져 가독성이 떨어지므로
 *     "1:1" / "{과목}과외" 2줄 폴백(학교명은 alt·본문에만 유지, 이미지에는 미표기).
 */
const TARGET_W = Math.round(W * 0.9); // 720px — 텍스트가 채울 목표 폭
const MAX_FS = 180; // 2줄이 세로로 넘치지 않는 상한(짧은 이름의 과확대 방지)
const MIN_FS = 40; // 하한
/** 학교명 표기 최대 글자 수(코드포인트) — 이보다 길면 폴백. */
const NAME_MAX_CHARS = 4;

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

/** 폭 90%를 채우는 폰트 크기 — 가장 넓은 줄 기준, 상·하한 클램프. */
function fitFontSize(lines: string[]): number {
  const widest = Math.max(...lines.map(estEm));
  return Math.max(MIN_FS, Math.min(MAX_FS, Math.floor(TARGET_W / widest)));
}

type Layout = { lines: string[]; fontSize: number };
const withFit = (lines: string[]): Layout => ({ lines, fontSize: fitFontSize(lines) });

/** 중·고 학교(기존 규칙 불변): 4자 이하 학교명 표기, 5자 이상 "1:1" 폴백. */
function layoutSchool(name: string, subjectLabel: string): Layout {
  const suffix = `${subjectLabel}과외`;
  const nameChars = [...name].length;
  if (nameChars <= NAME_MAX_CHARS) return withFit([name, suffix]);
  return withFit(["1:1", suffix]); // 예: "1:1" / "수학과외"
}

/** 초등: 시군구 지역명 표기(학교 데이터에 동 없음) / "1:1 {과목}과외". */
function layoutSchoolElem(sigunguName: string, subjectLabel: string): Layout {
  return withFit([sigunguName, `1:1 ${subjectLabel}과외`]);
}

/** 지역(동)×과목: 동명(넘치면 축소) / "{과목}과외". */
function layoutRegion(dongName: string, subjectLabel: string): Layout {
  return withFit([dongName, `${subjectLabel}과외`]);
}

/** 과목 상세: "{과목}과외" / "1:1 내신 기출". */
function layoutSubject(subjectLabel: string): Layout {
  return withFit([`${subjectLabel}과외`, "1:1 내신 기출"]);
}

/** 지역 랜딩: 지명(축소) / "1:1 과외". */
function layoutLanding(regionName: string): Layout {
  return withFit([regionName, "1:1 과외"]);
}

/** 동 해석(경기=gyeonggi.ts / 그 외=sidoRegions) → 동명. */
function resolveDongName(sidoSlug: string, sgSlug: string, dongSlug: string): string | null {
  const sd = getSido(sidoSlug);
  const dong = sd?.sigungu.find((s) => s.slug === sgSlug)?.dong.find((d) => d.slug === dongSlug);
  if (dong) return dong.name;
  const g = findDong(sgSlug, dongSlug); // 경기 pSEO(한글 slug)
  return g ? g.name : null;
}

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; slug: string; subject: string }> },
) {
  const { type, slug, subject } = await params;

  // ── 검증 우선(이미지 생성 전) — 무효 조합은 여기서 전부 404 ──────────
  let picked: Layout | null = null;

  if (type === "school") {
    // 학교×과목 — 초·중·고 전체 × 8과목. 초등은 시군구 지역명 표기.
    const subjectSlug = slugKey(subject);
    if (!THUMB_SUBJECTS.has(subjectSlug)) return notFound();
    const subj = subjectBySlug[subjectSlug];
    if (!subj) return notFound();
    const ctx = findSchoolBySlug(slugKey(slug));
    if (!ctx) return notFound();
    picked =
      ctx.school.level === "elem"
        ? layoutSchoolElem(ctx.sigunguName, subj.label)
        : layoutSchool(ctx.school.name, subj.label);
  } else if (type === "region") {
    // 지역(동)×과목 — slug = "{sido}~{시군구}~{동}".
    const subjectSlug = slugKey(subject);
    if (!THUMB_SUBJECTS.has(subjectSlug)) return notFound();
    const subj = subjectBySlug[subjectSlug];
    if (!subj) return notFound();
    const parts = slugKey(slug).split("~");
    if (parts.length !== 3) return notFound();
    const dongName = resolveDongName(parts[0], parts[1], parts[2]);
    if (!dongName) return notFound();
    picked = layoutRegion(dongName, subj.label);
  } else if (type === "subject") {
    // 과목 상세 — slug = 과목slug(3번째 세그먼트는 자리표시자).
    const subjectSlug = slugKey(slug);
    if (!THUMB_SUBJECTS.has(subjectSlug)) return notFound();
    const subj = subjectBySlug[subjectSlug];
    if (!subj) return notFound();
    picked = layoutSubject(subj.label);
  } else if (type === "landing") {
    // 지역 랜딩 — slug = regionId(한글). getLandingRegion 로 검증.
    const r = getLandingRegion(slugKey(slug));
    if (!r) return notFound();
    picked = layoutLanding(r.name);
  } else {
    return notFound();
  }

  // ── 검증 통과 후에만 렌더 ────────────────────────────────────────────
  const { lines, fontSize } = picked;
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
        {/* 밝은 오버레이 — 사진을 은은한 배경 질감 수준으로 낮춰 텍스트가 주인공이 되게 한다. */}
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
        {/* 중앙 흰 가로 띠 — 커진 텍스트를 감싸도록 높이 확대(패딩), 폭 100%, 수직 중앙 */}
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
                color: "#FF6B4A",
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
