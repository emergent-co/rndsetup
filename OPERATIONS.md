# Cellab 사이트 운영 지침

> 사이트 작업 중 발생한 문제와 재발 방지 규칙.
> 작업 전·후에 이 문서 한 번 훑어볼 것.

---

## 1. 파일 분류 — 자동 생성 vs 직접 편집

### 자동 생성 (직접 수정해도 빌드 시 덮어씀 — 수정 금지)

| 파일 | 생성 주체 | 입력 데이터 |
|---|---|---|
| `sitemap.xml` | `_build/build.py` | `_build/posts.json` + 하드코딩 페이지 (홈·리뷰·추천) |
| `pump.html` `tubing.html` `syringe.html` `pumphead.html` `fitting.html` `other.html` | `_build/build.py` | `_build/products.json` + `_build/categories.json` + `_build/template.html` |

### 직접 편집 가능

| 파일 | 분류 |
|---|---|
| `index.html`, `reviews.html`, `recommend.html`, `login.html`, `inquiry.html`, `admin.html` | 사이트 페이지 |
| `blog/*.html` | 블로그 글 |
| `_build/posts.json`, `setups.json`, `parts.json` | 데이터 |
| `_build/build.py`, `_build/template.html`, `_build/partial_*.html` | 빌드 스크립트·템플릿 |
| `OPERATIONS.md` (이 문서) | 운영 지침 |

### 자동 생성 파일 변경 방법

`sitemap.xml` 또는 카테고리 페이지를 변경하려면:
1. **출력물 파일을 직접 수정 금지**
2. 입력 데이터(`posts.json`, `products.json`, `categories.json`) 또는 빌드 스크립트(`build.py`, `template.html`)를 수정
3. `build.py` 실행 또는 GitHub Actions 자동 빌드

---

## 2. 발생 사례 + 재발 방지

### 사례 1: sitemap.xml 수정이 빌드 후 리버트 (2026-05-08)
- **원인:** `build.py`가 `sitemap.xml`을 매 빌드 시 옛 카테고리 기준으로 덮어씀
- **해결:** `build.py`의 sitemap 생성 로직을 `posts.json` 기반으로 수정 (2026-05-08 적용 완료)
- **재발 방지:**
  - `sitemap.xml`은 자동 생성 파일 — 직접 수정 시 다음 빌드에 덮어씀
  - 새 페이지 추가 시 `posts.json`에 등록하면 자동 sitemap 반영
  - 비-블로그 페이지(예: about, contact) 추가 시 `build.py` 하드코딩 부분 수정

### 사례 2: 블로그 HTML 파일이 중간에 잘림 (2026-05-08)
- **현상:** `bt101-ex-vivo-catheter.html`이 459줄 → 270줄로 줄어듦. 사이드바·관련글·푸터·스크립트 손실
- **원인 추정:** 외부 linter 자동 수정 또는 일괄 sed 작업의 부작용
- **해결:** `git show <이전커밋>:<파일경로>`로 복원
- **재발 방지:**
  1. 일괄 sed·find-replace 작업 전: `git status`로 깨끗한 상태 확인
  2. 큰 파일 변경 후: `wc -l <파일>`로 크기 점검 (예상치 ±10% 이내인가)
  3. 매 작업 후: `git diff`로 변경 점검
  4. 의심스러우면: 즉시 `git stash` 후 점검
  5. 작업 완료 시: 즉시 `deploy.ps1` (자동 add+commit+push) — 손실 발생 시 git에서 즉시 복원 가능

---

## 3. 사장님 작업 체크리스트

### 작업 시작 전
- [ ] `git status` — 미커밋 변경 없이 깨끗한지
- [ ] OneDrive 동기화 완료됐는지

### 작업 중
- [ ] 큰 변경 후 `git diff` 또는 `git status --short`로 변경 범위 확인
- [ ] 의심스러운 자동 수정·linter 작동 여부 점검

### 작업 완료 후
- [ ] `deploy.ps1` 실행 — 자동 add+commit+push
- [ ] GitHub Actions 빌드 1~3분 대기
- [ ] cellab.kr에서 변경 확인

---

## 4. 복원 절차 (파일 손상 시)

### Step 1: 최근 커밋 확인
```powershell
git log --oneline -10 -- blog/bt101-ex-vivo-catheter.html
```

### Step 2: 이전 버전 미리 보기
```powershell
git show <커밋해시>:blog/bt101-ex-vivo-catheter.html | head -50
```

### Step 3: 복원
```powershell
git checkout <커밋해시> -- blog/bt101-ex-vivo-catheter.html
```

### Step 4: 복원 후 즉시 deploy
```powershell
.\deploy.ps1 "복원: <파일명> from <커밋해시>"
```

---

## 5. 정기 점검 (월 1회 권장)

- [ ] `https://cellab.kr/sitemap.xml` 열어서 모든 블로그 글 포함 확인
- [ ] Google Search Console — 색인 현황·노출·검색어 확인
- [ ] 네이버 서치어드바이저 — 색인 현황·검색 분석 확인
- [ ] GA4 — 페이지뷰·체류 시간·이탈률 추세
- [ ] 깨진 링크 점검 (특히 `/Leadfluid-2025-Catalog.pdf` 같은 외부 링크)
- [ ] `_build/parts.json`의 `navi_url` placeholder(`TODO_...`) 남아있는 것 점검·갱신

---

## 6. 빌드 스크립트 흐름 (build.py)

```
입력 데이터:
  _build/products.json    (제품 데이터)
  _build/categories.json  (카테고리 메타)
  _build/posts.json       (블로그 글 메타)

템플릿:
  _build/template.html    (메인 템플릿)
  _build/partial_*.html   (카테고리별 본문 부분)

   ↓ build.py 실행

생성:
  pump.html, tubing.html, syringe.html, pumphead.html, fitting.html, other.html
  sitemap.xml
```

GitHub Actions가 `_build/` 변경 감지 시 자동 빌드 → root에 결과 반영.

---

## 7. 마스터 동선과 자동 점검 (메모리 참조)

작업·결정 시 셀렙 마스터 동선과 정합한지 점검:

```
구글·네이버 검색 → 셀렙닷컴 블로그 → 부품별 마켓 송출 → 나비엠알오 거래 → 알고리즘 가속
```

이 동선에 거스르는 작업·결정은 메모리 `feedback_cellab_master_funnel.md` 위배. 진행 전 점검.

---

**최종 갱신:** 2026-05-08
**다음 갱신 트리거:** 새 자동 생성 파일 추가 시, 새 사례 발생 시
