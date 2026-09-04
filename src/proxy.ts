import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 proxy(구 middleware) — 잘못된 퍼센트 인코딩(malformed URI) 요청을 404 로 정규화한다.
 *
 * 배경: 비UTF-8 바이트열이나 잘린 `%` 등 디코드 불가능한 경로가 동적 라우트로 들어오면,
 * Next 가 경로 param 을 디코드하는 단계에서 "failed to decode param" 예외를 던져 라우트
 * 핸들러 실행 전에 500(bare Internal Server Error)을 반환한다. 핸들러가 안 돌아 라우트의
 * notFound() 로는 못 잡는다.
 *
 * 이 결함은 특정 축이 아니라 모든 동적 라우트 세그먼트에 공통이며, 정적 프리픽스가 없는
 * 루트 동적 축(/[region] 랜딩)은 param 디코드가 특히 이른 단계에서 일어난다. 이를 프록시가
 * 모두 잡으려면 두 가지가 필요하다:
 *   1) next.config 의 `skipProxyUrlNormalize: true` — 프록시가 정규화(디코드) 이전의 raw
 *      경로를 받도록 해, 루트 동적 축 요청도 프록시에 도달한다.
 *   2) rewrite 가 아니라 **직접 404 응답** — 프리렌더(dynamicParams=false) 루트 라우트는
 *      rewrite 후에도 원본 param 디코드를 재시도해 500 이 남으므로, 라우팅 재진입 없이
 *      하드 스톱한다.
 *
 * 정상(유효 UTF-8 인코딩)·ASCII 요청은 decodeURIComponent 성공 → 순수 통과(NextResponse.next())
 * 하므로 기존 200/404·ISR 캐시·응답 헤더에 영향이 없다. matcher 는 정적 자산(_next·확장자
 * 파일)과 API 를 제외한 페이지 라우트 전역.
 */
export function proxy(req: NextRequest) {
  try {
    decodeURIComponent(req.nextUrl.pathname);
  } catch {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  // 정적 자산(_next/*, 확장자 파일)·API 제외한 페이지 라우트 전역.
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
