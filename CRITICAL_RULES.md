# 절대 규칙 — 사이트 손상 방지

## 1. AI/에이전트가 절대 하면 안 되는 것

- Python `re.sub` 또는 sed로 **여러 HTML 파일 일괄 변경** → 후반부 잘림 사고 다수
- HTML 안 JS template literal에 `</script>`, `</style>` 문자열 포함
- 변경 후 검증 없이 commit/push

## 2. 매 작업 후 의무 검증

```bash
for f in *.html blog/*.html; do
  last=$(tail -1 "$f" | tr -d '[:space:]')
  if [ "$last" != "</html>" ]; then
    echo "JEOLLIM: $f ($(wc -l < $f)줄)"
  fi
done
```

이 출력에 한 줄이라도 나오면 **즉시 commit 중단** + 정상 commit에서 복원.

## 3. 외부 도구 의심 신호

- 작업한 적 없는데 파일이 modified로 뜸
- HTML 줄수가 갑자기 줄어듦
- `grep`이 `binary file matches` 출력
- 브라우저 콘솔 "Unexpected end of input"

## 4. 손상 발견 시 복원 절차

```powershell
# 1. 정상 commit 찾기
git log --oneline -10

# 2. 정상 commit에서 파일 복원
git show <정상해시>:<파일경로> > <파일경로>

# 3. git index 손상 시
Remove-Item .git/index
git reset
```

## 5. 환경 정리 (작업 전 1회)

- OneDrive 동기화 일시 중지 (작업 표시줄 아이콘 → 일시 중지)
- 메모장(notepad.exe)으로 절대 HTML/MD 열지 말 것
- VS Code 등 에디터 동시 작업 시 충돌 주의

## 6. AI 에이전트와 작업 시 절대 규칙

- AI는 Edit 도구로 한 파일씩 정확히 수정만
- 여러 파일 헤더/푸터 공통 작업 시 — Python 일괄 처리 금지, Edit 한 번씩
- 변경 직후 항상 `wc -l` + `tail -3` 검증
- commit 메시지에 변경 파일 줄수 명시 (예: `leadfluid.html: 0→432줄`)

## 7. SSOT 원칙 — admin DB가 모든 데이터의 기준 (2026-05-18 신설)

**홈페이지의 모든 작업·결정은 admin에서 편집 가능한 데이터를 기준으로 한다.**
사장님이 admin에 들어가 한 값을 바꾸면 그 변경이 사이트 전체에 자동 반영되어야 한다.

### SSOT 파일
- `_build/catalog.json` — 펌프 사양·매칭·헤드·이미지·그룹·URL
- `_build/posts.json` — 블로그 글 메타
- `_build/products.json` — 기타 제품
- `_build/setups.json` + `_build/parts.json` — 펌프셋업 리뷰
- `_build/categories.json` — 카테고리 메타
- (향후) `_build/settings.json` — 그룹 정의·라벨·매칭 어휘·위저드 옵션 등 메타 설정

### 금지 사항
- HTML/JS의 변수·상수에 데이터를 박지 말 것 (라벨·옵션·경계값·매칭 어휘 등)
- "사장님이 운영 중 바꿀 수 있어야 하는 값"은 무조건 admin에서 편집 가능해야 한다

### AI 에이전트의 의무
- 작업 전 코드에 데이터를 박을 가능성이 보이면 **즉시 사장님께 알림**
- 명시 문구: "이건 admin DB에 두지 않으면 사장님이 직접 관리·제작 어려워집니다"
- 사장님이 명시적으로 "그래도 박아줘" 하시면, trade-off (사장님이 직접 수정 못 함)을 분명히 설명한 뒤 진행
- 기존 코드에 박혀 있는 SSOT 위반을 발견하면 `STRATEGY.md § 7` Phase Plan에 마이그레이션 항목으로 추가

자세한 SSOT 범위·마이그레이션 우선순위는 `STRATEGY.md § 6.0` 참조.

---

자세한 사례·해결법은 `OPERATIONS.md` 2장 "발생 사례 + 재발 방지" 참조.
사이트 전략·방향·admin DB 통합 계획은 `STRATEGY.md` 참조 (모든 신규 작업의 기준점).
