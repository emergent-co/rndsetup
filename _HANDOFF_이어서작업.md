# rndsetup 작업 이어가기 — 핸드오프

작성 2026-07-21 · 목적: **다른 컴퓨터에서 이어서 작업**

---

## 0. 다른 컴퓨터에서 시작하는 법

1. **먼저 이 컴퓨터에서 push** (아래 §1 명령). 안 하면 최신 작업이 GitHub에 없어서 새 컴퓨터가 못 받습니다.
2. 새 컴퓨터에서 저장소 받기:
   ```
   git clone https://github.com/emergent-co/rndsetup.git C:\dev\cellab-kr
   ```
   (경로는 원하는 곳으로. GitHub `emergent-co/rndsetup` 접근 권한 필요)
3. **Python 3.x** 설치. 빌드 테스트: `python _build\build.py`
4. 이 파일(`_HANDOFF_이어서작업.md`)을 열어 §5부터 이어서.

---

## 1. 지금 당장 (이 컴퓨터에서 아직 push 안 했으면)

```powershell
cd C:\dev\cellab-kr
Remove-Item .git\index.lock -Force -ErrorAction SilentlyContinue
Remove-Item "qr\_QR시트_전체.png" -Force -ErrorAction SilentlyContinue
git rm -r --ignore-unmatch troubleshooting pump/troubleshooting product pumps leadfluid guide guide-hub quote compat/guide
git rm --ignore-unmatch pump/index.html
python _build\build.py
git add -A
git commit -m "모델 매뉴얼 링크 + trust 논문 실적 + QR + 죽은 스텁 삭제 + 핸드오프"
git push
```

→ 이걸 해야 아래 "미푸시" 작업이 GitHub·라이브·다른 컴퓨터에 전부 반영됩니다.

---

## 2. 프로젝트 정체성 (한 줄)

**rndsetup.com = 리드플루이드(LeadFluid) 공식 대리점.** 검색 유입은 노리지 않음(키워드 검색량 극소). 나비엠알오·QR로 찾아온 사람에게 **"이 회사 믿을만한가 + 제품 상세·매뉴얼·구매·A/S"**를 쉽게 보여주는 도착지. **탐색 쉬움이 최우선.**

---

## 3. 배포 방식

- 정적 사이트 → **Cloudflare Pages** 자동 배포. GitHub `emergent-co/rndsetup`의 **main에 push하면 자동 빌드·배포**.
- **git push는 사람이 직접** 해야 함(에이전트/샌드박스는 push·파일삭제 불가).
- 배포 확인: Cloudflare → Workers & Pages → `rndsetup` → Deployments 맨 위 커밋이 **초록(✓)** 인지. 초록 후 사이트에서 **Ctrl+Shift+R**.

---

## 4. 워크플로 주의사항 (중요)

- HTML/네비 편집 후 **반드시 `python _build\build.py` 실행** — 스키마(JSON-LD)·크롤러 nav·sitemap을 재주입함. `[warn] requests 마커 못 찾음` 경고는 **무시**(정상).
- `git add`에서 `index.lock` 에러 나면: `Remove-Item .git\index.lock -Force`
- **리다이렉트는 `_redirects` 파일**(Cloudflare)에서 관리. 옛 URL 통폐합 시 여기에 `옛경로  새경로  301` 추가. 체인 금지(항상 최종 목적지로 1홉).
- 사용량 절감: 시각화·전체 수정은 **요청 있을 때만**. 텍스트로 먼저 미리보기.
- 페이지 무분별하게 늘리지 말 것(새 페이지는 확인 후).

---

## 5. 현재 상태 (2026-07-21)

**완료 · 라이브 반영됨**
- 홈 B안: 신뢰 배지 + 제품 빠른 찾기 카드 + 행동 버튼 3개
- 네비 목적기반 4그룹 12개(제품 / 신뢰·회사 / 구매·문의 / 자료실)
- 푸터 CTA를 구매·A/S·견적 행동형으로 교체
- 펌프 허브 단일화·다수 중복 URL 301(`_redirects`)

**미푸시 · 이 컴퓨터 working tree에만 있음 → §1 push 필요**
- 모델 매뉴얼 링크 추가: BT301L · WT600F · MF106
- `/trust/`에 논문 6편 실적 섹션 + FAQ·스키마
- QR 코드 17종 + 인쇄 시트 (`qr/` 폴더)
- 죽은 스텁 삭제(`git rm`) + `_redirects` 무슬래시 보강

**push 후 확인할 것**
- `/troubleshooting/`, `/product/`가 각각 `/pump/atoz/`, `/application/`으로 **301** 되는지 재검증(이전에 미배포 상태였음).
- QR을 폰으로 실제 스캔해 해당 모델 페이지로 가는지.

---

## 6. 남은 작업 백로그

- push 후 리다이렉트/삭제 최종 검증
- (선택) QR을 사이트에 안 올리려면 `.gitignore`에 `qr/` 추가
- (참고 메모) 소프트웨어 제품화·조달 등록 판단 → `자체제어SW_조달등록_판단_한장.md`

---

## 7. 파일 지도

| 위치 | 역할 |
|---|---|
| `index.html` | 홈(첫화면·제품 빠른 찾기) |
| `assets/site.js` | 헤더·네비(`var NAV` 배열)·푸터 CTA — 메뉴 수정은 여기 |
| `_redirects` | Cloudflare 301 리다이렉트 |
| `_build/build.py` | 빌드(스키마·크롤러nav·sitemap 주입) |
| `pump/leadfluid/<model>/` | 모델 상세 페이지 |
| `trust/` `about/` `contact/` `repair/` `faq/` | 신뢰·회사·문의·수리·FAQ |
| `setups/` | 논문 셋업 6편 |
| `alicat/` `sh-scientific/` | MFC·열처리로 |
| `qr/` | QR 코드(인쇄용, 웹배포 선택) |
