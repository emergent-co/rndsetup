#!/usr/bin/env python3
"""
catalog.json 마이그레이션 — 사장님 7개 그룹으로 정렬 + 안 파는 라인 제거

사장님이 판매하는 7개 그룹:
  S, L, F, ef-fg, syringe-integrated, syringe-split, gear

규칙 우선순위 (첫 매치 승):
  0. id에 '100' / '300' / '600' substring → 단종으로 제거 (사장님 통보 2026-05-18)
  1. id가 EF/FG로 시작 → ef-fg
  2. series == 'S' → S
  3. series == 'L' → L
  4. series == 'F' → F
  5. category == 'syringe' AND sub에 'Laboratory' → syringe-integrated
  6. category == 'syringe' AND sub에 'Split Style' → syringe-split
  7. series in ('G-Ind', 'CT-Gear') → gear
  8. 그 외 → 제거 (안 파는 라인)

사용:
  python migrate_nav_groups.py              # dry-run (분류 결과만 출력, 변경 없음)
  python migrate_nav_groups.py --apply      # 실제 적용 (catalog.json.bak 백업 후 변경)
"""
import json
import sys
import shutil
from pathlib import Path

GROUPS = ['S', 'L', 'F', 'ef-fg', 'syringe-integrated', 'syringe-split', 'gear']
GROUP_LABEL = {
    'S': 'S 시리즈',
    'L': 'L 시리즈',
    'F': 'F 시리즈',
    'ef-fg': 'EF/FG 시리즈',
    'syringe-integrated': 'Syringe 일체형',
    'syringe-split': 'Syringe 분리형',
    'gear': 'Gear',
}


DISCONTINUED_SUBSTRINGS = ('100', '300', '600')


def is_discontinued(p):
    pid = p.get('id') or ''
    return any(s in pid for s in DISCONTINUED_SUBSTRINGS)


def classify(p):
    """반환: 그룹 키 문자열 또는 ('removed', '사유') 튜플."""
    pid = (p.get('id') or '').upper()
    series = p.get('series') or ''
    category = p.get('category') or ''
    sub = p.get('sub') or ''
    # 단종 규칙 (최우선)
    if is_discontinued(p):
        return ('removed', 'discontinued-100/300/600')
    # 그룹 분류
    if pid.startswith('EF') or pid.startswith('FG'):
        return 'ef-fg'
    if series == 'S':
        return 'S'
    if series == 'L':
        return 'L'
    if series == 'F':
        return 'F'
    if category == 'syringe' and 'Laboratory' in sub:
        return 'syringe-integrated'
    if category == 'syringe' and 'Split Style' in sub:
        return 'syringe-split'
    if series in ('G-Ind', 'CT-Gear'):
        return 'gear'
    return ('removed', 'no-group (안 파는 라인)')


def main():
    apply = '--apply' in sys.argv
    here = Path(__file__).parent
    path = here / 'catalog.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    pumps = data.get('pumps') or []

    classified = []
    removed_discontinued = []
    removed_no_group = []
    for p in pumps:
        g = classify(p)
        if isinstance(g, tuple) and g[0] == 'removed':
            if g[1].startswith('discontinued'):
                removed_discontinued.append(p)
            else:
                removed_no_group.append(p)
        else:
            classified.append((g, p))

    counts = {g: 0 for g in GROUPS}
    for g, _ in classified:
        counts[g] += 1

    # 분류 결과 출력
    print("===== 분류 결과 (남는 펌프) =====")
    for g in GROUPS:
        print(f"\n  [{g}] {GROUP_LABEL[g]}  —  {counts[g]}개")
        for gg, p in classified:
            if gg == g:
                print(f"     · {p.get('id'):<14}  {p.get('sub','')[:55]}")

    print(f"\n===== 제거: 단종 (id에 100/300/600) — {len(removed_discontinued)}개 =====")
    for p in removed_discontinued:
        print(f"  - {p.get('id'):<14}  series={p.get('series','-'):<10}  cat={p.get('category','-'):<12}  {p.get('sub','')[:45]}")

    print(f"\n===== 제거: 안 파는 라인 — {len(removed_no_group)}개 =====")
    for p in removed_no_group:
        print(f"  - {p.get('id'):<14}  series={p.get('series','-'):<10}  cat={p.get('category','-'):<12}  {p.get('sub','')[:45]}")

    total_keep = sum(counts.values())
    total_remove = len(removed_discontinued) + len(removed_no_group)
    print(f"\n[요약]  원본 {len(pumps)}개  →  남는 펌프 {total_keep}개  /  제거 {total_remove}개 (단종 {len(removed_discontinued)} + 안 파는 라인 {len(removed_no_group)})")

    if not apply:
        print("\n[dry-run] 실제 변경 없음. --apply 플래그를 추가하여 다시 실행하면 적용됩니다.")
        print(f"  예: python {Path(__file__).name} --apply")
        return

    # 백업
    bak = path.with_suffix('.json.bak')
    shutil.copy2(path, bak)
    print(f"\n[BACKUP] 원본을 {bak.name}로 백업했습니다.")

    # 새 pumps 리스트 (nav_group 필드 추가)
    new_pumps = []
    for g, p in classified:
        np = dict(p)
        np['nav_group'] = g
        new_pumps.append(np)

    # 기존 series_urls/nav_group_urls에서 URL 보존 (이미 채워둔 URL 잃지 않도록)
    old_series_urls = data.get('series_urls', {}) or {}
    old_nav_urls = data.get('nav_group_urls', {}) or {}
    new_nav_group_urls = {
        '_comment': '그룹별 나비엠알오 URL. 카드 렌더 시 펌프의 nav_group에서 조회. 펌프별 navimro_url(override) 우선, 없으면 본 매핑 사용.',
    }
    for g in GROUPS:
        new_nav_group_urls[g] = old_nav_urls.get(g) or old_series_urls.get(g) or ''

    # data 갱신
    data['pumps'] = new_pumps
    data['count'] = len(new_pumps)
    data['nav_group_urls'] = new_nav_group_urls
    if 'series_urls' in data:
        del data['series_urls']
    data['updated_at'] = '2026-05-18'
    data['source'] = 'migrate_nav_groups.py (7개 그룹 적용 + 단종(100/300/600) + 안 파는 라인 제거)'

    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"[APPLY] catalog.json 갱신 완료 — {len(new_pumps)}개 펌프, 7 그룹 URL 슬롯")
    print("  복구 필요 시: copy catalog.json.bak catalog.json")


if __name__ == '__main__':
    main()
