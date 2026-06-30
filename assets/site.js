/* ============================================================
   Cellab 공유 헤더·푸터 (site.js) — 전 페이지 동일 구조 주입(SSOT)
   각 페이지의 <div id="cellab-header"></div> / <div id="cellab-footer"></div>
   자리에 아래 마크업을 넣는다. 헤더·푸터는 여기서만 고치면 전 페이지 반영.
   ============================================================ */
(function () {
  var path = location.pathname;

  var NAV = [
    { href:'/repair/',   label:'무상 진단' },
    { label:'가이드', children:[
        ['/product/',     '펌프 가이드'],
        ['/tubing.html',  '튜브 가이드'],
        ['/application/', '실험 가이드']
      ] },
    { href:'/requests/', label:'소프트웨어' },
    { href:'/faq/',      label:'FAQ' },
    { href:'/contact/',  label:'문의하기', quote:true }
  ];
  function isCur(href){ return href !== '/' && path.indexOf(href) === 0; }
  function renderItem(n) {
    if (n.children) {
      var open = n.children.some(function (c) { return isCur(c[0]); });
      var sub = n.children.map(function (c) {
        return '<a href="' + c[0] + '"' + (isCur(c[0]) ? ' aria-current="page"' : '') + '>' + c[1] + '</a>';
      }).join('');
      return '<div class="ch-drop' + (open ? ' active' : '') + '">' +
               '<button type="button" class="ch-droptg">' + n.label + ' <span class="ch-arr">▾</span></button>' +
               '<div class="ch-dropm">' + sub + '</div></div>';
    }
    var cls = n.quote ? ' class="ch-quote"' : '';
    return '<a href="' + n.href + '"' + cls + (isCur(n.href) ? ' aria-current="page"' : '') + '>' + n.label + '</a>';
  }
  var navHTML = NAV.filter(function (n) { return !n.quote; }).map(renderItem).join('');
  var ctaHTML = NAV.filter(function (n) { return n.quote; }).map(renderItem).join('');

  var HEADER =
    '<header class="chrome-header"><div class="ch-inner">' +
      '<a class="ch-brand" href="/">Cellab<b>.</b>' +
        '<span class="ch-tag">펌프 수리부터 제어까지</span></a>' +
      '<nav class="ch-nav">' + navHTML + '</nav>' +
      '<div class="ch-cta">' + ctaHTML + '</div>' +
    '</div></header>';

  var FOOTER =
    '<footer class="chrome-footer"><div class="cf-inner">' +
      '<div class="cf-co"><strong>Cellab</strong> · 펌프 수리부터 제어까지<br>' +
        '셀렙 (Cellab) · 이영현 · 637-05-03629<br>' +
        '부산광역시 북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩) · 도매·소매업 / 정보통신업</div>' +
      '<div class="cf-cp">© 2026 Cellab</div>' +
    '</div></footer>';

  function inject() {
    var h = document.getElementById('cellab-header');
    if (h) h.outerHTML = HEADER;
    var f = document.getElementById('cellab-footer');
    if (f) f.outerHTML = FOOTER;
    var tg = document.querySelector('.ch-droptg');
    if (tg) {
      tg.addEventListener('click', function (e) { e.preventDefault(); tg.parentNode.classList.toggle('open'); });
      document.addEventListener('click', function (e) {
        var d = document.querySelector('.ch-drop.open');
        if (d && !d.contains(e.target)) d.classList.remove('open');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();

/* ============================================================
   구조화 데이터(JSON-LD) — 전 페이지 공통 Organization / WebSite
   페이지별 Product·FAQ 스키마는 각 페이지 <head>에 정적 삽입.
   ============================================================ */
(function () {
  if (document.getElementById('ld-org')) return;
  var data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://cellab.kr/#org',
        'name': 'Cellab',
        'alternateName': '셀렙',
        'url': 'https://cellab.kr/',
        'email': 'emgt.yhlee@gmail.com',
        'description': 'Lead Fluid 정량·연동(페리스탈틱)·시린지·방폭펌프와 호환 소모품을 큐레이션 판매하고, PC 제어 프로그램을 직접 개발·무료 제공하는 한국 실험기기 전문점. 국내 A/S 직접 응대.',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩)',
          'addressLocality': '부산광역시',
          'addressCountry': 'KR'
        }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://cellab.kr/#website',
        'name': 'Cellab',
        'url': 'https://cellab.kr/',
        'publisher': { '@id': 'https://cellab.kr/#org' },
        'inLanguage': 'ko'
      }
    ]
  };
  var sc = document.createElement('script');
  sc.type = 'application/ld+json';
  sc.id = 'ld-org';
  sc.text = JSON.stringify(data);
  document.head.appendChild(sc);
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

  // 전환(주요 이벤트) — 프로그램 다운로드
  document.addEventListener('click', function (e) {
    var a = (e.target && e.target.closest) ? e.target.closest('a') : null;
    if (!a || typeof window.gtag !== 'function') return;
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('download') || /\.(exe|zip|msi)(\?|#|$)/i.test(href)) {
      gtag('event', 'file_download', {
        file_name: (href.split('/').pop() || (a.textContent || '').trim()).slice(0, 60),
        link_url: href,
        page_path: location.pathname
      });
    }
  }, true);

  // 전환(주요 이벤트) — 견적·문의·개발요청 폼 제출
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM' || typeof window.gtag !== 'function') return;
    var act = f.getAttribute('action') || '';
    if (/formspree\.io/i.test(act) || /\/(quote|inquiry|requests)\//.test(location.pathname)) {
      gtag('event', 'generate_lead', {
        form_action: act,
        page_path: location.pathname
      });
    }
  }, true);
})();
