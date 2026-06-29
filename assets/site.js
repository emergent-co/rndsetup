/* ============================================================
   Cellab 공유 헤더·푸터 (site.js) — 전 페이지 동일 구조 주입(SSOT)
   각 페이지의 <div id="cellab-header"></div> / <div id="cellab-footer"></div>
   자리에 아래 마크업을 넣는다. 헤더·푸터는 여기서만 고치면 전 페이지 반영.
   ============================================================ */
(function () {
  var path = location.pathname;

  var NAV = [
    ['/product/',     '펌프 가이드'],
    ['/tubing.html',  '튜브 가이드'],
    ['/application/', '셋업 가이드'],
    ['/requests/',    '개발 요청'],
    ['/quote/',       '견적 문의']
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
        '셀렙 (Cellab) · 이영현 · 637-05-03629<br>' +
        '부산광역시 북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩) · 도매·소매업 / 정보통신업</div>' +
      '<div class="cf-cp">© 2026 Cellab</div>' +
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

/* ============================================================
   GA4 + 클릭 추적 — 전 페이지 공통 (무엇을 눌렀는지 측정)
   ============================================================ */
(function () {
  var GA_ID = 'G-CN3E3PVQVD';

  // 이미 gtag가 있는 페이지(recommend·inquiry·블로그 등)는 중복 로드 방지
  if (typeof window.gtag !== 'function') {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  // 버튼·링크 클릭을 'click' 이벤트로 전송 (link_text = 누른 텍스트)
  document.addEventListener('click', function (e) {
    var el = (e.target && e.target.closest) ? e.target.closest('a, button, [data-ga]') : null;
    if (!el || typeof window.gtag !== 'function') return;
    var label = (el.getAttribute('data-ga') || el.textContent || el.getAttribute('aria-label') || '')
      .replace(/\s+/g, ' ').trim().slice(0, 90);
    if (!label) return;
    gtag('event', 'click', {
      link_text: label,
      link_url: el.getAttribute('href') || '',
      page_path: location.pathname
    });
  }, true);
})();
