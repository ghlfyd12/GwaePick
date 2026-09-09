/**
 * 어학의참견(/power) 지역×시험·회화 + 검고의참견(gumjung) 페이지별 동적 썸네일 (v4 사진형).
 *
 * GET /api/power-thumb/{kind}/{region}/{item}[?r=og|sq] → PNG
 *   - kind: "exam" | "conversation"(어학) | "gumjung-subject|region|level|guide"(검고)
 *   - region/item: 페이지 데이터 빌더로 유효 조합만 렌더, 그 외 404(스팸 생성 차단)
 *   - r: "og"(기본, 1.91:1 = 1200×630) | "sq"(1:1 = 1080×1080). 하단 앵커 디자인이라 비율별 개별 렌더.
 *
 * v4 구성: 로고 없는 인물 사진 배경(public/og-people) + 하단 다크 그라데이션 오버레이 위에
 *   ─ 좌하단 2줄(대형 키워드 / 보조), 우상단 뱃지 2개, 최하단 화이트 CTA바
 *   ("010-2177-2720 무료 시범수업 신청", 전화번호는 축 포인트색). 어학 퍼플·검고 청록.
 * 문구는 페이지 데이터 파생 + 고정 카피(느낌표·보장·수치 없음, "무료 시범수업" 고정 표현).
 * 폰트·immutable 캐시 유지. og URL 은 메타에서 v=4 로 캐시 무효화. 본체 코랄(/api/thumb) 무관.
 *
 * 인물 자산 규약(교체 시 파일만 교체): public/og-people/{power|gumjung}-{n}.jpg,
 *   축별 배열에서 hash(region+item)%N 로 분배. 현재는 로고-free 크롭 플레이스홀더.
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
import { getGumjungAge } from "@/data/gumjung/ages";
import { getGumjungSido } from "@/data/gumjung/schedule";

export const runtime = "nodejs";
// 비율(?r=og|sq)을 쿼리로 가르므로 dynamic — force-static 은 쿼리를 무시해 두 비율이 한 이미지로 합쳐진다.
// 렌더 결과는 조합·비율 결정론적 → immutable Cache-Control 로 CDN 이 전체 URL(쿼리 포함) 단위 캐시.
export const dynamic = "force-dynamic";
export const revalidate = false;

const PURPLE = "#7D0096"; // 어학 포인트색
const TEAL = "#0F766E"; // 검고 포인트색
const CTA_PHONE = "010-2177-2720";
const CTA_TEXT = "무료 시범수업 신청";

// 비율: og(1.91:1) 기본, sq(1:1). 하단 CTA바가 각 비율 실제 하단에 오도록 개별 렌더.
const RATIOS = { og: { W: 1200, H: 630 }, sq: { W: 1080, H: 1080 } } as const;
type RatioKey = keyof typeof RATIOS;

const slugKey = (s: string) => decodeURIComponent(s).normalize("NFC");

/* ── 에셋 로드(모듈 스코프 캐시) ──────────────────────────────────────── */
let fontPromise: Promise<Buffer> | null = null;
function loadFont(): Promise<Buffer> {
  if (!fontPromise) {
    fontPromise = readFile(join(process.cwd(), "src/fonts/Pretendard-Bold-subset.ttf"));
  }
  return fontPromise;
}

// 로고 없는 인물 자산(public/og-people). 축별 배열 — 자산 교체 시 같은 파일명 유지.
// 배정: power 1~5 = videocall·headset·phone·student·kid / gumjung 1~5 = young-m·young-f1·young-f2·adult-m·senior-f.
const PEOPLE: Record<string, string[]> = {
  power: ["power-1.jpg", "power-2.jpg", "power-3.jpg", "power-4.jpg", "power-5.jpg"],
  gumjung: ["gumjung-1.jpg", "gumjung-2.jpg", "gumjung-3.jpg", "gumjung-4.jpg", "gumjung-5.jpg"],
};
// 검고 가이드 유형별 인물 고정(권장 배정) — 성인 가이드 → 만학도 남(gumjung-4=adult-m).
// (그 외 검고 kind·가이드는 hash 분배로 5종 순환.)
const GUMJUNG_GUIDE_PEOPLE: Record<string, string> = {
  adult: "gumjung-4.jpg",
};
const bgCache: Record<string, Promise<string>> = {};
function loadBackground(file: string): Promise<string> {
  if (!bgCache[file]) {
    bgCache[file] = readFile(join(process.cwd(), "public/og-people", file)).then(
      (b) => `data:image/jpeg;base64,${b.toString("base64")}`,
    );
  }
  return bgCache[file];
}
function hashPick(key: string, arr: string[]): string {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}

/* ── 텍스트 폭 fit(대형 키워드가 세이프 폭을 넘지 않도록) ───────────────── */
function estEm(str: string): number {
  let w = 0;
  for (const ch of str) {
    const c = ch.codePointAt(0) ?? 0;
    if (ch === " ") w += 0.3;
    else if (c <= 0x7e) w += 0.5;
    else w += 1.0;
  }
  return w;
}
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
 * kind·region·item → {axis, l1(대형), l2(보조), badges[2]}. 페이지 데이터 빌더를 재사용해
 * 지역/급별/과목 표기가 실제 페이지와 일치. 빌더 null(무효 조합)이면 null → 404.
 */
type Content = { axis: "power" | "gumjung"; l1: string; l2: string; badges: [string, string] };
const GJ_BADGES: [string, string] = ["급별 1:1", "기초부터 준비"];
const LANG_BADGES: [string, string] = ["왕초보 1:1", "전화·화상 수업"];

