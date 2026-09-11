/**
 * 어학의참견(/power) 지역×시험·회화 + 검고의참견(gumjung) 페이지별 동적 썸네일 (v8 세이프 존·좌측 정렬·풀블리드).
 *
 * GET /api/power-thumb/{kind}/{region}/{item}[?r=og|sq] → PNG
 *   - kind: "exam" | "conversation"(어학) | "gumjung-subject|region|level|guide|age|schedule"(검고)
 *   - region/item: 페이지 데이터 빌더로 유효 조합만 렌더, 그 외 404(스팸 생성 차단)
 *   - r: "og"(기본, 1.91:1 = 1200×630) | "sq"(1:1 = 1080×1080). 하단 앵커 디자인이라 비율별 개별 렌더.
 *
 * v8 구성: 로고 없는 인물 사진 배경(public/og-people)이 캔버스 하단 끝까지 풀블리드 +
 *   하단 다크 그라데이션 오버레이 위에 세이프 존 하단 블록(뱃지 2개 우측 세로 스택 /
 *   지역줄 / 대형 키워드줄, 전부 좌측 정렬). 어학 퍼플·검고 청록.
 *   v7 까지 있던 최하단 화이트 CTA바(전화번호·"무료 시범수업 신청")는 v8 에서 삭제했다.
 *
 * v4(좌측 앵커·우상단 뱃지)는 네이버 등이 og 를 중앙 정사각으로 크롭할 때 좌측 231px 이 잘려
 * "대구 서구 검정고시" → "구 검정고시" 로 깨졌다. v5 는 v3 의 세이프 존 원칙을 사진형 레이아웃에
 * 복원해 텍스트·뱃지를 모두 중앙 정사각 크롭 안에 배치한다(어학·검고 공통, 같은 결함이었음).
 * v6 은 v5(가운데 정렬)의 치수를 그대로 두고 정렬 기준만 "세이프 존 좌측 경계"로 옮긴 것이고,
 * v7 은 v6 의 배치를 유지한 채 글자 상한만 키운 것이다(키워드 H×0.16→0.21, 지역 ×0.62→0.68,
 * 뱃지 H×0.038→0.049). fit 기준폭이 SAFE_W 라서 라벨이 길면 자동으로 작아진다 —
 * 즉 상한 상향은 짧은 라벨만 키우고 세이프 존 밖으로 나가지 않는다.
 * 문구는 페이지 데이터 파생 + 고정 뱃지 카피(느낌표·보장·수치 없음).
 * 폰트·immutable 캐시 유지. og URL 은 메타에서 v=8 로 캐시 무효화. 본체 코랄(/api/thumb) 무관.
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

// 비율: og(1.91:1) 기본, sq(1:1). 하단 앵커 텍스트 블록이 각 비율 실제 하단에 오도록 개별 렌더.
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
 * kind·region·item → {axis, region(보조 상단줄), keyword(대형 하단줄), badges[2]}. 페이지 데이터
 * 빌더를 재사용해 지역/급별/과목 표기가 실제 페이지와 일치. 빌더 null(무효 조합)이면 null → 404.
 *
 * v5: 한 줄("{지역} {키워드}")을 지역줄·키워드줄 2줄로 분리한다. 좁은 세이프 존(og 554px) 안에서도
 * 키워드가 충분히 커지고, 긴 지역명(고양시 일산동구 등)이 폰트 축소를 유발하지 않는다.
 */
type Content = { axis: "power" | "gumjung"; region: string; keyword: string; badges: [string, string] };
const GJ_BADGES: [string, string] = ["급별 1:1", "기초부터 준비"];
const LANG_BADGES: [string, string] = ["왕초보 1:1", "전화·화상 수업"];

