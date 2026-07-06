# GEO 로드맵 — 남은 작업(4~7) 이어가기용 핸드오프

> **목적:** 다른 컴퓨터·새 세션에서 이 문서만 읽으면 GEO 작업을 그대로 이어갈 수 있게 한다.
> **대전제:** GEO 최적화가 **0순위**(`OPERATIONS.md §0`). 모든 변경은 "GEO에 유리한가"를 먼저 통과해야 한다.
> 시작 전 `git pull` 필수. 작업은 파일도구 편집 → PowerShell `git add -A; commit; push`. 배포는 Cloudflare Pages 자동(빌드 `python _build/build.py`).

---

## A. 지금까지 완료 (참고)

- **IA 정리**: `셋업사례→논문 사례` rename / 실험 가이드 허브는 **방법 5편**만(선택 3종은 「펌프 고를 때」로 분리, 허브 하단 링크로 발견성 유지) / 리다이렉트 체인 제거(`reviews→/setups/`, `tubing→/application/tube-selection.html`, `recommend2·recommend(비임베드)→/application/pump-selection.html`) / 구형 페이지 정리(`leadfluid` noindex+redirect, `inquiry` noindex+redirect) / 위저드(recommend.html embed) 결과 CTA를 나비엠알오+contact로.
- **GEO 1~3**: `build.py inject_static_nav()`(전 페이지 푸터에 사이트 전체 링크 정적 주입 — 크롤러 가시화) / `build_setups()`(논문 목록·정답블록 정적 렌더) / `llms.txt` 새 IA로 재작성.
- **전환**: 홈·가이드 CTA에 "나비엠알오에서 구매" + "제어 SW 무상·3년 A/S" 캡션. GA4 주요 이벤트 3종(`navimro_click`·`generate_lead`·`file_download`) 지정 완료.
- **인증**: 홈에 google+naver(`388fb335…`) 사이트 인증 정착.

## B. 반드시 지킬 규약

1. **새 콘텐츠 페이지 필수 요건**: ① 질문형 롱테일 제목 ② 첫 문단 **정답 블록(80~100자)** ③ JSON-LD(`TechArticle`+`FAQPage`, 필요시 `Product`·`BreadcrumbList`) ④ **내부 링크가 raw HTML에 존재** ⑤ 1페이지=1주제.
2. **SSOT**: 콘텐츠 메타는 `_build/posts.json`에만 추가(`type`=`setup`|`guide`, 숨기려면 `noindex:true`). → 홈 최신아티클·사이트검색·sitemap·`/setups/` 목록에 **자동 반영**. 유틸 페이지(위저드 등)는 `build.py`의 `static_pages` 목록에.
3. **정적 렌더 패턴**: `build.py`의 `_inject_between(html, '<!--X_START-->', '<!--X_END-->', content)` 사용. 대상 페이지에 마커를 심고 build.py에서 주입. 마커 못 찾으면 경고만 하고 skip(배포 안 깨짐).
4. **크롤러 nav**: 신규 페이지는 `build.py`의 `CRAWLER_LINKS`에 추가해야 전 페이지 푸터 정적 링크에 포함됨.
5. **검증은 배포 후**: `web_fetch`(또는 `curl`)로 **raw HTML**을 받아 링크·정답블록·스키마가 JS 없이 보이는지 확인. (site.js는 JS 주입이라 크롤러 미가시 → 정적 주입이 핵심)
6. **주의(마운트 지연)**: 샌드박스 bash 마운트가 파일도구 편집을 즉시 반영 못 할 때가 있음(잘린 뷰). **파일도구 Read가 authoritative.** 로컬 `py_compile` 실패가 마운트 truncation 때문일 수 있으니, 코드 패턴은 독립 스크립트로 검증하고 최종은 배포 후 web_fetch로 확인.
7. **날조 금지**: 논문·수치·인용은 실제 출처(DOI·원문)로만. 못 찾으면 쓰지 않는다. LeadFluid 명시 논문만 "논문 사례"로.

---

## C. 남은 작업

### 4. 연구군 토픽 클러스터 완성 — **GEO 임팩트 최대, 먼저 할 것**

**문제:** 논문 사례 3편(뇌전극·카테터·CO₂포집)이 우선 연구군(관류배양·연속배양·광배양)과 불일치 → "방법 가이드 + 증거 논문 + 제품/제어" 삼각형이 끊겨 있음. AI는 한 주제로 뭉친 클러스터를 인용에 선호.

**할 일**
- 우선 연구군에 맞는 **논문 사례 추가**(각 1논문=1페이지). `setups/`에 신규 `.html` 생성 + `_build/posts.json`(`type:setup`) 등록 + `CRAWLER_LINKS` 등록.
  - 템플릿: 기존 `setups/brain-electrode-tyd01.html` 구조 그대로(`sd-wrap`, `TechArticle`+`FAQPage` JSON-LD, 정답블록, 원문 인용문+DOI, sd-bridge CTA).
  - 제목은 질문형: 예) "관류배양 논문은 어떤 펌프를 썼나 — LeadFluid BT○○ (저널 연도)".
  - **실제 LeadFluid 명시 논문만.** 원문 인용·DOI 필수. 관류/연속배양/광배양에서 LeadFluid 사용 논문을 리서치해 확보.
