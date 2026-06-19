# CLAUDE.md — 과외 매칭 사이트 프로젝트 메모리

이 파일은 **모든 세션에서 반드시 따르는 규칙**이다. 새 페이지·컴포넌트·카피를 만들 때 항상 먼저 참고한다.

## 0. 프로젝트 한 줄 요약

"직접 가르쳐 온 선생님이 1:1 상담으로 우리 아이에게 가장 잘 맞는 선생님을 연결해 주는" 과외 매칭 사이트.
유일한 전환 목표는 **무료 상담 신청(리드) 수집**이며, 주 사용자는 **모바일로 검색해 들어오는 불안한 학부모**다.
이후 단계에서 지역×학년×과목 조합의 **pSEO 랜딩페이지를 수백 개 자동 생성**하므로, 처음부터 확장 가능한 구조를 유지한다.

## 1. 워딩 절대 규칙 (가장 중요)

- ❌ **"컨설턴트"라는 단어를 사이트 어디에도 쓰지 않는다.**
  - ✅ 대신 **"선생님", "상담 선생님", "직접 가르쳐 온 선생님"** 으로 통일한다.
- **핵심 슬로건**: `선생님을 보는 눈은, 선생님이 가장 정확합니다.`
- **톤**: 영업·과장 금지. "내가 가르쳐봤으니 안다"는 **동료 교사의 차분한 확신**.
  과장된 보장(100%, 무조건 등)·공포 마케팅 금지. 따뜻하고 신뢰감 있게.

## 2. 전환 목표

- 모든 동선은 **"무료 상담 신청"** 으로 모인다.
- CTA 라벨은 `무료 상담 신청` 으로 통일하고, 데이터는 `src/data/site.ts` 의 `site.cta` 에서 가져온다.
- 폼 수신 방식이 정해지기 전까지 CTA 는 메인 페이지의 `#consult` 앵커(`/#consult`)로 연결한다.
- CTA 는 **상단 고정 헤더 + 우측 하단 플로팅** 두 곳에 항상 보이게 유지한다.

## 3. 디자인 토큰 (`src/app/globals.css` 의 `@theme`)

- **메인/브랜드: 따뜻한 주황 `#FF6B4A` 계열 + 흰색** → `text-accent` / `bg-accent` / `hover:bg-accent-dark`
- 구조적 어두운 요소(헤더 바·강한 배경 등): **차콜·그레이 계열** `#2B2B2E` → `bg-primary` / `from-primary-dark to-primary`
  (`primary` 토큰은 이제 차콜이다: primary `#2B2B2E` / primary-dark `#1F1F22` / primary-light(중간 그레이) `#5C5C63` / primary-soft(연한 회색) `#F4F4F5`)
- ⛔ **보라색(violet/purple, `#7C3AED`·`#6D28D9` 등) 전역 금지.** 보라가 쓰이던 자리는 주황(강조) 또는 차콜(구조)로 대체한다.
- 텍스트: 진한 차콜 `#1F2937` (`text-ink`), 보조 회색 `#6B7280` (`text-muted`)
- 배경/구분선: `bg-surface`(#F9FAFB), `bg-surface-alt`(#F3F4F6), `border-line`(#E5E7EB)
- 폰트: **Pretendard** (self-hosted, `next/font/local`, `--font-pretendard`), 헤드라인은 `font-bold` 이상
- 타이포 스케일: 루트 폰트 `html { font-size: 112.5% }`(기준 18px). 전체 글씨 크기 조절은 이 값 하나로.
- **모바일(390px) 우선** 설계 → 태블릿·데스크톱 순으로 확장
- 분위기: 따뜻함 + 신뢰감. **과도한 그라데이션·애니메이션 금지.** 차분하고 전문적으로.

## 4. 공통 제약 (페이지/컴포넌트 작성 시)

- **시맨틱 HTML**: `header` / `main` / `footer` / `section` / `nav` 를 의미에 맞게.
- **접근성**: `label`/`alt` 제공, **버튼과 링크 구분**(페이지 이동=링크, 동작=버튼), 충분한 탭 영역(최소 48px).
- **메타데이터**: 페이지마다 `title` / `description` / OG 를 Metadata API 로 설정. **`h1` 은 페이지당 1개.**
- 전역: `word-break: keep-all` (한국어 줄바꿈), 부드러운 스크롤.
- **390px 뷰포트에서 가로 스크롤이 발생하지 않도록** 한다.

## 5. 데이터 분리 원칙 (pSEO 확장 대비)

- 카피·과목·후기·지역 데이터는 **컴포넌트에 하드코딩하지 않는다.**
- 모든 공통/콘텐츠 데이터는 **`src/data/` 의 TS 파일**로 분리한다.
- 공통 텍스트(사이트명, 슬로건, 네비, 연락처, CTA 라벨)는 `src/data/site.ts` 단일 소스에서 가져온다.

## 6. 기술 스택 / 폴더 구조

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**, 배포 대상 Vercel.
- import alias: `@/*` → `src/*`

```
src/
├─ app/            layout.tsx(공통 레이아웃·메타) / page.tsx(메인) / globals.css(디자인 토큰)
├─ components/
│  ├─ layout/      Header.tsx / Footer.tsx / FloatingCTA.tsx
│  └─ ui/          CTAButton.tsx (재사용 CTA)
├─ data/           site.ts (사이트 공통 텍스트) — 콘텐츠 데이터는 여기로 분리
├─ fonts/          PretendardVariable.woff2 (self-hosted)
└─ lib/            cn.ts 등 유틸
```

## 7. 실행

- 개발: `npm run dev` → http://localhost:3000
- 빌드: `npm run build` / 린트: `npm run lint`
- (이 환경은 Node 가 PATH 에 없을 수 있음 — 포터블 Node 사용 시 PATH 선등록 필요)
