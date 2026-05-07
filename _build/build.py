"""
정적 카테고리 페이지 빌드 스크립트
============================================================
사용법: build.bat 더블클릭

입력:
  _build/template.html              공통 골격
  _build/partial_<id>.html          카테고리별 본문 (full)
  _build/partial_preparing.html     준비중 본문
  _build/categories.json            카테고리별 SEO 메타·콘텐츠
  _build/products.json              전 카테고리 통합 제품 데이터

출력 (워크스페이스 루트):
  pump.html / tubing.html / syringe.html / pumphead.html / fitting.html / other.html
  sitemap.xml

새 제품 추가:
  admin.html에서 편집 → JSON 다운로드 → _build/products.json 덮어쓰기 → build.bat
============================================================
"""

import json
import os
from html import escape
from urllib.parse import quote


# 80% 마켓 송출 / 20% 자사몰 (PSYS 카드결제 = 견적 후 안내)
KAKAO_INQUIRY_URL = 'http://pf.kakao.com/_GCsjX'


def append_utm(url, source_campaign):
    if not url:
        return url
    sep = '&' if '?' in url else '?'
    return url + sep + 'utm_source=cellab&utm_medium=catalog&utm_campaign=' + source_campaign


def build_market_urls(p):
    cat = p.get('category', 'pump')
    model = p.get('code') or p.get('id') or ''
    buy_a = (p.get('buy_allforlab_url') or '').strip()
    buy_n = (p.get('buy_navimro_url') or '').strip()
    if not buy_a:
        buy_a = 'https://www.allforlab.com/search?k=' + quote(model)
    if not buy_n:
        buy_n = 'https://www.navimro.com/search?q=' + quote(model)
    return append_utm(buy_a, 'allforlab_' + cat), append_utm(buy_n, 'navimro_' + cat)


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)


def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def write(path, content):
    """변경된 경우에만 파일 쓰기 (OneDrive 동기화 부담 감소)."""
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                existing = f.read()
            if existing == content:
                return False  # 변경 없음 → 안 씀
        except Exception:
            pass
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True


def build_seo_intro(h1_text, intro_text):
    return (
        '<div class="seo-intro">\n'
        f'      <h1>{escape(h1_text)}</h1>\n'
        f'      <p>{escape(intro_text)}</p>\n'
        '    </div>'
    )


def render_product_card(p, spec_labels):
    """단일 제품 → 카드 HTML. 스펙 라벨은 카테고리별로 다름."""
    if p.get('visible') is False:
        return ''
    cat = p.get('category', 'pump')
    labels = spec_labels.get(cat, ['스펙1','스펙2','스펙3','스펙4'])
    name = escape(p['name'])
    code = escape(p.get('code', p.get('id', '')))
    spec1 = escape(p.get('spec1', ''))
    spec2 = escape(p.get('spec2', ''))
    spec3 = escape(p.get('spec3', ''))
    spec4 = escape(p.get('spec4', ''))
    price = p.get('price', 0)
    price_text = p.get('price_text') or (f'{price:,}원' if price > 0 else '견적 문의')
    cat_page = p.get('catalog_page', 1)
    pid = escape(p['id'])
    keywords = p.get('keywords', [])
    kw_html = ''.join(f'              <span class="prod-kw">{escape(k)}</span>\n' for k in keywords[:3])

    # 이미지: image_url 있으면 <img>, 없으면 placeholder (코드 + 시리즈)
    image_url = (p.get('image_url') or '').strip()
    if image_url:
        img_html = f'<img src="{escape(image_url)}" alt="{name}" loading="lazy" style="width:100%;height:100%;object-fit:contain">'
    else:
        img_html = f'<span class="ph-code">{code}</span><span class="ph-series">{escape(spec1)}</span>'

    # 마켓 송출 URL (메인) — buy URL 우선, 없으면 검색 URL fallback. UTM 자동.
    buy_a, buy_n = build_market_urls(p)

    return f'''<div class="prod-card">
        <a class="prod" href="Leadfluid-2025-Catalog.pdf#page={cat_page}" target="_blank" rel="noopener">
          <div class="prod-img">{img_html}</div>
          <div class="prod-body">
            <div class="prod-name">{name}</div>
            <div class="prod-spec"><span class="label">{escape(labels[0])}</span><span class="val">{spec1}</span></div>
            <div class="prod-spec"><span class="label">{escape(labels[1])}</span><span class="val">{spec2}</span></div>
            <div class="prod-spec"><span class="label">{escape(labels[2])}</span><span class="val">{spec3}</span></div>
            <div class="prod-spec"><span class="label">{escape(labels[3])}</span><span class="val">{spec4}</span></div>
            <div class="prod-spec"><span class="label">가격</span><span class="val price">{escape(price_text)}</span></div>
            <div class="prod-tags">
{kw_html.rstrip()}
            </div>
          </div>
        </a>
        <div class="prod-actions">
          <a href="{escape(buy_a)}" target="_blank" rel="noopener" class="btn-buy btn-buy-primary">올포랩에서 구매</a>
          <a href="{escape(buy_n)}" target="_blank" rel="noopener" class="btn-buy btn-buy-secondary">나비엠알오</a>
        </div>
        <div class="prod-actions-inquiry">
          <a href="{KAKAO_INQUIRY_URL}" target="_blank" rel="noopener" class="btn-inquiry">견적·직접문의 (카카오톡)</a>
        </div>
      </div>'''