- **클러스터 상호링크**(핵심): 각 실험 가이드(`application/*`)의 `sd-related`에 대응 논문 사례 카드 추가, 논문 사례 페이지의 `sd-related`에 대응 [가이드 + 펌프 선택 + 소프트웨어 제어] 링크.
  - 예(관류 pillar): `cell-culture-perfusion.html` ↔ 관류 논문 사례 ↔ `pump-selection.html` ↔ `/requests/`.

**수용 기준:** 우선 연구군마다 [가이드·논문·선택·제어] 4각형이 raw HTML에서 상호 링크됨.

### 5. 소프트웨어 moat 토픽 분리 — 독립 롱테일 페이지

**문제:** `/requests/` 하위 4토픽이 한 페이지의 해시 앵커로 뭉쳐 있어 각 롱테일 인용력이 약함.
- `#control` Modbus·RS-485·Python 제어 / `#schedule` 유량 스케줄·ramp·레시피 / `#sync` 다펌프 동기·무인 운전 / `#record` 운전 로그 기록·재현.

**할 일:** 검색량 큰 것부터 **독립 페이지화**. 좋은 템플릿 = `application/pump-pc-control-modbus-rs485.html`(정답블록+FAQPage+체크리스트+CTA+sd-related).
- 후보 제목(질문형):
  - "연동펌프 유량을 스케줄·ramp로 자동화하는 법"
  - "다펌프를 동기화해 무인 장시간 연속운전 구성하는 법"
  - "펌프 운전 로그(CSV)로 실험을 재현하는 법"
- 각각 `posts.json`(`type:guide`) + `CRAWLER_LINKS` + `site.js` NAV(자동화/펌프 그룹) 등록. `/requests/` 본문 해당 섹션에서 "자세히 →"로 링크.

**수용 기준:** 각 토픽이 질문형 제목+정답블록+FAQPage를 가진 독립 URL. sitemap·llms.txt 반영.

### 6. 스키마 보강 (FAQPage·BreadcrumbList) — 크롤러 정적 가시화

**할 일**
- **FAQPage** 없는 허브에 추가: `application/index.html`, `setups/index.html`(정답블록 있음, 스키마 추가). `faq/`는 기존 확인.
- **BreadcrumbList JSON-LD**를 전 콘텐츠 페이지에 추가. **권장: `build.py`에 `inject_breadcrumbs()` 신설** — 페이지 경로·제목 기반으로 `홈 > 섹션 > 현재` BreadcrumbList 생성해 `<head>` 마커(예 `<!--BC-->`)에 정적 주입(SSOT). 또는 페이지별 정적 삽입.
- **중요:** `site.js`가 `Organization`/`WebSite` JSON-LD를 **JS로** 주입 중 → 크롤러 미가시. GEO상 이 스키마도 `build.py` 정적 주입으로 옮기는 게 이상적(본 항목에 포함 검토).

**수용 기준:** Rich Results Test에서 FAQPage·BreadcrumbList 감지. raw HTML에 스키마 존재(Organization 포함).

### 7. 메뉴 대재편 (연구군 pillar) — **신중, 4·5·6 후**

**문제:** 콘텐츠 메뉴 4개(논문 사례/펌프 고를 때/실험을 자동화할 때/실험 가이드)에 제품축·응용축이 혼재.
**할 일(검토 후):** 응용(연구군)을 pillar로 세우고 각 아래 방법·증거·제품·제어를 매달기. `site.js` NAV 구조 + 전 페이지 breadcrumb 동시 변경 필요 → 큰 작업. **4·5·6 완료 후 GA로 효과 측정하고 진행 여부 결정.**
**수용 기준:** 유저 여정(선택/방법/증거/제어)이 명확하고 GEO 클러스터 구조와 일치.

---

## D. 매 작업 후 GEO 체크리스트

1. `web_fetch`로 raw HTML 받아 내부링크·정답블록·스키마가 **JS 없이** 보이는가?
2. 죽은 링크·리다이렉트 체인(2홉+) 없는가?
3. `llms.txt`·`sitemap.xml`이 최신 IA와 일치하는가?
4. `posts.json` SSOT 반영(홈 최신아티클·검색 자동 반영) 확인.
5. Rich Results Test로 스키마 감지 확인.

## E. 파일·경로 레퍼런스

| 역할 | 경로 | 메모 |
|---|---|---|
| 빌드 | `_build/build.py` | `inject_static_nav`·`build_setups`·`build_requests`·sitemap. `CRAWLER_LINKS`, `static_pages` 목록 |
| 콘텐츠 SSOT | `_build/posts.json` | `type=setup\|guide`, `noindex` 플래그 |
| 공유 nav/footer/GA/JSON-LD | `assets/site.js` | `NAV` 배열, `SEARCH_INDEX`, Organization/WebSite(JS주입) |
| 스타일 | `assets/site.css` | `sd-*`(상세) `ag-*`(가이드허브) `st-*`(논문허브) `ch-*`(크롬) |
| 리다이렉트 | `_redirects` + 각 옛 html 스텁 | Cloudflare 서버 301 |
| AI 지도 | `llms.txt`, `robots.txt` | AI 크롤러 Allow |
| 원칙 | `OPERATIONS.md §0` | GEO 0순위 |
| 배포 | Cloudflare Pages | 빌드 `python _build/build.py`, main 푸시 자동. GitHub Pages는 꺼도 됨(실패 무시) |
