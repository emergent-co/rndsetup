// functions/sh-scientific/_middleware.js
// /sh-scientific/ 정적 페이지에 발행된 데이터시트 조각을 서버측에서 주입한다.
// (JS 없이도 크롤러/AI가 제품·가격을 읽을 수 있게 → GEO 대응)
// 발행 조각은 관리자 "사이트 반영"(POST /api/admin/publish)이 D1 published 테이블에 저장한다.

const KEY = 'sh-datasheet';

export async function onRequest(context) {
  const res = await context.next();

  // 데이터시트 마운트가 있는 /sh-scientific/ 인덱스에만 주입 (manual·blog 등은 그대로)
  const path = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';
  if (path !== '/sh-scientific') return res;

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return res;

  let fragment = '';
  try {
    const row = await context.env.DB
      .prepare('SELECT html FROM published WHERE key = ?')
      .bind(KEY).first();
    if (row && row.html) fragment = row.html;
  } catch (_) {
    // 아직 한 번도 발행 안 함 / 테이블 없음 → 정적 페이지의 기본 안내를 그대로 노출
  }

  if (!fragment) return res;

  const rewritten = new HTMLRewriter()
    .on('#sh-ds-grid', {
      element(el) { el.setInnerContent(fragment, { html: true }); },
    })
    .transform(res);

  // 발행 직후 바로 반영되도록 캐시는 짧게
  const out = new Response(rewritten.body, rewritten);
  out.headers.set('cache-control', 'no-cache');
  return out;
}
