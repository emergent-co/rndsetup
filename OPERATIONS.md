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
| `.gitattributes` | 줄바꿈·바이너리 정책 파일 — 변경 시 반드시 본 문서도 함께 갱신 |
| `blog/naver/*-naver.html` | 네이버 cellab01 발행용 HTML — 셀렙닷컴 본문에 대응하는 네이버 친화 버전 (8장 정책 참조) |

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

### 사례 3: 35개 파일이 줄바꿈(CRLF↔LF)만 다른 채 미커밋으로 누적 (2026-05-09)
- **현상:** `git status`에 35개 파일 modified. 그러나 `git diff -w` (공백 무시)는 0줄. 실제 콘텐츠 변경 0. PDF까지 +141바이트 손상
- **원인:** 저장소엔 LF로 저장됐는데 Windows 디스크엔 CRLF로 체크아웃돼있고, `.gitattributes` 없음 + `core.autocrlf` 미설정 → 매 체크아웃마다 영구 diff 노이즈 발생. 바이너리 파일(PDF)까지 텍스트로 잘못 인식돼 손상
- **해결:**
  1. `.gitattributes` 추가 (`* text=auto eol=lf` + 바이너리 명시)
  2. `git config core.autocrlf true` (Windows 안전판)
  3. PDF 등 손상 파일 `git checkout -- <file>`로 재추출
  4. stale `.git/index.lock` 발생 시 `Remove-Item C:\dev\cellab\.git\index.lock`로 삭제
- **재발 방지:**
  1. **`.gitattributes`는 이 저장소의 정책 파일 — 절대 삭제·임의 수정 금지** (변경 시 본 문서 함께 갱신)
  2. PDF/이미지 등 새 바이너리 형식 추가 시 `.gitattributes`에 `*.<ext> binary` 추가
  3. `git status`에 비정상적으로 많은 파일이 modified로 보이면 즉시 `git diff -w --stat`로 비교 — 출력이 비면 줄바꿈 노이즈
  4. 빠른 식별: `git diff --stat` 결과 `insertions == deletions`이면 99% 줄바꿈 문제
  5. 다른 PC에서 클론 시: `git config core.autocrlf true` 자동 설정 확인
  6. 빌드 스크립트가 파일을 새로 쓸 때 LF로 쓰도록 보장 (Python: `newline='\n'` 명시 권장)

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
- [ ] **네이버 cellab01 블로그 통계** — 방문수·검색 유입 키워드·인기글 추세
- [ ] GA4 — 페이지뷰·체류 시간·이탈률·`referrer = blog.naver.com` 트래픽 확인
- [ ] 깨진 링크 점검 (특히 `/Leadfluid-2025-Catalog.pdf` 같은 외부 링크)
- [ ] `_build/parts.json`의 `navi_url` placeholder(`TODO_...`) 남아있는 것 점검·갱신
- [ ] 셀렙닷컴 ↔ 네이버 양방향 백링크 살아있는지 클릭 테스트

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

## 7. 블로그 글 발행 정책 — 셀렙닷컴 + 네이버 cellab01 동시 발행

### 원칙

- 신규 블로그 글은 **반드시 두 채널 동시 발행** — 셀렙닷컴 (사이트 본문) + 네이버 cellab01 (네이버 검색 유입)
- 네이버 글이 없으면 마스터 동선 입구(네이버 검색 → 블로그)가 비어 하류 작업(부품 마켓 송출 등)이 효과 없음

### 작업 흐름 (글 1편당)

1. `blog/<slug>.html` — 셀렙닷컴 본문 (학술적·바로 본론 톤, hero 이미지 자체 호스팅)
2. `_build/posts.json`에 슬러그·제목·메타 등록 → sitemap 자동 반영
3. `blog/naver/<slug>-naver.html` — 네이버 친화 버전 (도입 인사 + 동일 본문 + 백링크 + 이메일 + 해시태그)
4. `blog/img/png/<slug>.png` — 네이버 업로드용 PNG (SVG는 네이버 비호환)
   - SVG 원본 → ImageMagick 변환: `convert -density 150 -background white blog/img/<slug>.svg blog/img/png/<slug>.png`
5. 사장님이 네이버 글쓰기에 `blog/naver/<slug>-naver.html`을 Chrome으로 열고 본문 드래그·복사→붙여넣기
6. 네이버 발행 후 발행 URL 메모

