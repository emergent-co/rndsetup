/* ============================================================
   Cellab 공유 헤더·푸터 (site.js) — 전 페이지 동일 구조 주입(SSOT)
   각 페이지의 <div id="cellab-header"></div> / <div id="cellab-footer"></div>
   자리에 아래 마크업을 넣는다. 헤더·푸터는 여기서만 고치면 전 페이지 반영.
   ============================================================ */
(function () {
  var path = location.pathname;

  var NAV = [
    { href:'/requests/', label:'소프트웨어' },
    { href:'/application/', label:'실험 가이드' },
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
  var navHTML = NAV.map(renderItem).join('');

  var HEADER =
    '<header class="chrome-header"><div class="ch-inner">' +
      '<a class="ch-brand" href="/">Cellab<b>.</b>' +
        '<span class="ch-tag">펌프 수리부터 제어까지</span></a>' +
      '<button class="ch-burger" type="button" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '<nav class="ch-nav">' + navHTML + '</nav>' +
    '</div></header>';

  var FOOTER =
    '<footer class="chrome-footer">' +
      '<div class="cf-inner">' +
      '<div class="cf-co"><strong>Cellab</strong> · 펌프 수리부터 제어까지<br>' +
        'LeadFluid 공식 한국 A/S 파트너 · 나비엠알오 등록 공급사 · 셀렙 구매 고객 3년 무상보증<br>' +
        '셀렙 (Cellab) · 이영현 · 637-05-03629<br>' +
        '부산광역시 북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩) · 도매·소매업 / 정보통신업</div>' +
      '<div class="cf-cp">© 2026 Cellab</div>' +
    '</div></footer>';

  var REPAIR_MODAL =
    '<div class="rp-modal" id="repairModal">' +
      '<div class="rp-box">' +
        '<button class="rp-close" type="button" aria-label="닫기">×</button>' +
        '<h3>무료 수리진단 신청</h3>' +
        '<p class="rp-sub">모델명·증상·연락처만 적으면 끝. 보내실 주소를 안내드립니다.</p>' +
        '<form id="repairPopForm">' +
          '<input type="hidden" name="_subject" value="[무상 진단 신청] 펌프 수리">' +
          '<label>펌프 모델명 <span class="req">*</span>' +
            '<input type="text" name="모델명" required placeholder="예: BT100S"></label>' +
          '<label>제조사 <span class="req">*</span>' +
            '<input type="text" name="제조사" required placeholder="예: LeadFluid / Masterflex / 기타"></label>' +
          '<label>증상 <span class="req">*</span>' +
            '<textarea name="증상" required placeholder="예: 유량이 안 나옴 / 소음 / 안 켜짐 / 누액"></textarea></label>' +
          '<label>연락처(이메일 또는 전화) <span class="req">*</span>' +
            '<input type="text" name="연락처" required placeholder="you@lab.ac.kr 또는 010-0000-0000"></label>' +
          '<label>회사·연구실명 <span class="req">*</span>' +
            '<input type="text" name="소속" required placeholder="OO대학교 OO연구실"></label>' +
          '<button class="rp-send" type="submit">무료 수리진단 신청 보내기</button>' +
        '</form>' +
        '<div class="rp-done" id="repairPopDone"><div class="ok">✓</div><h3>신청이 접수되었습니다</h3><p>보내실 주소를 안내드리겠습니다.</p></div>' +
      '</div>' +
    '</div>';

  function initRepairModal() {
    if (document.getElementById('repairModal')) return;
    document.body.insertAdjacentHTML('beforeend', REPAIR_MODAL);
    var rm = document.getElementById('repairModal');
    window.openRepairForm = function () { rm.classList.add('open'); document.body.style.overflow = 'hidden'; };
    window.closeRepairForm = function () { rm.classList.remove('open'); document.body.style.overflow = ''; };
    rm.addEventListener('click', function (e) { if (e.target === rm) closeRepairForm(); });
    rm.querySelector('.rp-close').addEventListener('click', closeRepairForm);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeRepairForm(); });
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.js-repair') : null;
      if (t) { e.preventDefault(); openRepairForm(); }
    });
    var rf = document.getElementById('repairPopForm');
    rf.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, btn = f.querySelector('.rp-send');
      btn.disabled = true; btn.textContent = '보내는 중…';
      fetch('https://formspree.io/f/mnjkzppj', { method: 'POST', body: new FormData(f), headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          btn.disabled = false; btn.textContent = '무료 수리진단 신청 보내기';
          if (r.ok) {
            if (typeof gtag === 'function') gtag('event', 'generate_lead', { lead_type: 'repair_diagnosis', page_path: location.pathname });
            f.style.display = 'none'; document.getElementById('repairPopDone').style.display = 'block';
          } else { alert('전송에 실패했습니다. 이메일로 보내주세요: emgt.yhlee@gmail.com'); }
        })
        .catch(function () { btn.disabled = false; btn.textContent = '무료 수리진단 신청 보내기'; alert('전송에 실패했습니다. 이메일로 보내주세요: emgt.yhlee@gmail.com'); });
    });
  }

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
    var burger = document.querySelector('.ch-burger');
    var nav = document.querySelector('.ch-nav');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          nav.classList.remove('open');
          burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }
    if (!document.querySelector('.navimro-fab')) {
      document.body.insertAdjacentHTML('beforeend',
        '<a class="navimro-fab" href="https://www.navimro.com/s/?x=0&y=0&q=leadfluid&disp=0&keyword=" target="_blank" rel="noopener" aria-label="나비엠알오에서 LeadFluid 제품 보기">' +
          '<span class="nm-brand">NAVI<b>MRO</b></span>' +
          '<span class="nm-t">LeadFluid<br>제품 바로가기</span>' +
        '</a>');
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
