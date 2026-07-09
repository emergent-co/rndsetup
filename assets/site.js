/* ============================================================
   정량펌프연구소 공유 헤더·푸터 (site.js) — 전 페이지 동일 구조 주입(SSOT)
   각 페이지의 <div id="pumplab-header"></div> / <div id="pumplab-footer"></div>
   자리에 아래 마크업을 넣는다. 헤더·푸터는 여기서만 고치면 전 페이지 반영.
   ============================================================ */
(function () {
  var path = location.pathname;

  var SEARCH_INDEX = [
    { t:'홈', u:'/', k:'소프트웨어 제어 펌프 시스템 관류', c:'페이지' },
    { t:'펌프 종류 — 연동·시린지·기어 선택', u:'/pumps/', k:'펌프 종류 연동펌프 시린지펌프 기어펌프 정량펌프 선택 실험용 펌프', c:'펌프 종류' },
    { t:'연동펌프 (페리스탈틱)', u:'/pumps/peristaltic.html', k:'연동펌프 페리스탈틱 peristaltic 튜브펌프 무오염 저유량 관류 정량 BT101 BQ80S EF800 LeadFluid', c:'펌프 종류' },
    { t:'시린지펌프 (주사기펌프)', u:'/pumps/syringe.html', k:'시린지펌프 주사기펌프 syringe pump 초저유량 정밀 주입 미세유체 flow chemistry TYD01 TFD 다채널', c:'펌프 종류' },
    { t:'정량펌프 (연동식 정량·디스펜싱)', u:'/pumps/metering.html', k:'정량펌프 디스펜싱 dosing metering 분주 정량 주입 pH 제어 BQ80S BT101F 연동식', c:'펌프 종류' },
    { t:'기어펌프', u:'/pumps/gear.html', k:'기어펌프 gear pump 무맥동 고압 대유량 유기용매 방폭 FG601S 산업 이송', c:'펌프 종류' },
    { t:'소프트웨어 제어 펌프 시스템', u:'/requests/', k:'자동화 무인 관류 채널 독립 유량 기록 재현 modbus rs485 python 스케줄 레시피 로그 다펌프 동기', c:'실험을 자동화할 때' },
    { t:'프로그래밍 제어 (Modbus·RS-485·Python)', u:'/requests/#control', k:'modbus rs485 python 시리얼 제어 자동화 스크립트 레지스터', c:'실험을 자동화할 때' },
    { t:'유량 스케줄·ramp·레시피', u:'/requests/#schedule', k:'스케줄 ramp 램프 레시피 시퀀스 프로파일 반복 저장', c:'실험을 자동화할 때' },
    { t:'다펌프 동기·무인 연속 운전', u:'/requests/#sync', k:'다펌프 동기 무인 장시간 연속 운전 대조군 채널 독립', c:'실험을 자동화할 때' },
    { t:'운전 로그 기록·재현', u:'/requests/#record', k:'로그 기록 csv 재현 프로파일 재현성', c:'실험을 자동화할 때' },
    { t:'펌프 고르는 방법', u:'/application/pump-selection.html', k:'펌프 선택 종류 연동 시린지 기어 정량 유량 정밀도 미량 추천 위저드', c:'펌프를 고를 때' },
    { t:'튜브 선택 가이드', u:'/application/tube-selection.html', k:'튜브 재질 실리콘 tygon pharmed viton 화학 적합성 교체', c:'펌프를 고를 때' },
    { t:'관류배양 자동 배지교환 (세포배양 관류)', u:'/application/cell-culture-perfusion.html', k:'관류 perfusion 배지 교환 연동 페리스탈틱 무오염 세포배양', c:'실험 가이드' },
    { t:'연속배양(chemostat) 유량제어', u:'/application/chemostat-continuous-culture.html', k:'연속배양 chemostat 희석률 정상상태 배지 공급 배출 연동펌프', c:'실험 가이드' },
    { t:'광배양·미세조류 정량공급', u:'/application/photobioreactor-microalgae.html', k:'광배양 미세조류 광생물반응기 photobioreactor co2 영양 정량 공급', c:'실험 가이드' },
    { t:'flow chemistry 연속흐름 반응', u:'/application/flow-chemistry.html', k:'flow chemistry 연속흐름 반응 시린지 유량비 체류시간 마그네틱 유기용매', c:'실험 가이드' },
    { t:'장기칩·오가노이드 관류', u:'/application/organ-on-chip-perfusion.html', k:'장기칩 organ on chip 오가노이드 관류 미세유체 저유량 전단응력', c:'실험 가이드' },
    { t:'실험 가이드 허브', u:'/application/', k:'응용별 셋업 가이드 펌프 튜브', c:'실험 가이드' },
    { t:'도입·논문 사례 — LeadFluid 논문 셋업', u:'/setups/', k:'논문 nature 셋업 leadfluid 펌프 사용 사례', c:'도입·논문 사례' },
    { t:'국내 A/S·정품·3년보증', u:'/trust/', k:'리드플루이드 leadfluid 국내 as 수리 정품 중국산 보증 신뢰 진단', c:'믿고 도입할 때' },
    { t:'자주 묻는 질문 FAQ', u:'/faq/', k:'질문 faq 정량펌프 연동펌프 튜브 채널 제어 수리 소프트웨어', c:'FAQ' },
    { t:'문의하기', u:'/contact/', k:'상담 수리 개발 견적 실험 문의', c:'문의하기' }
  ];
  fetch('/_build/posts.json').then(function (r) { return r.json(); }).then(function (d) {
    (d.posts || []).forEach(function (p) {
      SEARCH_INDEX.push({ t: p.title, u: p.url,
        k: (p.tags || []).join(' ') + ' ' + (p.journal || '') + ' ' + (p.model_focus || '') + ' ' + (p.application || ''),
        c: (p.type === 'setup' ? '도입·논문 사례' : '블로그') });
    });
  }).catch(function () {});

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
    { href:'/requests/',   label:'펌프 자동화 (SW)', icon:'sw', sub:[
        ['/application/pump-flow-schedule-ramp.html',       '유량 스케줄·ramp'],
        ['/application/multi-pump-sync-unattended.html',    '다펌프 동기·무인 운전'],
        ['/application/pump-run-log-csv-reproducibility.html', '운전 로그·재현'],
        ['/application/pump-pc-control-modbus-rs485.html',  'PC 제어 (Modbus·RS485)']
      ] },
    { href:'/pumps/', label:'펌프 종류', icon:'pick', sub:[
        ['/pumps/peristaltic.html',     '연동펌프'],
        ['/pumps/syringe.html',         '시린지펌프'],
        ['/pumps/metering.html',        '정량펌프(연동식)'],
        ['/pumps/gear.html',            '기어펌프'],
        ['/application/pump-selection.html', '펌프 고르는 방법']
      ] },
    { href:'/application/', label:'실험 가이드', icon:'guide', sub:[
        ['/application/cell-culture-perfusion.html',         '세포배양 관류'],
        ['/application/chemostat-continuous-culture.html',   '연속배양(chemostat)'],
        ['/application/photobioreactor-microalgae.html',     '광배양·미세조류'],
        ['/application/flow-chemistry.html',                 'flow chemistry'],
        ['/application/organ-on-chip-perfusion.html',        '장기칩·오가노이드']
      ] },
    { href:'/setups/', label:'근거·신뢰', icon:'shield', sub:[
        ['/setups/', '도입·논문 사례'],
        ['/trust/',  '믿고 도입할 때 (A/S·정품·보증)']
      ] },
    { href:'/faq/',        label:'FAQ',       icon:'faq' }
  ];
  function matches(href){ if(href.indexOf('#') > -1) return false; return href === '/' ? path === '/' : path === href; }
  function subOnPage(href){ var i = href.indexOf('#'); if(i === -1) return false; return path === (href.slice(0, i) || '/'); }
  var navHTML = NAV.map(function (n) {
    // 부모 페이지(예: /pumps/)에 있으면 부모를 활성화하고, 하위 페이지에 있으면 해당 하위탭을 활성화한다.
    var cur = matches(n.href);
    var row = '<a class="s-item' + (cur ? ' active' : '') + '" href="' + n.href + '"' +
              (cur ? ' aria-current="page"' : '') + '>' + (ICONS[n.icon] || '') +
              '<span>' + n.label + '</span></a>';
    if (n.sub) {
      // 현재 페이지와 일치하는 하위탭을 찾는다: 경로형 우선, 해시형은 해시 일치, 해시 없으면 첫 하위탭 기본 활성.
      var activeIdx = -1;
      n.sub.forEach(function (s, i) {
        var href = s[0], hi = href.indexOf('#');
        if (hi === -1) { if (matches(href)) activeIdx = i; }
        else if (subOnPage(href) && location.hash === href.slice(hi)) { activeIdx = i; }
      });
      if (activeIdx === -1 && !location.hash) {
        n.sub.forEach(function (s, i) { if (activeIdx === -1 && subOnPage(s[0])) activeIdx = i; });
      }
      row += '<div class="s-sub">' + n.sub.map(function (s, i) {
        var sc = (i === activeIdx);
        return '<a class="' + (sc ? 'active' : '') + '" href="' + s[0] + '"' +
               (sc ? ' aria-current="page"' : '') + '>' + s[1] + '</a>';
      }).join('') + '</div>';
    }
    return row;
  }).join('');

  var HEADER =
    '<header class="ch-top">' +
      '<button class="ch-burger" type="button" aria-label="메뉴" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '<a class="ch-brand" href="/">정량펌프연구소</a>' +
      '<form class="ch-search" id="chSearch" role="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg><input type="search" placeholder="검색" aria-label="사이트 검색" autocomplete="off"><div class="ch-results" id="chResults"></div></form>' +
      '<a class="ch-cta" href="/contact/">문의하기</a>' +
    '</header>' +
    '<aside class="ch-side" id="chSide"><nav>' + navHTML + '</nav>' +
      '<div class="ch-side-foot">LeadFluid 한국 공식 A/S 파트너<br>나비엠알오 등록 공급사</div>' +
    '</aside>' +
    '<div class="ch-scrim" id="chScrim"></div>';

  var FOOTER =
    '<section class="cta-band"><div class="cta-band-in">' +
      '<div class="cta-band-t">내 펌프, 소프트웨어로 완성하세요</div>' +
      '<div class="cta-band-btns">' +
        '<a href="/application/pump-pc-control-modbus-rs485" data-ga="band_check">내 펌프가 제어되나요? 확인 →</a>' +
        '<a href="/requests/" data-ga="band_sw">제어 SW 무료 받기 →</a>' +
        '<a class="cta-band-main" href="/contact/" data-ga="band_contact">무료 견적·문의 →</a>' +
      '</div></div></section>' +
    '<footer class="chrome-footer">' +
      '<div class="cf-inner">' +
        '<div class="cf-cols">' +
          '<div class="cf-col"><h4>바로가기</h4>' +
            '<a href="/requests/">소프트웨어 제어</a><a href="/application/">실험 가이드</a><a href="/setups/">도입·논문 사례</a><a href="/faq/">FAQ</a></div>' +
          '<div class="cf-col"><h4>문의</h4>' +
            '<a href="/contact/#repair">수리 문의</a><a href="/contact/#dev">개발 문의</a>' +
            '<a href="https://www.navimro.com/s/?x=0&y=0&q=leadfluid&disp=0&keyword=" target="_blank" rel="noopener" data-ga="navimro_footer">견적·구매 (나비엠알오)</a></div>' +
          '<div class="cf-col"><h4>고객센터</h4>' +
            '<a href="mailto:info@pumplab.co.kr">info@pumplab.co.kr</a>' +
            '<a href="tel:+827089832600">070-8983-2600</a>' +
            '<span>LeadFluid 한국 공식 대리점·공인 A/S 파트너</span><span>정량펌프연구소 구매 고객 3년 무상보증</span></div>' +
        '</div>' +
        '<div class="cf-co"><strong>정량펌프연구소</strong> · 이영현 · 070-8983-2600 · 사업자등록 637-05-03629<br>' +
          '부산광역시 북구 화명대로 20, 8층 801-123호 (화명동, 대성빌딩) · 도매·소매업 / 정보통신업</div>' +
        '<div class="cf-cp">© 2026 정량펌프연구소. All Rights Reserved.</div>' +
      '</div></footer>';

  var CTA_FAB =
    '<div class="cta-fab" aria-label="빠른 문의">' +
      '<a href="http://pf.kakao.com/_GCsjX" target="_blank" rel="noopener" data-ga="fab_kakao" aria-label="카카오 상담">카톡</a>' +
      '<a href="mailto:info@pumplab.co.kr" data-ga="fab_email" aria-label="이메일 문의">메일</a>' +
      '<a class="cta-fab-main" href="/contact/" data-ga="fab_contact">문의하기</a>' +
    '</div>';

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
          } else { alert('전송에 실패했습니다. 이메일로 보내주세요: info@pumplab.co.kr'); }
        })
        .catch(function () { btn.disabled = false; btn.textContent = '무료 수리진단 신청 보내기'; alert('전송에 실패했습니다. 이메일로 보내주세요: info@pumplab.co.kr'); });
    });
  }

  function inject() {
    var h = document.getElementById('pumplab-header');
    if (h) h.outerHTML = HEADER;
    var f = document.getElementById('pumplab-footer');
    if (f) f.outerHTML = FOOTER;
    if (document.body && !document.querySelector('.cta-fab')) document.body.insertAdjacentHTML('beforeend', CTA_FAB);
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
    var rbox = document.getElementById('chResults');
    if (sf && rbox) {
      var inp = sf.querySelector('input');
      function esc(s){ return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
      function doSearch() {
        var q = (inp.value || '').trim().toLowerCase();
        if (!q) { rbox.classList.remove('open'); rbox.innerHTML = ''; return; }
        var hits = SEARCH_INDEX.filter(function (it) {
          return (it.t + ' ' + (it.k || '') + ' ' + (it.c || '')).toLowerCase().indexOf(q) > -1;
        }).slice(0, 8);
        if (!hits.length) {
          rbox.innerHTML = '<div class="rempty">"' + esc(inp.value.trim()) + '" 검색 결과가 없습니다.</div>';
        } else {
          rbox.innerHTML = hits.map(function (it) {
            return '<a href="' + it.u + '"><div class="rc">' + esc(it.c || '') + '</div><div class="rt">' + esc(it.t) + '</div></a>';
          }).join('');
        }
        rbox.classList.add('open');
      }
      inp.addEventListener('input', doSearch);
      inp.addEventListener('focus', function () { if (inp.value.trim()) doSearch(); });
      sf.addEventListener('submit', function (e) {
        e.preventDefault();
        var first = rbox.querySelector('a');
        if (first) location.href = first.getAttribute('href');
      });
      document.addEventListener('click', function (e) { if (!sf.contains(e.target)) rbox.classList.remove('open'); });
    }
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

/* 구조화 데이터(Organization/WebSite/BreadcrumbList)는 build.py inject_head_schema()가
   각 페이지 <head>에 정적 주입한다(크롤러 가시화). JS 주입은 GEO상 크롤러 미가시라 제거함. */

/* ============================================================
   GA4 + 클릭 추적 — 전 페이지 공통 (무엇을 눌렀는지 측정)
   ============================================================ */
(function () {
  var GA_ID = 'G-QPK55EPDVM';

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
