# HANDOFF — 지식의참견(GwaePick)

다른 PC·다른 창에서 이어 받을 때 읽는 작업 인계. 규칙은 `CLAUDE.md` 가 우선.

## 문의 알림(텔레그램 우체국) — 2026-10-26

- 브라우저 알림은 `src/components/NotifyTracker.tsx`(루트 레이아웃에 한 번 — 지식의참견·/power·/gumjung 모두)가 여러 사이트 공용 우체국(Cloudflare Worker `studykim-notify`)으로 신호만 보낸다. 우체국 주소는 `src/data/site.ts` 의 `NOTIFY_URL`(공개값), 봇 토큰·대화방 번호는 우체국 비밀 변수에만 — 이 저장소에 비밀값을 넣지 않는다. 사이트 이름(지식의참견/어학의참견/검고의참견)은 우체국이 경로(/power·/gumjung)로 나눈다.
- 보내는 것: 새 방문(세션 1회, 무음)·전화·문자·카톡 클릭(같은 종류 3초 중복 무시)·상담 신청. 처음 도착 페이지·유입·검색어(n_query·utm_term·query)는 첫 페이지를 여는 순간 기록. 로봇·미리보기·Lighthouse 는 보내지 않는다. 로컬(localhost)은 우체국이 403 — 확인은 배포본에서.
- **상담 신청 알림은 저장 성공 뒤에만 `notifyLead()` 로, 학년·과목·지역(시·군·구까지)·신청 페이지만 — 이름·연락처·주소·문의 내용은 넣지 않는다(운영자가 따로 정할 때까지).** `ConsultForm`(→ /api/consult, Notion)·`ApplyForm`(→ /api/inquiries, Supabase·메일) 두 곳.
- 서버 알림 `src/lib/notify.ts`(Vercel 에 TELEGRAM_BOT_TOKEN·TELEGRAM_CHAT_ID 가 있을 때 /api/consult 가 직접 텔레그램)와 두 번 가지 않게, /api/consult 가 `notified` 를 돌려주고 true 면 브라우저 알림을 생략한다.
- 허용 사이트 목록·방문 알림 끄고 켜기는 우체국 코드(`C:\studykim-notify\src\index.js` 의 `SITES`) 한 곳.

- 2026-10-26 적용(동네검증과외 표준과 같은 구성). 아직 결정 안 된 것: ① 서버 알림(`lib/notify.ts`)이 이름·연락처·주소·문의까지 보내고, 텔레그램 미설정·실패 때 그 내용을 서버 로그에 남김 ② 개인정보처리방침 "처리 위탁 없음" 문구가 실제(Supabase·Notion·Resend·텔레그램)와 다름 — 운영자 결정 대기.