function resolveContent(kind: string, regionParam: string, itemSlug: string): Content | null {
  if (kind === "exam") {
    const d = buildByExamData(regionParam, itemSlug);
    if (!d) return null;
    return { axis: "power", region: d.regionName, keyword: `${d.exam.name} 과외`, badges: LANG_BADGES };
  }
  if (kind === "conversation") {
    const d = buildByRegionData(regionParam, itemSlug);
    if (!d) return null;
    return { axis: "power", region: d.regionName, keyword: `${d.label} 과외`, badges: LANG_BADGES };
  }
  if (kind === "gumjung-subject") {
    const d = buildGumjungSubjectData(regionParam, itemSlug);
    if (!d) return null;
    return { axis: "gumjung", region: d.subjectLabel, keyword: "검정고시 과외", badges: GJ_BADGES };
  }
  if (kind === "gumjung-region") {
    const d = buildGumjungRegionData(regionParam);
    if (!d) return null;
    return { axis: "gumjung", region: d.regionName, keyword: "검정고시 과외", badges: GJ_BADGES };
  }
  if (kind === "gumjung-level") {
    const level = getGumjungLevel(regionParam);
    if (!level) return null;
    return { axis: "gumjung", region: level.name, keyword: "검정고시 과외", badges: GJ_BADGES };
  }
  if (kind === "gumjung-guide") {
    const guide = getGumjungGuide(regionParam);
    if (!guide) return null;
    return { axis: "gumjung", region: guide.navLabel, keyword: "검정고시 과외", badges: GJ_BADGES };
  }
  if (kind === "gumjung-age") {
    const age = getGumjungAge(regionParam);
    if (!age) return null;
    return { axis: "gumjung", region: age.ageLabel, keyword: "검정고시 과외", badges: age.badges };
  }
  if (kind === "gumjung-schedule") {
    if (regionParam === "hub")
      return { axis: "gumjung", region: "접수·시험 안내", keyword: "검정고시 일정", badges: ["급별 1:1", "일정 안내"] };
    const sido = getGumjungSido(regionParam);
    if (!sido) return null;
    return { axis: "gumjung", region: sido.short, keyword: "검정고시 일정", badges: ["급별 1:1", "일정 안내"] };
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

  // v5 세이프 존 — SNS·검색이 og(1200×630)를 중앙 정사각(630×630)으로 크롭해도 모든 텍스트가 남도록,
  // 텍스트·뱃지를 캔버스 가로 중앙의 세이프 존(정사각 변 − 좌우 6%) 안에만 배치하고 그 폭에 맞춰 fit 한다.
  const SQ = Math.min(W, H);
  const safePad = Math.round(SQ * 0.06);
  const SAFE_W = SQ - 2 * safePad; // og 554 / sq 950
  // v7: 상한만 올린다(fit 기준폭은 SAFE_W 그대로 → 긴 라벨은 자동 축소, 잘림 리스크 없음).
  const kwFs = fitFontSize(c.keyword, SAFE_W, 44, Math.round(H * 0.21));
  const rgFs = fitFontSize(c.region, SAFE_W, 30, Math.round(kwFs * 0.68));
  const badgeFs = Math.round(H * 0.049);
  // v8: CTA바 삭제 → 텍스트 블록을 캔버스 하단으로 내린다(기존 ctaH 오프셋 제거).
  const textBottom = Math.round(H * 0.05);

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
            // v8: 텍스트가 캔버스 맨 아래까지 내려오므로 그라데이션을 위로 넓히고 하단을 더 어둡게.
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.38) 48%, rgba(0,0,0,0.72) 74%, rgba(0,0,0,0.94) 100%)",
          }}
        />
        {/* 세이프 존 블록 — 뱃지 2개(우측 세로 스택) / 지역줄 / 키워드줄(대형). 전부 중앙 정사각 크롭 안.
            v6: 정렬 기준을 캔버스 좌측이 아니라 "세이프 존 좌측 경계"로 둔다 → 크롭에서 좌측 정렬로
            보이면서 잘림은 0. fit 기준폭은 SAFE_W 그대로라 폰트 크기·안전 여백 변화 없음. */}
        <div
          style={{
            position: "absolute",
            left: Math.round((W - SAFE_W) / 2),
            width: SAFE_W,
            bottom: textBottom,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              width: SAFE_W,
              gap: Math.round(badgeFs * 0.4),
              marginBottom: Math.round(H * 0.025),
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
                  padding: `${Math.round(badgeFs * 0.36)}px ${Math.round(badgeFs * 0.8)}px`,
                  letterSpacing: "-0.02em",
                }}
              >
                #{b}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontFamily: "Pretendard", fontWeight: 700, fontSize: rgFs, color: "#FFFFFF", letterSpacing: "-0.02em", whiteSpace: "nowrap", opacity: 0.97 }}>
            {c.region}
          </div>
          <div style={{ display: "flex", fontFamily: "Pretendard", fontWeight: 700, fontSize: kwFs, color: "#FFFFFF", letterSpacing: "-0.03em", whiteSpace: "nowrap", marginTop: Math.round(H * 0.008) }}>
            {c.keyword}
          </div>
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