def render_category_jsonld(cat_id, cat_data, products, base_url, page_url):
    """카테고리별 BreadcrumbList + ItemList JSON-LD."""
    visible = [p for p in products if p.get('visible') is not False]
    label = cat_data.get('breadcrumb_label', cat_id)

    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "홈", "item": f"{base_url}index.html"},
            {"@type": "ListItem", "position": 2, "name": "카탈로그", "item": page_url},
            {"@type": "ListItem", "position": 3, "name": label}
        ]
    }

    product_items = []
    for p in visible:
        kw = p.get('keywords', [])
        desc = ' · '.join([p.get('spec1',''), p.get('spec2',''), p.get('spec3',''), p.get('spec4','')] + [', '.join(kw)] if kw else [p.get('spec1',''), p.get('spec2',''), p.get('spec3',''), p.get('spec4','')])
        product_items.append({
            "@type": "Product",
            "name": p['name'],
            "description": desc,
            "category": cat_data.get('h1', label),
            "brand": {"@type": "Brand", "name": "Lead Fluid"},
            "manufacturer": {"@type": "Organization", "name": "Lead Fluid"},
            "offers": {
                "@type": "Offer",
                "priceCurrency": "KRW",
                "price": p.get('price', 0),
                "availability": "https://schema.org/InStock",
                "seller": {"@type": "Organization", "name": "Cellab"},
                "url": f"{base_url}Leadfluid-2025-Catalog.pdf#page={p.get('catalog_page', 1)}"
            }
        })

    itemlist = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": f"Cellab {label} 카탈로그",
        "numberOfItems": len(product_items),
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "item": pi}
            for i, pi in enumerate(product_items)
        ]
    }

    bc = json.dumps(breadcrumb, ensure_ascii=False, indent=2)
    il = json.dumps(itemlist, ensure_ascii=False, indent=2)
    return (
        '<script type="application/ld+json">\n' + bc + '\n</script>\n'
        '<script type="application/ld+json">\n' + il + '\n</script>'
    )


