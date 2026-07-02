# Cellab 사이트 운영 지침

> 작업 전·후에 훑어볼 것. 안전 규칙은 `CRITICAL_RULES.md`.

## 1. 사이트 구조

정적 사이트 · GitHub Pages(`emergent-co/cellab`) · 도메인 cellab.kr.

**공유 크롬(SSOT):** `assets/site.js`가 `#cellab-header`/`#cellab-footer`에 상단바+좌측 사이드바+푸터를 주입. `assets/site.css`가 색·폰트 토큰과 사이드바·아티클·검색 스타일. 색=네이비 `#1E3A5F`, 폰트=Pretendard.

**사이드바 그룹:** 홈 / 셋업사례(`/setups/`) / 펌프를 고를 때 / 실험을 자동화할 때(`/requests/`) / 실험별 셋업 가이드 / 믿고 도입할 때(`/trust/`) / 문의하기 / FAQ. 규칙: 대표탭 href = 첫 하위탭 href, 활성표시는 부모가 아니라 현재 하위탭.

**주요 페이지:**

| 경로 | 역할 |
|---|---|
| `index.html` | 첫 진입 · 위저드·가이드·사례 카드 + 견적 CTA |
| `recommend.html` | 펌프 추천 위저드(의사결정 핵심) |
| `leadfluid.html` | LeadFluid 카탈로그(deep link 목적지) |
| `inquiry.html` | 견적 문의(전환점) |
| `application/` | 실험 가이드(관류·펌프선택·튜브선택·연속배양·광배양·flowchem·장기칩) |
| `setups/` | 셋업 사례(index + 상세) |
| `trust/` `contact/` `faq/` `product/` `quote/` `repair/` `requests/` | 각 기능 페이지 |

**리다이렉트 스텁(옛 URL SEO 보존, 삭제 금지):** `reviews.html`→`/product/`, `recommend2.html`→`/recommend.html`, `tubing.html`→`/application/`.

## 2. 데이터 · 빌드

**SSOT 데이터(`_build/`):** `catalog.json`(펌프), `posts.json`(셋업 사례 메타, `type=setup`), `products.json`, `parts.json`, `categories.json`, `settings.json`.

`_build/build.py`가 `_build/` 변경 시 GitHub Actions로 자동 실행 → `sitemap.xml` 생성. 신규 셋업/페이지 추가 시 `posts.json` 등록하면 sitemap 자동 반영, 비-데이터 페이지는 `build.py` 목록에 추가.

**자동 생성 파일(직접 수정 금지 — 빌드가 덮어씀):** `sitemap.xml`. 변경하려면 입력 데이터나 `build.py`를 수정.

## 3. 폼 · 분석

- 문의 폼: Formspree. GA4 `G-CN3E3PVQVD`, `generate_lead`는 폼 성공 응답에 발화.

## 4. 배포

```powershell
cd C:\dev\cellab_homepage
git pull origin main
# ...작업...
git add -A; git commit -m "요약"; git pull origin main --no-edit; git push
```

lock 파손 시 `Remove-Item .git\*.lock -Force`. 배포 전 로컬 확인 `python -m http.server 8000` → localhost:8000. GitHub Actions 빌드 1~3분 대기 후 cellab.kr 확인.

**멀티컴퓨터:** 작업 폴더는 어느 PC에나 있을 수 있음. Drive/OneDrive 동기화 금지, git pull/push만. 시작 시 `git pull` 필수(안 하면 conflict). pull 깜빡 시 `git stash` → `git pull` → `git stash pop`.

## 5. 정기 점검(월 1회)

- `cellab.kr/sitemap.xml` 전 페이지 포함 확인
- Google Search Console·네이버 서치어드바이저 색인 현황
- GA4 페이지뷰·체류·이탈·견적 전환
- 깨진 링크(특히 `/Leadfluid-2025-Catalog.pdf`)
- `_build/parts.json`의 `navi_url` placeholder(`TODO_...`) 갱신

## 6. 발생 사례(교훈)

- **HTML 중간 잘림** — 일괄 sed·linter 부작용. 방지: 파일별 Edit, 작업 후 `wc -l` 점검, 완료 즉시 push(git 복원 가능).
- **CRLF↔LF 노이즈로 35개 파일 미커밋 누적 + PDF 손상** — `.gitattributes`(`* text=auto eol=lf` + 바이너리 명시) + `git config core.autocrlf true`로 해결. `git status`에 파일이 비정상적으로 많으면 `git diff -w --stat`로 확인(insertions==deletions면 줄바꿈 문제).
