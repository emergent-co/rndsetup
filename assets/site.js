/* ============================================================
   Cellab 공유 헤더·푸터 (site.js) — 전 페이지 동일 구조 주입(SSOT)
   각 페이지의 <div id="cellab-header"></div> / <div id="cellab-footer"></div>
   자리에 아래 마크업을 넣는다. 헤더·푸터는 여기서만 고치면 전 페이지 반영.
   ============================================================ */
(function () {
  var path = location.pathname;

  var NAV = [
    ['/product/',  '제품'],
    ['/requests/', '개발 요청'],
    ['/quote/',    '견적 문의']
  ];
  var navHTML = NAV.map(function (n) {
    var cls = (n[0] === '/quote/') ? ' class="ch-quote"' : '';
    var cur = (path.indexOf(n[0]) === 0) ? ' aria-current="page"' : '';
    return '<a href="' + n[0] + '"' + cls + cur + '>' + n[1] + '</a>';
  }).join('');

  var HEADER =
    '<header class="chrome-header"><div class="ch-inner">' +
      '<a class="ch-brand" href="/">Cellab<b>.</b>' +
        '<span class="ch-tag">R&D Control Solution</span></a>' +
      '<nav class="ch-nav">' + navHTML + '</nav>' +
    '</div></header>';

  var FOOTER =
    '<footer class="chrome-footer"><div class="cf-inner">' +
      '<div class="cf-co"><strong>Cellab</strong> · R&D Pumps and Consumables<br>' +
        '상호 셀렙 (Cellab) · 대표 이영현 · 사업자등록 637-05-03629 · 개업일 2026.01.06<br>' +
        '소재지 부산광역시 북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩) · 업태 도매·소매업 / 정보통신업</div>' +
      '<div class="cf-bar">Lead Fluid 한국 공식 총판 · 3년 무상 보증 · 국내 A/S 직접 응대</div>' +
      '<div class="cf-cp">© 2026 Cellab · <a href="mailto:emgt.yhlee@gmail.com">emgt.yhlee@gmail.com</a></div>' +
    '</div></footer>';

  function inject() {
    var h = document.getElementById('cellab-header');
    if (h) h.outerHTML = HEADER;
    var f = document.getElementById('cellab-footer');
    if (f) f.outerHTML = FOOTER;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
