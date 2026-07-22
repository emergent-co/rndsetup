#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
리드플루이드 제품 상세페이지(세로형 3페이지) 생성기 — 자립형.

다른 컴퓨터에서 이어가는 법:
  1) git clone https://github.com/emergent-co/rndsetup.git
  2) 이 파일이 저장소 안에 있으면 REPO 자동 인식. (없으면 REPO 경로만 맞춰라)
  3) 의존성 설치:
       pip install qrcode[pil] img2pdf pillow playwright
       python -m playwright install chromium
       # pdftoppm(poppler) 필요: (mac) brew install poppler  (win) poppler 설치
  4) python leadfluid_catalog.py
  → 산출물: out/LEADFLUID_CT_detail.pdf  (+ pg1/2/3.png)

디자인 규칙(수정 시 유지):
  - 3페이지 리듬 통일: 「가운데 시안 pill 헤더 + 큰 이미지 + 원형 아이콘/텍스트」.
  - 톤: 화이트 + 소프트블루(#eaf4ff) + 시안 포인트(#17a2e0/#1a72c7). 페이지당 CTA 1개.
  - P1 판매자 신뢰 / P2 회사 소개(본사 실사진) / P3 제품(CT Class).
  - 학교/대학/연구기관 명단 언급 금지. AI 대화는 "AI에게 물어보면 이렇게 안내합니다".
  - 나머지 제품(BT101S 등)은 P3만 교체하면 됨(P1·P2 공통).
"""
import os, io, base64, subprocess, sys
from PIL import Image

# ---------- 경로 ----------
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.environ.get("REPO", HERE)          # 저장소 루트(이 스크립트가 저장소 안에 있으면 HERE)
IMG  = os.path.join(REPO, "img")
OUT  = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)

PUMP_PNG = os.path.join(IMG, "leadfluid", "CT3001F.png")
CERT_JPG = os.path.join(IMG, "leadfluid-authorization.jpg")
CATALOG  = os.path.join(REPO, "Leadfluid-2025-Catalog.pdf")

# ---------- 유틸 ----------
def b64f(p):
    ext = p.rsplit(".",1)[-1].lower()
    m = "image/jpeg" if ext in ("jpg","jpeg") else "image/png"
    return "data:%s;base64,%s" % (m, base64.b64encode(open(p,"rb").read()).decode())

def b64im(im):
    b = io.BytesIO(); im.convert("RGB").save(b,"JPEG",quality=88)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

def make_qr(url, path):
    import qrcode; qrcode.make(url).save(path)

def render_catalog_pages():
    # Leadfluid-2025-Catalog.pdf 의 1~2페이지를 이미지로 렌더 (HQ/응용/인증/실사용 크롭용)
    subprocess.run(["pdftoppm","-jpeg","-r","130","-f","1","-l","2",CATALOG,os.path.join(OUT,"cpage")],check=True)
    return Image.open(os.path.join(OUT,"cpage-01.jpg")), Image.open(os.path.join(OUT,"cpage-02.jpg"))

def crop(im, fx0,fy0,fx1,fy1):
    w,h = im.size
    return im.crop((int(w*fx0),int(h*fy0),int(w*fx1),int(h*fy1)))

# ---------- 에셋 준비 ----------
QR_PNG = os.path.join(OUT,"qr.png"); make_qr("https://rndsetup.com/leadfluid", QR_PNG)
PUMP = b64f(PUMP_PNG); CERT = b64f(CERT_JPG); QR = b64f(QR_PNG)
c1, c2 = render_catalog_pages()
HERO = b64im(crop(c1, 0.505,0.135,0.995,0.57))   # 실사용(펌프+플라스크)
HQ   = b64im(crop(c2, 0.028,0.145,0.475,0.332))  # 본사 건물
APPS = b64im(crop(c2, 0.518,0.735,0.996,0.986))  # 응용 5장
BADG = b64im(crop(c2, 0.523,0.40,0.667,0.474))   # ISO/CE/RoHS

# ---------- CSS ----------
CSS = r'''
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;color:#1b2733;-webkit-font-smoothing:antialiased}
.p{width:980px;background:#fff}.pad{padding:0 64px}.hl{color:#1170c4}
.pill{display:inline-block;background:linear-gradient(90deg,#17a2e0,#1a72c7);color:#fff;font-size:21px;font-weight:800;padding:9px 30px;border-radius:30px}
.pill.c{display:block;width:auto;max-width:340px;margin:0 auto;text-align:center;box-shadow:0 8px 18px rgba(23,110,199,.22)}
.hero2{background:linear-gradient(120deg,#eaf4ff,#f7fbff 55%,#fff);padding:50px 64px 0;display:flex;align-items:center;gap:28px}
.hero2 .tx{flex:1}.hero2 .kick{font-size:13px;font-weight:800;letter-spacing:2px;color:#17a2e0}
.hero2 h1{font-size:31px;font-weight:800;color:#12202e;line-height:1.28;letter-spacing:-.5px;margin-top:12px}.hero2 h1 .hl{color:#1170c4}
.hero2 .sub{font-size:14px;color:#5c6b78;margin-top:14px;line-height:1.6;max-width:470px}
.hero2 .im{flex:0 0 400px}.hero2 .im img{width:400px;height:300px;object-fit:cover;border-radius:14px;box-shadow:0 14px 30px rgba(15,60,110,.18)}
.hero-bar{height:10px;background:linear-gradient(90deg,#17a2e0,#1a72c7);margin-top:34px}
.hero{background:linear-gradient(120deg,#eaf4ff 0%,#f7fbff 55%,#fff 100%);padding:54px 64px 0}
.brand{font-size:19px;font-weight:800;letter-spacing:1px;color:#1a72c7}.brand b{color:#0e3f70}
.phero{background:linear-gradient(120deg,#eaf4ff,#f7fbff 55%,#fff);padding:50px 64px 0;display:flex;align-items:center;gap:16px}
.phero .tx{flex:1}.phero .kick{font-size:14px;font-weight:800;letter-spacing:2px;color:#17a2e0}
.phero h1{font-size:54px;font-weight:800;color:#12202e;letter-spacing:-1px;line-height:1}
.phero .s2{font-size:18px;font-weight:700;color:#41525f;margin-top:12px}
.phero .d{font-size:14px;color:#5c6b78;margin-top:14px;line-height:1.65;max-width:400px}.phero .d b{color:#1170c4}
.phero .im{flex:0 0 360px;text-align:center}.phero .im img{width:330px;filter:drop-shadow(0 16px 30px rgba(15,60,110,.2))}
.ai{padding:44px 64px 8px}
.bU{margin-left:auto;max-width:64%;background:#eef1f4;color:#2b3742;font-size:15px;font-weight:600;padding:14px 20px;border-radius:20px 20px 4px 20px}
.bW{display:flex;gap:13px;align-items:flex-start;margin-top:22px}
.ava{flex:0 0 44px;height:44px;border-radius:50%;background:#12202e;display:flex;align-items:center;justify-content:center}.ava svg{width:24px;height:24px}
.bA{background:#f2f9ff;color:#233440;font-size:15px;line-height:1.65;max-width:660px;border-left:3px solid #9ed3f2;padding:2px 4px 2px 20px}.bA b{color:#1170c4}
.cap{font-size:12px;color:#9aa5b0;text-align:right;margin-top:14px}
.kf{padding:40px 64px 8px}.kfrow{display:flex;align-items:center;gap:40px;margin-top:30px}
.kfim{flex:0 0 300px;text-align:center}.kfim img{width:300px;filter:drop-shadow(0 14px 26px rgba(15,60,110,.15))}
.kfl{flex:1;display:flex;flex-direction:column;gap:22px}
.feat{display:flex;gap:16px;align-items:flex-start}
.feat .ic{flex:0 0 54px;height:54px;border-radius:50%;border:2px solid #1a72c7;display:flex;align-items:center;justify-content:center}
.feat .ic svg{width:27px;height:27px;stroke:#1a72c7;fill:none;stroke-width:1.7}
.feat h3{font-size:18px;font-weight:800;color:#14222f}.feat p{font-size:13px;color:#5c6b78;margin-top:3px;line-height:1.55}
.cta{display:flex;align-items:center;gap:22px;margin:34px 64px 52px;background:linear-gradient(90deg,#1170c4,#0e3f70);border-radius:16px;padding:24px 32px;color:#fff}
.cta .qr{flex:0 0 90px}.cta .qr img{width:90px;border-radius:8px;background:#fff;padding:5px}
.cta .lab{font-size:13px;color:#bcd6ee;font-weight:700;letter-spacing:1px}.cta .big{font-size:25px;font-weight:800;margin-top:3px}.cta .ph{font-size:14px;color:#dbe8f5;margin-top:4px}
.ctitle{text-align:center;font-size:27px;font-weight:800;color:#12202e;letter-spacing:-.5px;margin:16px 64px 0}
.hqimg{margin:22px 64px 0}.hqimg img{width:100%;border-radius:12px;display:block}
.prof{margin:22px auto 0;max-width:800px;padding:0 64px;font-size:14px;color:#4a5762;line-height:1.8;text-align:center}.prof b{color:#1170c4}
.gstats{display:flex;margin:34px 64px 0}
.gs{flex:1;text-align:center;border-right:1px solid #eef1f4;padding:10px}.gs:last-child{border-right:0}
.gs .n{font-size:40px;font-weight:800;color:#1170c4;line-height:1}.gs .l{font-size:13px;color:#5c6b78;margin-top:8px}
.appsimg{margin:30px 64px 0}.appsimg img{width:100%;border-radius:10px;display:block}
.badgewrap{text-align:center;margin:30px 64px 0}.badgewrap img{height:54px}
.badgecap{text-align:center;font-size:12px;color:#9aa5b0;margin-top:10px;letter-spacing:1px}
.lineupflat{margin:32px 64px 0;text-align:center;font-size:14px;color:#8a95a0}.lineupflat b{color:#1170c4}
.spec{margin:8px 64px 0;border-radius:12px;overflow:hidden;border:1px solid #eef1f4}
.spec table{width:100%;border-collapse:collapse;font-size:13px}
.spec th{background:#12202e;color:#fff;font-weight:700;padding:11px 14px;text-align:center}
.spec td{padding:9px 14px;border-bottom:1px solid #f0f2f5}.spec tr:nth-child(even) td{background:#f8fafc}
.spec td.k{color:#6a7883;font-weight:600;width:210px}.spec td.v{font-weight:700;color:#17242f;text-align:center}
.apps{display:flex;flex-wrap:wrap;gap:10px 26px;padding:20px 64px 0}
.app{width:calc((100% - 52px)/3);display:flex;gap:10px;align-items:center;padding:6px 0}
.app .d{width:8px;height:8px;border-radius:50%;background:#17a2e0;flex:0 0 8px}.app span{font-size:14px;font-weight:600;color:#3a4854}
.seclabel{font-size:12.5px;font-weight:800;letter-spacing:2px;color:#17a2e0}
.foot{margin-top:40px;background:#12202e;color:#9fb0c0;font-size:12px;text-align:center;padding:16px}.foot b{color:#fff}
'''
AVA='<svg viewBox="0 0 24 24" fill="#fff"><circle cx="9" cy="10" r="1.3"/><circle cx="15" cy="10" r="1.3"/><path d="M8 15c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'
IC={
 'badge':'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>',
 'wrench':'<svg viewBox="0 0 24 24"><path d="M14.5 6.5a3.5 3.5 0 0 1-4.6 4.6L5 16l3 3 4.9-4.9a3.5 3.5 0 0 0 4.6-4.6l-2.1 2.1-2-2z"/></svg>',
 'truck':'<svg viewBox="0 0 24 24"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="17.2" r="1.5"/><circle cx="17.5" cy="17.2" r="1.5"/></svg>',
 'cube':'<svg viewBox="0 0 24 24"><path d="M12 3l7 4v10l-7 4-7-4V7z"/><path d="M12 3v18M5 7l7 4 7-4"/></svg>',
 'pulse':'<svg viewBox="0 0 24 24"><path d="M3 12h3l2-6 4 12 2-6h4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'motor':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
 'comm':'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7"/></svg>',
}
def page(x): return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>'+CSS+'</style></head><body><div class="p">'+x+'</div></body></html>'

# ---------- P1 판매자 신뢰 ----------
p1 =('<div class="hero2"><div class="tx"><div class="kick">AUTHORIZED SALES &amp; A/S PARTNER</div>'
 '<h1>리드플루이드 정품을 <span class="hl">실험셋업연구소</span>가 공식 판매하고 국내에서 <span class="hl">직접 A/S</span>합니다</h1>'
 '<div class="sub">병행수입·리퍼가 아닌 제조사 정품만 취급합니다. 국내 3년 무상보증, 전국 택배 한 번으로 수리·기술지원.</div></div>'
 '<div class="im"><img src="'+HERO+'"></div></div><div class="hero-bar"></div>')
p1+=('<div class="ai"><div class="bU">리드플루이드 펌프, 어디서 사야 정품·A/S 되나요?</div>'
 '<div class="bW"><div class="ava">'+AVA+'</div><div class="bA">국내에서는 <b>공식 판매·A/S 파트너인 실험셋업연구소</b>를 통해 구매하는 것이 안전합니다. '
 '<b>정품 공급</b>과 함께 <b>국내 3년 무상보증</b>, 택배 한 번으로 <b>국내 직접 수리·기술지원</b>을 받을 수 있습니다.</div></div>'
 '<div class="cap">* AI에게 물어보면 이렇게 안내합니다</div></div>')
p1+=('<div class="kf"><div class="pill c">공식 판매 · 국내 A/S 파트너</div><div class="kfrow">'
 '<div class="kfim"><img src="'+CERT+'" style="width:250px;border:1px solid #e6e6e6;border-radius:8px"></div><div class="kfl">'
 '<div class="feat"><div class="ic">'+IC['badge']+'</div><div><h3>공식 판매사</h3><p>제조사(LEAD FLUID)가 권한을 위임한 한국 정품 공급처입니다. 전 라인업 정품만 취급합니다.</p></div></div>'
 '<div class="feat"><div class="ic">'+IC['wrench']+'</div><div><h3>국내 공인 A/S 협력사</h3><p>국내에서 직접 수리·기술 지원을 제공합니다. 구매 시 3년 무상보증.</p></div></div>'
 '<div class="feat"><div class="ic">'+IC['truck']+'</div><div><h3>택배 한 번으로 A/S 접수</h3><p>전국 어디서나 택배 한 번으로 접수·국내 직접 수리됩니다.</p></div></div>'
 '</div></div></div>')
p1+=('<div class="cta"><div class="qr"><img src="'+QR+'"></div><div><div class="lab">구매 · A/S 문의</div>'
 '<div class="big">rndsetup.com/leadfluid</div><div class="ph">실험셋업연구소 · 070-8983-2600</div></div></div>'
 '<div class="foot"><b>LEADFLUID</b> 한국 공식 판매 · 국내 A/S : 실험셋업연구소 · rndsetup.com · 070-8983-2600</div>')

# ---------- P2 회사 소개 ----------
p2 =('<div class="hero" style="padding-bottom:8px"><div class="brand">LEAD<b>FLUID</b> '
 '<span style="font-size:13px;color:#7d8894;font-weight:600">Peristaltic · Syringe · Gear Pump</span></div></div>')
p2+='<div class="kf" style="padding:34px 64px 0"><div class="pill c">Company Profile</div></div>'
p2+='<div class="ctitle">글로벌 하이엔드 정밀 펌프 제조사, 리드플루이드</div>'
p2+='<div class="hqimg"><img src="'+HQ+'"></div>'
p2+=('<div class="prof">정밀 소형 펌프의 <b>연구·개발과 혁신</b>에 집중해온 글로벌 하이엔드 제조사입니다. '
 '미국·독일·프랑스·일본 등 세계로 수출하며, <b>전 제품이 CE·RoHS 인증</b>을 획득했습니다.</div>')
p2+=('<div class="gstats"><div class="gs"><div class="n">100+</div><div class="l">수출국 (Countries)</div></div>'
 '<div class="gs"><div class="n">1,000+</div><div class="l">글로벌 대리점 (Distributors)</div></div>'
 '<div class="gs"><div class="n">10,000+</div><div class="l">누적 고객사 (Customers)</div></div></div>')
p2+='<div class="kf" style="padding:38px 64px 0"><div class="pill c">Application Areas</div></div><div class="appsimg"><img src="'+APPS+'"></div>'
p2+='<div class="badgewrap"><img src="'+BADG+'"></div><div class="badgecap">ISO 9001 · CE · RoHS 인증</div>'
p2+=('<div class="lineupflat"><b>제품 라인업</b> &nbsp; 연동(페리스탈틱) · 시린지 · 기어 · 분주 · 방폭 펌프 · 실험실 정밀 정량 이송 전 영역</div>'
 '<div class="foot" style="margin-top:40px"><b>LEADFLUID</b> 한국 공식 판매 · 국내 A/S : 실험셋업연구소 · rndsetup.com · 070-8983-2600</div>')

# ---------- P3 제품 (CT Class) — 다른 제품은 이 블록만 교체 ----------
SPEC_ROWS = [
 ("Flow range","0 ~ 2,700 mL/min",None),("Speed range","50 ~ 3,000 rpm",None),
 ("Speed accuracy","≤ ±0.1% (0.01rpm급)",None),("Working pressure","≤ 1.0 MPa",None),
 ("Pump head","PEEK Engineering Plastic (~250℃)",None),("Display","LCD manual",'7" color touch'),
 ("Operating modes","Basic CW / CCW","Flow/Volume/Time/Copy"),("Communication","RS485 · MODBUS",None),
 ("Power supply","AC 100~240V · 50/60Hz",None),("Working env. / IP","0~40℃ · <80% RH · IP31",None),
]
def spec_table(rows, cols=("CT3001S","CT3001F")):
    h='<div class="spec"><table><tr><th style="text-align:left">Parameter</th><th>%s</th><th>%s</th></tr>'%cols
    for k,a,b in rows:
        if b is None: h+='<tr><td class="k">%s</td><td class="v" colspan="2">%s</td></tr>'%(k,a)
        else: h+='<tr><td class="k">%s</td><td class="v">%s</td><td class="v">%s</td></tr>'%(k,a,b)
    return h+'</table></div>'
FEATS=[('cube','PEEK 정밀 기어','내약품·내마모·내고온(~250℃). 고점도 유체를 정밀하게 이송.'),
 ('pulse','무맥동 · 저소음','자기결합 구조로 맥동 없는 균일 연속 이송.'),
 ('motor','서보 브러시리스 모터','고효율·무유지보수, 안정적인 속도 제어(≤±0.1%).'),
 ('comm','RS485 · MODBUS','0-5V/10V·4-20mA 외부제어 + 통신으로 자동화 연동.')]
APPLIST=['화장품·시약 정량 토출','반응물·촉매 정밀 주입','마이크로플루이딕스','크로마토그래피 주입','연속·장시간 무인 정량','고압·내화학 공정']
p3 =('<div class="phero"><div class="tx"><div class="kick">PRECISION GEAR PUMP</div><h1>CT Class</h1>'
 '<div class="s2">PEEK 헤드 정밀 기어펌프 · 2 Models</div>'
 '<div class="d">고점도 유체를 <b>무맥동·저소음</b>으로 정밀 이송하는 자기결합 기어펌프. 화장품·시약·반응물 정량 토출에 최적화되어 있습니다.</div></div>'
 '<div class="im"><img src="'+PUMP+'"></div></div><div class="hero-bar"></div>')
feat_html=''.join('<div class="feat"><div class="ic">%s</div><div><h3>%s</h3><p>%s</p></div></div>'%(IC[i],t,d) for i,t,d in FEATS)
p3+='<div class="kf"><div class="pill c">Key Features</div><div class="kfrow"><div class="kfim"><img src="'+PUMP+'"></div><div class="kfl">'+feat_html+'</div></div></div>'
p3+='<div class="pad"><div class="seclabel">SPECIFICATIONS · 기술 사양</div></div>'+spec_table(SPEC_ROWS)
p3+='<div class="pad" style="margin-top:30px"><div class="seclabel">TYPICAL APPLICATIONS · 적용 분야</div></div><div class="apps">'
p3+=''.join('<div class="app"><span class="d"></span><span>%s</span></div>'%a for a in APPLIST)+'</div>'
p3+=('<div class="cta" style="margin-top:34px"><div class="qr"><img src="'+QR+'"></div><div><div class="lab">구매 · 견적 · A/S 문의</div>'
 '<div class="big">rndsetup.com/leadfluid</div><div class="ph">실험셋업연구소 · 070-8983-2600</div></div></div>'
 '<div class="foot"><b>LEADFLUID</b> CT Class · 한국 공식 판매 · 국내 A/S : 실험셋업연구소 · rndsetup.com</div>')

# ---------- 저장·렌더·PDF ----------
for n,c in (("pg1",p1),("pg2",p2),("pg3",p3)):
    open(os.path.join(OUT,n+".html"),"w",encoding="utf-8").write(page(c))

from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for n in ("pg1","pg2","pg3"):
        pg = b.new_page(viewport={"width":980,"height":1200}, device_scale_factor=2)
        pg.goto("file://"+os.path.join(OUT,n+".html"), wait_until="networkidle")
        pg.screenshot(path=os.path.join(OUT,n+".png"), full_page=True)
        pg.close()
    b.close()

import img2pdf
outs=[]
for i in (1,2,3):
    im=Image.open(os.path.join(OUT,"pg%d.png"%i)).convert("RGB"); w,h=im.size; px=im.load(); bottom=h
    for y in range(h-1,-1,-1):
        if any(px[x,y][0]<245 or px[x,y][1]<245 or px[x,y][2]<245 for x in range(0,w,40)):
            bottom=y+1; break
    im=im.crop((0,0,w,min(h,bottom+24))); p=os.path.join(OUT,"c%d.png"%i); im.save(p); outs.append(p)
open(os.path.join(OUT,"LEADFLUID_CT_detail.pdf"),"wb").write(img2pdf.convert(outs))
print("완료:", os.path.join(OUT,"LEADFLUID_CT_detail.pdf"))