function resolveContent(kind: string, regionParam: string, itemSlug: string): Content | null {
  if (kind === "exam") {
    const d = buildByExamData(regionParam, itemSlug);
    if (!d) return null;
    return { axis: "power", l1: `${d.regionName} ${d.exam.name}`, l2: "1:1 개인과외", badges: LANG_BADGES };
  }
  if (kind === "conversation") {
    const d = buildByRegionData(regionParam, itemSlug);
    if (!d) return null;
    return { axis: "power", l1: `${d.regionName} ${d.label}`, l2: "1:1 개인과외", badges: LANG_BADGES };
  }
  if (kind === "gumjung-subject") {
    const d = buildGumjungSubjectData(regionParam, itemSlug);
    if (!d) return null;
    return { axis: "gumjung", l1: `${d.subjectLabel} 검정고시`, l2: "1:1 맞춤 준비", badges: GJ_BADGES };
  }
  if (kind === "gumjung-region") {
    const d = buildGumjungRegionData(regionParam);
    if (!d) return null;
    return { axis: "gumjung", l1: `${d.regionName} 검정고시`, l2: "1:1 개인과외", badges: GJ_BADGES };
  }
  if (kind === "gumjung-level") {
    const level = getGumjungLevel(regionParam);
    if (!level) return null;
    return { axis: "gumjung", l1: `${level.name} 검정고시`, l2: "1:1 맞춤 준비", badges: GJ_BADGES };
  }
  if (kind === "gumjung-guide") {
    const guide = getGumjungGuide(regionParam);
    if (!guide) return null;
    return { axis: "gumjung", l1: `검정고시 ${guide.navLabel}`, l2: "1:1 맞춤 상담", badges: GJ_BADGES };
  }
  if (kind === "gumjung-age") {
    const age = getGumjungAge(regionParam);
    if (!age) return null;
    return { axis: "gumjung", l1: `${age.ageLabel} 검정고시`, l2: "1:1 맞춤 준비", badges: age.badges };
  }
  if (kind === "gumjung-schedule") {
    if (regionParam === "hub")
      return { axis: "gumjung", l1: "검정고시 일정", l2: "접수·시험 안내", badges: ["급별 1:1", "일정 안내"] };
    const sido = getGumjungSido(regionParam);
    if (!sido) return null;
    return { axis: "gumjung", l1: `${sido.short} 검정고시 일정`, l2: "접수·시험 안내", badges: ["급별 1:1", "일정 안내"] };
  }
  return null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ kind: string; region: string; item: string }> },
) {
  const { kind, region, item } = await params;
  const regionParam = slugKey(region);
  const itemSlug = slugKey(item);

  const c = resolveContent(kind, regionParam, itemSlug);
  if (!c) return notFound();

  const r: RatioKey = new URL(req.url).searchParams.get("r") === "sq" ? "sq" : "og";
  const { W, H } = RATIOS[r];
  const accent = c.axis === "gumjung" ? TEAL : PURPLE;
  const bgFile =
    kind === "gumjung-guide" && GUMJUNG_GUIDE_PEOPLE[regionParam]
      ? GUMJUNG_GUIDE_PEOPLE[regionParam]
      : hashPick(regionParam + itemSlug, PEOPLE[c.axis]);
  const [fontData, bg] = await Promise.all([loadFont(), loadBackground(bgFile)]);

  const padX = Math.round(W * 0.045);
  const ctaH = Math.max(64, Math.round(H * 0.12));
  const ctaFs = Math.round(ctaH * 0.4);
  const l1Fs = fitFontSize(c.l1, W - 2 * padX, 44, Math.round(H * 0.135));
  const l2Fs = Math.round(l1Fs * 0.42);
  const badgeFs = Math.round(H * 0.042);
  const textBottom = ctaH + Math.round(H * 0.06);

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, position: "relative", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bg}
          width={W}
          height={H}
          style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover", objectPosition: "center 18%" }}
          alt=""
        />
        {/* 하단 다크 그라데이션 — 텍스트 대비 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            display: "flex",
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 34%, rgba(0,0,0,0.42) 62%, rgba(0,0,0,0.86) 100%)",
          }}
        />
        {/* 우상단 뱃지 2개 */}
        <div
          style={{
            position: "absolute",
            top: padX,
            right: padX,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: Math.round(H * 0.022),
          }}
        >
          {c.badges.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                fontFamily: "Pretendard",
                fontWeight: 700,
                fontSize: badgeFs,
                color: "#FFFFFF",
                background: accent,
                borderRadius: 999,
                padding: `${Math.round(badgeFs * 0.4)}px ${Math.round(badgeFs * 0.85)}px`,
                letterSpacing: "-0.02em",
              }}
            >
              #{b}
            </div>
          ))}
        </div>
        {/* 좌하단 2줄 */}
        <div
          style={{
            position: "absolute",
            left: padX,
            right: padX,
            bottom: textBottom,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Pretendard", fontWeight: 700, fontSize: l1Fs, color: "#FFFFFF", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
            {c.l1}
          </div>
          <div style={{ display: "flex", fontFamily: "Pretendard", fontWeight: 700, fontSize: l2Fs, color: "#FFFFFF", letterSpacing: "-0.02em", marginTop: Math.round(H * 0.012), opacity: 0.95 }}>
            {c.l2}
          </div>
        </div>
        {/* 최하단 화이트 CTA 바 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: ctaH,
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Pretendard",
            fontWeight: 700,
            fontSize: ctaFs,
            color: "#1F2937",
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ display: "flex", color: accent }}>{CTA_PHONE}</span>
          <span style={{ display: "flex", marginLeft: Math.round(ctaFs * 0.5) }}>{CTA_TEXT}</span>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [{ name: "Pretendard", data: fontData, weight: 700, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
