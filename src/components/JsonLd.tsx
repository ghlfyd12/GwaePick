/**
 * JSON-LD 구조화 데이터 삽입 — <script type="application/ld+json">.
 *
 * 서버 컴포넌트. 라우트에서 lib/seo.ts 의 serviceJsonLd/breadcrumbJsonLd/faqJsonLd 로 만든
 * 객체(또는 배열)를 data 로 넘긴다. 스키마 하드코딩은 seo.ts 에만 둔다.
 * "</script>" 조기 종료 방지를 위해 "<" 를 유니코드 이스케이프한다.
 */
type Json = Record<string, unknown>;

export default function JsonLd({ data }: { data: Json | Json[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
