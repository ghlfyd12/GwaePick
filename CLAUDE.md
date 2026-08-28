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
- **대상 지칭 표현 기준** (연령 중립):
  - 등록·관리 맥락(수업 관리, 후기 주체 등): **"회원"**.
  - 상담 전 방문자 공감·설명 문구: **"누구나"** 또는 **문장 주어 생략**.
  - ❌ **"학생 / 아이" 등 특정 연령을 한정하는 지칭은 피한다.** (초등·성인·시니어 등 연령 나열 금지.)

## 2. 전환 목표

- 모든 동선은 **"무료 상담 신청"** 으로 모인다.
- CTA 라벨은 `무료 상담 신청` 으로 통일하고, 데이터는 `src/data/site.ts` 의 `site.cta` 에서 가져온다.
- 폼 수신 방식이 정해지기 전까지 CTA 는 메인 페이지의 `#consult` 앵커(`/#consult`)로 연결한다.
- CTA 는 **상단 고정 헤더 + 우측 하단 플로팅** 두 곳에 항상 보이게 유지한다.

## 3. 디자인 토큰 (`src/app/globals.css` 의 `@theme`)

- **포인트 컬러는 경로별로 브랜드가 갈린다. `text-accent` / `bg-accent` 유틸을 쓰되, 값은 스코프에서 결정된다.**
  - **지식의참견(메인 — `/power` 및 그 하위가 아닌 모든 경로): 코랄 `#FF7A59` + 흰색** → `text-accent` / `bg-accent` / `hover:bg-accent-dark`. ⛔ **퍼플 금지.**
  - **어학의참견(`/power` 및 그 하위): 퍼플 `#7D0096`(hover `#66007B`, soft `#F3E6F7`) — CTA 포함 전체 퍼플.** ⛔ **코랄 금지.**
    `/power` 는 `.power-theme` 스코프에서 `accent` 토큰만 퍼플로 오버라이드한다 → 같은 `text-accent`/`bg-accent` 유틸이 `/power` 안에서만 퍼플로 렌더된다.
  - **공유 컴포넌트(Header·Footer·FloatingCTA·ConsultForm 등)는 `/power` 스코프에서만 퍼플로 오버라이드**되고, 메인 경로에서는 코랄 그대로 유지한다. 공유 컴포넌트에 브랜드색을 하드코딩하지 않는다.
- 구조적 어두운 요소(헤더 바·강한 배경 등): **차콜·그레이 계열** `#2B2B2E` → `bg-primary` / `from-primary-dark to-primary`
  (`primary` 토큰은 이제 차콜이다: primary `#2B2B2E` / primary-dark `#1F1F22` / primary-light(중간 그레이) `#5C5C63` / primary-soft(연한 회색) `#F4F4F5`)
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

## 8. 빌드/실행 확인 규칙 (반드시 준수)

**빌드·검증 실행 규칙 (절대)**
- `npm run build`, `npm run dev` 등 빌드·검증 명령은 반드시 포그라운드에서 완료까지 실행한다.
- 다음 패턴 일체 금지: 백그라운드 실행 후 출력 파일 폴링, `until` 루프, `watch`, tail 반복 확인, sleep 반복 후 상태 체크 등 모든 형태의 완료 감시.
- 명령이 오래 걸리면 그대로 기다린다. 감시 스크립트를 만들지 않는다.
- 작업 종료 전 자신이 시작한 프로세스(dev server 포함)를 모두 종료했는지 확인한다.

## Vercel 빌드 비용 절감 규칙

Vercel Pro의 최대 지출 항목은 CPU 빌드 시간이다. 로컬 빌드(npm run build)는
비용이 없으므로 검증은 로컬에서 충분히 하되, Vercel 빌드를 트리거하는 push는
아래 규칙을 따른다.

1. push 묶음 원칙
   - 같은 날 승인된 작업이 여러 건이면 커밋은 작업별로 나누되 push는 1회로 묶는다.
   - push 1회 = Vercel 빌드 1회 = 비용 1회임을 항상 인지한다.

2. 빌드 스킵
   - 코드·페이지 산출물에 영향 없는 커밋(문서, 주석, README, 지침 파일만 변경)은
     커밋 메시지에 [skip ci]를 포함해 Vercel 빌드를 건너뛴다.

3. 빌드 무게 증가 금지 (사전 보고 대상)
   - generateStaticParams의 SSG 대상 확대는 빌드 시간을 직접 늘린다.
     신규 pSEO 축은 기존 방식(파일럿 소수만 SSG + 나머지 dynamicParams +
     revalidate=false)을 기본으로 하고, SSG 범위를 늘리려면 예상 빌드 시간
     증가를 먼저 보고하고 승인받는다.
   - 빌드 시점에 실행되는 무거운 스크립트(대량 이미지 변환, 데이터 생성 등)를
     추가하지 않는다. 이런 작업은 로컬에서 실행해 결과물만 커밋한다.

4. 배포 전 로컬 검증 완료 원칙
   - push 전에 로컬 빌드를 반드시 통과시킨다. Vercel에서 빌드 실패 후
     수정 재push하면 실패한 빌드까지 과금되므로, 실패 빌드를 만들지 않는다.

## 후기 연동 운영 규칙 (reviewItems 추가 시)

reviewItems(src/data/reviewItems.ts)는 /reviews 목록뿐 아니라 학교·과목·지역·
학교×과목 상세의 매칭 후기 섹션(ReviewSection)에도 노출된다. 매칭은
src/data/reviewMatch.ts 가 담당한다.

- 신규 후기를 추가할 때, 후기의 region 값이 **학교 약칭이거나 시군구명**이면
  대개 자동 매칭된다(학교=schools.ts name 약칭 일치, 지역=REGION_TO_AREA 해석).
- 그러나 region 이 **새 지역명(동·읍·면·구·시)이거나 새 학교 약칭**이라
  REGION_TO_AREA 에 해석 항목이 없으면, 그 후기는 지역 상세에 매칭되지 않는다.
  → 이럴 때 reviewMatch.ts 의 REGION_TO_AREA 에 `region: { cityQuery, province }`
  **1줄을 추가**한다(동은 소속 시군구로, 학교는 소재 시군구로, province 는
  짧은 표기). 매칭 누락을 막기 위한 필수 절차다.
- reviewItems.ts 자체는 매칭 로직이 없으니, 새 region 표기가 들어올 때마다
  reviewMatch.ts 맵 갱신을 함께 검토한다.
