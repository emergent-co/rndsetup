/* ============================================================
   Cellab 공유 헤더·푸터 (site.js) — 전 페이지 동일 구조 주입(SSOT)
   각 페이지의 <div id="cellab-header"></div> / <div id="cellab-footer"></div>
   자리에 아래 마크업을 넣는다. 헤더·푸터는 여기서만 고치면 전 페이지 반영.
   ============================================================ */
(function () {
  var path = location.pathname;

  var ICONS = {
    home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    sw:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    guide:'<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5.2 8.6A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-3.4L14 9V3"/></svg>',
    feed:'<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="1.6"/><path d="M4 11a9 9 0 0 1 9 9M4 5a15 15 0 0 1 15 15"/></svg>',
    faq:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3 2.4c-.8.3-1 .8-1 1.6M12 17h.01"/></svg>',
    contact:'<svg viewBox="0 0 24 24"><path d="M4 5h16v12H8l-4 3z"/></svg>',
    star:'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17.8 6.4 20.4l1.4-6.3L3 9.8l6.4-.6z"/></svg>',
    pick:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7"/></svg>',
    shield:'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>'
  };
  var NAV = [
    { href:'/',            label:'홈',        icon:'home' },
    { href:'/application/#papers', label:'성공사례', icon:'star' },
    { href:'/blog/',       label:'블로그',     icon:'feed' },
    { href:'/application/pump-selection.html', label:'펌프를 고를 때', icon:'pick', sub:[
        ['/application/pump-selection.html', '펌프 종류·선택'],
        ['/application/tube-selection.html', '튜브·화학 적합성']
      ] },
    { href:'/requests/',   label:'실험을 자동화할 때', icon:'sw', sub:[
        ['/requests/#unattended', '무인 연속 운전'],
        ['/requests/#channels',   '채널 독립·다펌프 동기'],
        ['/requests/#record',     '유량 기록·재현']
      ] },
    { href:'/application/', label:'실험별 셋업 가이드', icon:'guide', sub:[
        ['/application/cell-culture-perfusion.html', '세포배양 관류']
      ] },
    { href:'/#trust',      label:'믿고 도입할 때', icon:'shield', sub:[
        ['/#trust', '국내 A/S·정품·3년보증'],
        ['/#cases', '수리 사례']
      ] },
    { href:'/contact/',    label:'문의하기',   icon:'contact' },
    { href:'/faq/',        label:'FAQ',       icon:'faq' }
  ];
  function matches(href){ if(href.indexOf('#') > -1) return false; return href === '/' ? path === '/' : path === href; }
  function isCur(n){ if(matches(n.href)) return true; return n.sub ? n.sub.some(function(s){ return matches(s[0]); }) : false; }
  var navHTML = NAV.map(function (n) {
    var cur = isCur(n);
    var row = '<a class="s-item' + (cur ? ' active' : '') + '" href="' + n.href + '"' +
              (cur ? ' aria-current="page"' : '') + '>' + (ICONS[n.icon] || '') +
              '<span>' + n.label + '</span></a>';
    if (n.sub) {
      row += '<div class="s-sub">' + n.sub.map(function (s) {
        return '<a href="' + s[0] + '">' + s[1] + '</a>';
      }).join('') + '</div>';
    }
    return row;
  }).join('');

  var HEADER =
    '<header class="ch-top">' +
      '<button class="ch-burger" type="button" aria-label="메뉴" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '<a class="ch-brand" href="/">Cellab<b>.</b></a>' +
      '<form class="ch-search" id="chSearch" role="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg><input type="search" placeholder="검색" aria-label="사이트 검색"></form>' +
      '<a class="ch-cta" href="/contact/#repair">무료 수리진단</a>' +
    '</header>' +
    '<aside class="ch-side" id="chSide"><nav>' + navHTML + '</nav>' +
      '<div class="ch-side-foot">LeadFluid 공식 한국 A/S 파트너<br>나비엠알오 등록 공급사</div>' +
    '</aside>' +
    '<div class="ch-scrim" id="chScrim"></div>';

  var FOOTER =
    '<footer class="chrome-footer">' +
      '<div class="cf-inner">' +
        '<div class="cf-cols">' +
          '<div class="cf-col"><h4>바로가기</h4>' +
            '<a href="/requests/">소프트웨어</a><a href="/application/">실험 가이드</a><a href="/blog/">블로그</a><a href="/faq/">FAQ</a></div>' +
          '<div class="cf-col"><h4>문의</h4>' +
            '<a href="/contact/#repair">수리 문의</a><a href="/contact/#dev">개발 문의</a>' +
            '<a href="https://www.navimro.com/s/?x=0&y=0&q=leadfluid&disp=0&keyword=" target="_blank" rel="noopener" data-ga="navimro_footer">견적·구매 (나비엠알오)</a></div>' +
          '<div class="cf-col"><h4>고객센터</h4>' +
            '<a href="mailto:emgt.yhlee@gmail.com">emgt.yhlee@gmail.com</a>' +
            '<span>LeadFluid 공식 한국 A/S 파트너</span><span>셀렙 구매 고객 3년 무상보증</span></div>' +
        '</div>' +
        '<div class="cf-co"><strong>Cellab (셀렙)</strong> · 이영현 · 사업자등록 637-05-03629<br>' +
          '부산광역시 북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩) · 도매·소매업 / 정보통신업</div>' +
        '<div class="cf-cp">© 2026 Cellab. All Rights Reserved.</div>' +
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
    var burger = document.querySelector('.ch-burger');
    var side = document.getElementById('chSide');
    var scrim = document.getElementById('chScrim');
    if (burger && side) {
      function closeSide() { side.classList.remove('open'); if (scrim) scrim.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
      burger.addEventListener('click', function () {
        var open = side.classList.toggle('open');
        if (scrim) scrim.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      if (scrim) scrim.addEventListener('click', closeSide);
      side.addEventListener('click', function (e) { if (e.target.closest('a')) closeSide(); });
    }
    var sf = document.getElementById('chSearch');
    if (sf) sf.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = (sf.querySelector('input').value || '').trim();
      if (q) window.open('https://www.google.com/search?q=' + encodeURIComponent('site:cellab.kr ' + q), '_blank');
    });
    if (!document.querySelector('.navimro-fab')) {
      document.body.insertAdjacentHTML('beforeend',
        '<a class="navimro-fab" href="https://www.navimro.com/s/?x=0&y=0&q=leadfluid&disp=0&keyword=" target="_blank" rel="noopener" data-ga="navimro_fab" aria-label="나비엠알오에서 LeadFluid 제품 보기">' +
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
        'legalName': 'emergent co.',
        'url': 'https://cellab.kr/',
        'email': 'emgt.yhlee@gmail.com',
        'description': 'LeadFluid 정량·연동(페리스탈틱)·시린지펌프에 제어 소프트웨어를 얹은 실험실 펌프 시스템을 공급하고, 하드웨어를 직접 진단·수리하는 한국 A/S 전문점. 관류·연속배양 등 무인·정밀·재현이 필요한 연구에 맞춘 제어를 제공합니다.',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩)',
          'addressLocality': '부산광역시',
          'addressCountry': 'KR'
        },
        'makesOffer': [
          { '@type': 'Offer', 'itemOffered': { '@type': 'Product', 'name': 'LeadFluid 정량·연동·시린지펌프 + 제어 소프트웨어', 'category': '실험실 정량·연동 펌프 시스템', 'brand': { '@type': 'Brand', 'name': 'LeadFluid' } } },
          { '@type': 'Offer', 'itemOffered': { '@type': 'Product', 'name': 'Alicat 질량유량계(MFC)', 'category': '질량유량계(Mass Flow Controller)', 'brand': { '@type': 'Brand', 'name': 'Alicat Scientific' } } }
        ]
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

  // 전환(주요 이벤트) — 문의·개발요청 폼 제출
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM' || typeof window.gtag !== 'function') return;
    var act = f.getAttribute('action') || '';
    if (/formspree\.io/i.test(act) || /\/(inquiry|requests)\//.test(location.pathname)) {
      gtag('event', 'generate_lead', {
        form_action: act,
        page_path: location.pathname
      });
    }
  }, true);

  // 전환 후보 — 나비엠알오(구매 채널) 클릭
  document.addEventListener('click', function (e) {
    var a = (e.target && e.target.closest) ? e.target.closest('a') : null;
    if (!a || typeof window.gtag !== 'function') return;
    if (/navimro\.com/i.test(a.getAttribute('href') || '')) {
      gtag('event', 'navimro_click', {
        link_text: (a.getAttribute('data-ga') || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        page_path: location.pathname
      });
    }
  }, true);
})();