### 네이버 친화 HTML 작성 규칙

- 인라인 `<style>`만 사용 (네이버 에디터는 외부 CSS 무시)
- 단순 태그 위주: `<h1>` `<h2>` `<h3>` `<p>` `<table>` `<blockquote>` `<strong>` `<a>`
- 도입부에 "안녕하세요, 셀렙입니다" 1줄 인사 포함
- 본문 끝에 셀렙닷컴 원문 백링크 + 이메일(`emgt.yhlee@gmail.com`) + 셀렙닷컴 inquiry 링크
- 해시태그 15~20개 본문 끝 별도 표기 (네이버 태그란에 사장님이 직접 입력)
- 대표 이미지는 `[ 여기에 대표 이미지 업로드 ]` placeholder 표기 — 사장님이 네이버에서 직접 업로드

### 셀렙닷컴 블로그 디자인 톤 (v2 · 2026-05-09부터)

- **핵심만 콕콕** 박스 (`.summary-box`) — 도입부, 3~4줄 요약
- **미니멀 섹션 헤딩** (`.v2-h2` + `.num`) — `01 02 03...` 그린 마커 + 큰 폰트
- **서브 헤딩** (`.v2-h3`) — 그린 세로선 + 짧은 라벨
- **모던 표** (`.v2-table`) — 네이비 헤더 + `Comparison / Spec / Applications` 라벨 (`.v2-table-label`)
- **FAQ Q/A 마커** (`.v2-faq-q` `.v2-faq-a`) — 그린 Q / 회색 A 인디케이터
- **키워드 알약 태그** (`.v2-keyword`) — 본문 끝 라이트 배경 박스
- **용어 정의 박스** (`.term-box`) — 1편당 1~2회, `<span class="t-name">• 용어:</span>` 형식
- **이모지 사용 자제** — 디자인으로 차별화, 미니멀 톤 유지
- **본문 1장당 보조 인포그래픽 1장 권장** (메인 hero 외) — 핵심 인사이트 1개를 그림으로 직관 전달
- **SVG 톤** — 1200×700 (메인) / 1200×500 (보조), 흰 배경 + 그리드 점 패턴, 네이비+그린 컬러, 그라디언트 그림자, 번호 마커 ① ② ③

### 검색엔진 노출 차단 (중복 콘텐츠 페널티 회피)

`robots.txt`에 다음 명시:
```
Disallow: /blog/naver/
```

`blog/naver/*-naver.html`은 사이트에 보존되지만 검색엔진 색인 대상 아님 — 네이버 발행 후 실수로 셀렙닷컴 도메인으로도 노출되어 중복 콘텐츠 패널티 받지 않게 보호.

### 발행 후 점검 (1주일 후)

- 네이버 블로그 통계: 방문수·검색 유입 키워드
- 셀렙닷컴 GA4: `referrer = blog.naver.com` 트래픽 확인
- 발행 URL 2개 (셀렙닷컴 + 네이버) 양방향 백링크 추가 검토

### 발행 URL 매핑 (현재까지 발행된 시리즈)

| 셀렙닷컴 슬러그 | 네이버 cellab01 글번호 | 발행일 |
|---|---|---|
| `bt101-ex-vivo-catheter` | [224279559036](https://blog.naver.com/cellab01/224279559036) | 2026-05-09 |
| `bt101-solar-droplet-feedback` | [224279562721](https://blog.naver.com/cellab01/224279562721) | 2026-05-09 |

신규 발행 시 위 표에 줄 추가 — 추후 백링크·통계 점검 시 참조.

---

## 8. 마스터 동선과 자동 점검 (메모리 참조)

작업·결정 시 셀렙 마스터 동선과 정합한지 점검:

```
구글·네이버 검색 → 셀렙닷컴 블로그 → 부품별 마켓 송출 → 나비엠알오 거래 → 알고리즘 가속
```

이 동선에 거스르는 작업·결정은 메모리 `feedback_cellab_master_funnel.md` 위배. 진행 전 점검.

---

**최종 갱신:** 2026-05-09 (블로그 디자인 v2 톤 정책 신설 — 핵심박스·미니멀헤딩·모던표·FAQ Q-A·키워드태그·보조 인포그래픽)
**다음 갱신 트리거:** 새 블로그 글 발행 시 (URL 매핑 표 갱신), 새 자동 생성 파일·사례 발생 시, 정책 변경 시