def render_page(cat_id, cat_data, template, partial_full, partial_preparing,
                base_url, products_by_cat, spec_labels):
    if cat_data.get('content') == 'full':
        content_block = partial_full
    else:
        content_block = partial_preparing.replace('{{CAT_LABEL}}', cat_data['breadcrumb_label'])

    seo_intro = build_seo_intro(cat_data['h1'], cat_data['intro'])
    content_block = content_block.replace('{{SEO_INTRO_BLOCK}}', seo_intro)

    canonical = base_url.rstrip('/') + '/' + cat_id + '.html'

    # PRODUCTS_OR_PREPARING — preparing partial 안의 분기 placeholder
    # 제품이 있으면 grid, 없으면 cat-prep(준비중) 패널
    if '{{PRODUCTS_OR_PREPARING}}' in content_block:
        cat_products = [p for p in products_by_cat.get(cat_id, []) if p.get('visible') is not False]
        label = cat_data['breadcrumb_label']
        if cat_products:
            cards = '\n\n      '.join(render_product_card(p, spec_labels) for p in cat_products)
            block = (
                '<div style="background:#e6f1fb;border:1px solid #b5d4ee;color:#1a4d7a;'
                'padding:12px 16px;border-radius:8px;margin-bottom:14px;font-size:12.5px">'
                '이 카테고리는 정식 카탈로그 준비 중입니다. 아래 제품은 임시 등록 항목으로, '
                '카테고리별 정식 분류·필터는 곧 추가됩니다.'
                '</div>\n'
                '<div class="products" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">\n'
                + cards +
                '\n</div>'
            )
        else:
            block = (
                '<div class="cat-prep">\n'
                f'  <h2>{escape(label)} 카탈로그 준비중</h2>\n'
                f'  <p>곧 {escape(label)} 큐레이션 카탈로그를 공개합니다.<br>\n'
                '  먼저 필요한 사양이 있으시면 카톡·이메일로 견적 문의 부탁드립니다.</p>\n'
                '  <div class="cta-row">\n'
                '    <a class="primary" href="index.html#contact">상담 문의 →</a>\n'
                '    <a class="secondary" href="Leadfluid-2025-Catalog.pdf" target="_blank">카탈로그 PDF 보기</a>\n'
                '    <a class="secondary" href="tubing.html">튜브 카탈로그로 이동</a>\n'
                '  </div>\n'
                '</div>'
            )
        content_block = content_block.replace('{{PRODUCTS_OR_PREPARING}}', block)

    # PRODUCTS_HTML — 해당 카테고리 제품만
    if '{{PRODUCTS_HTML}}' in content_block:
        cat_products = products_by_cat.get(cat_id, [])
        cards = '\n\n      '.join(
            render_product_card(p, spec_labels)
            for p in cat_products
            if p.get('visible') is not False
        )
        content_block = content_block.replace('{{PRODUCTS_HTML}}', cards or '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888">아직 등록된 제품이 없습니다.</div>')

    # JSON_LD — 카테고리별 BreadcrumbList + ItemList
    if '{{JSON_LD_PUMP}}' in content_block:
        cat_products = products_by_cat.get(cat_id, [])
        if cat_products:
            jsonld = render_category_jsonld(cat_id, cat_data, cat_products, base_url, canonical)
            content_block = content_block.replace('{{JSON_LD_PUMP}}', jsonld)
        else:
            content_block = content_block.replace('{{JSON_LD_PUMP}}', '')

    html = template
    html = html.replace('{{TITLE}}', cat_data['title'])
    html = html.replace('{{META_DESC}}', cat_data['meta_description'])
    html = html.replace('{{BREADCRUMB_LABEL}}', cat_data['breadcrumb_label'])
    html = html.replace('{{CANONICAL_URL}}', canonical)
    html = html.replace('{{CONTENT_BLOCK}}', content_block)

    intro_css = (
        '<style>\n'
        '.seo-intro{background:#fff;border:1px solid #e3e8ef;border-radius:8px;padding:18px 22px;margin-bottom:14px}\n'
        '.seo-intro h1{font-size:20px;font-weight:700;color:#0a2540;margin:0 0 8px;letter-spacing:-.01em}\n'
        '.seo-intro p{font-size:13px;color:#5a6779;line-height:1.65;margin:0}\n'
        '</style>\n</head>'
    )
    if '.seo-intro' not in html:
        html = html.replace('</head>', intro_css)

    return html


