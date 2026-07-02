# 절대 규칙 — 사이트 손상 방지

## 1. AI/에이전트가 절대 하면 안 되는 것

- Python `re.sub`·sed로 **여러 HTML 파일 일괄 변경** → 후반부 잘림 사고 다수. 파일 하나씩 Edit.
- HTML 안 JS의 template literal에 `</script>`·`</style>` 문자열 포함 (닫힘 사고)
- 변경 후 검증 없이 commit/push

## 2. 매 작업 후 의무 검증

```bash
for f in *.html **/*.html; do
  last=$(tail -1 "$f" | tr -d '[:space:]')
  [ "$last" != "</html>" ] && echo "JEOLLIM: $f ($(wc -l < $f)줄)"
done
```

한 줄이라도 나오면 **즉시 commit 중단** + 정상 commit에서 복원.
변경 직후 `wc -l` + `tail -3`로 크기 점검(예상치 ±10% 이내).

## 3. 손상 의심 신호

작업한 적 없는데 modified로 뜸 · HTML 줄수 급감 · `grep`이 `binary file matches` · 콘솔 "Unexpected end of input".

## 4. 손상·git 파손 복원

```powershell
git log --oneline -10                       # 정상 commit 찾기
git show <해시>:<파일경로> > <파일경로>       # 파일 복원
Remove-Item .git\*.lock -Force              # lock 파손 시
Remove-Item .git\index; git reset          # index 파손 시(재생성)
```

## 5. SSOT 원칙 — 데이터는 `_build/` JSON에

**운영 데이터는 `_build/`의 JSON을 단일 기준으로 두고, 페이지가 fetch해서 쓴다.**

SSOT 파일(`_build/`): `catalog.json`(펌프 사양·매칭·헤드·이미지·그룹·URL), `posts.json`(셋업 사례 메타), `products.json`, `parts.json`(부품), `categories.json`, `settings.json`(그룹·라벨·매칭·위저드 옵션).

금지: HTML/JS 변수·상수에 운영 데이터(라벨·옵션·경계값·매칭 어휘)를 박는 것. 이미 박혀 있는 것이 발견되면 JSON으로 이전.

## 6. 환경

- OneDrive/Drive 동기화 금지 — git이 유일한 동기화 수단(`.git` 파손 방지).
- 메모장으로 HTML/MD 열지 말 것.
- `.gitattributes`(줄바꿈·바이너리 정책)는 삭제·임의 수정 금지.

---

관련: `OPERATIONS.md`(운영·빌드·배포).