def main():
    print('=' * 60)
    print('  Cellab 카테고리 페이지 빌드')
    print('=' * 60)

    template = read(os.path.join(SCRIPT_DIR, 'template.html'))
    partial_tubing = read(os.path.join(SCRIPT_DIR, 'partial_tubing.html'))
    partial_pump = read(os.path.join(SCRIPT_DIR, 'partial_pump.html'))
    partial_preparing = read(os.path.join(SCRIPT_DIR, 'partial_preparing.html'))

    with open(os.path.join(SCRIPT_DIR, 'categories.json'), 'r', encoding='utf-8') as f:
        cats_config = json.load(f)

    # products.json (통합) 또는 fallback pumps.json (구버전)
    products = []
    spec_labels = {}
    products_path = os.path.join(SCRIPT_DIR, 'products.json')
    pumps_path = os.path.join(SCRIPT_DIR, 'pumps.json')
    if os.path.exists(products_path):
        with open(products_path, 'r', encoding='utf-8') as f:
            pdata = json.load(f)
        products = pdata.get('products', [])
        spec_labels = pdata.get('_spec_labels', {})
        print(f'  products.json: {len(products)}개 제품')
    elif os.path.exists(pumps_path):
        with open(pumps_path, 'r', encoding='utf-8') as f:
            pdata = json.load(f)
        for p in pdata.get('pumps', []):
            p2 = dict(p)
            p2['category'] = 'pump'
            # 옛 필드명 → spec1~4
            p2['spec1'] = p.get('series', '')
            p2['spec2'] = p.get('flow', '')
            p2['spec3'] = p.get('heads', '')
            p2['spec4'] = p.get('control', '')
            products.append(p2)
        spec_labels = {'pump': ['시리즈','유량','헤드','제어']}
        print(f'  pumps.json (legacy): {len(products)}개 펌프 (products.json으로 마이그레이션 권장)')

    # 카테고리별 그룹화
    products_by_cat = {}
    for p in products:
        cat = p.get('category', 'pump')
        products_by_cat.setdefault(cat, []).append(p)

    base_url = cats_config.get('_base_url', 'https://cellab.kr/')
    cats = cats_config['categories']
    partials_full = {'tubing': partial_tubing, 'pump': partial_pump}

    print(f'\n카테고리 {len(cats)}개:\n')
    for cat_id, n in [(c, len(products_by_cat.get(c, []))) for c in cats]:
        print(f'  {cat_id}: {n}개 제품')
    print()

    written = []
    for cat_id, cat_data in cats.items():
        partial_full = partials_full.get(cat_id, partial_tubing)
        html = render_page(cat_id, cat_data, template, partial_full, partial_preparing,
                          base_url, products_by_cat, spec_labels)
        out_path = os.path.join(ROOT_DIR, f'{cat_id}.html')
        write(out_path, html)
        size_kb = len(html.encode('utf-8')) / 1024
        kind = '전체 카탈로그' if cat_data['content'] == 'full' else '준비중'
        n_prod = len(products_by_cat.get(cat_id, []))
        print(f'  [{cat_id:<10}] {cat_id}.html  ({size_kb:5.1f} KB · {kind} · {n_prod}개)')
        written.append(cat_id)

    sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>',
                     '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap_lines.append(f'  <url><loc>{base_url}</loc><priority>1.0</priority></url>')
    sitemap_lines.append(f'  <url><loc>{base_url}index.html</loc><priority>1.0</priority></url>')
    for cat_id in written:
        sitemap_lines.append(f'  <url><loc>{base_url}{cat_id}.html</loc><priority>0.8</priority></url>')
    sitemap_lines.append('</urlset>')
    write(os.path.join(ROOT_DIR, 'sitemap.xml'), '\n'.join(sitemap_lines) + '\n')

    print('\n' + '=' * 60)
    print(f'  완료: {len(written)}개 페이지 + sitemap.xml')
    print('=' * 60)


if __name__ == '__main__':
    main()
