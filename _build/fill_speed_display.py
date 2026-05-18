#!/usr/bin/env python3
"""
catalog.json의 각 펌프에 speed_display 값을 채움.
Leadfluid 2025 카탈로그(Leadfluid-2025-Catalog.pdf) 기준 수동 매핑.

페리스탈틱 펌프: rpm 단위
시린지 펌프 (TYD/TFD): linear speed (μm/min ~ mm/min)
인더스트리얼 시린지 (G-Ind): line speed (mm/s)

사용:
  python _build/fill_speed_display.py            # dry-run (변경 없음, 매핑 결과만 표시)
  python _build/fill_speed_display.py --apply    # 실제 적용 (catalog.json.bak 백업 후)
"""
import json
import sys
import shutil
from pathlib import Path

# 카탈로그 PDF 기준 펌프별 speed_display 매핑
SPEED_MAP = {
    # S 시리즈 (페리스탈틱 - rpm)
    'BQ80S':       '0.1~80 rpm',
    'BT103S':      '0.1~100 rpm',
    'BT101S':      '0.1~150 rpm',
    'BT301S':      '0.1~350 rpm',
    'BT601S':      '0.1~600 rpm',
    # L 시리즈 (Intelligent Flow - rpm)
    'BT101L':      '0.1~150 rpm',
    'BT301L':      '0.1~350 rpm',
    'BT601L':      '0.1~600 rpm',
    # F 시리즈 (Intelligent Dispensing - rpm)
    'BT101F':      '0.1~150 rpm',
    'BT301F':      '0.1~350 rpm',
    'BT601F':      '0.1~600 rpm',
    # EF/FG 시리즈 (방폭/세척 - rpm)
    'EF800':       '0.1~360 rpm',
    'EF900':       '0.1~600 rpm',
    'FG601S-A3':   '72~600 rpm',
    'FG601S-W3':   '135~600 rpm',
    # Syringe 일체형 TYD (Linear speed)
    'TYD01-01':    '1μm/min ~ 150mm/min',
    'TYD01-02':    '1μm/min ~ 150mm/min',
    'TYD02-01':    '1μm/min ~ 150mm/min',
    'TYD02-02':    '1μm/min ~ 150mm/min',
    'TYD02-04':    '1μm/min ~ 150mm/min',
    'TYD02-06':    '1μm/min ~ 150mm/min',
    'TYD02-10':    '1μm/min ~ 150mm/min',
    'TYD03-01':    '0.2μm/min ~ 30mm/min',
    # Syringe 분리형 TFD (Linear speed)
    'TFD01-01':    '0.635μm/min ~ 95.25mm/min',
    'TFD02-01':    '1μm/min ~ 150mm/min',
    'TFD03-01':    '0.6096μm/min ~ 91.44mm/min',
    'TFD04':       '1μm/min ~ 150mm/min',
    # Gear (Industrial Syringe G-Ind - line speed)
    'G3030-1S':    '0.005mm/s ~ 25mm/s',
    'G6060-1S':    '0.01mm/s ~ 50mm/s',
}


def main():
    apply = '--apply' in sys.argv
    here = Path(__file__).parent
    path = here / 'catalog.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    pumps = data.get('pumps') or []

    updated = []
    skipped = []
    missing_in_catalog = list(SPEED_MAP.keys())

    for p in pumps:
        pid = p.get('id')
        if pid in SPEED_MAP:
            new_val = SPEED_MAP[pid]
            old_val = p.get('speed_display', '')
            if old_val != new_val:
                updated.append((pid, old_val, new_val))
            else:
                skipped.append(pid)
            if pid in missing_in_catalog:
                missing_in_catalog.remove(pid)
        # 매핑에 없는 펌프는 손대지 않음

    print("===== 매핑 결과 =====")
    print(f"\n[변경 예정] {len(updated)}개:")
    for pid, old, new in updated:
        old_disp = f'"{old}"' if old else '(없음)'
        print(f"  - {pid:<14}  {old_disp}  →  \"{new}\"")
    if skipped:
        print(f"\n[이미 동일] {len(skipped)}개:")
        for pid in skipped:
            print(f"  · {pid}")
    if missing_in_catalog:
        print(f"\n[!] SPEED_MAP에 정의됐지만 catalog.json엔 없는 펌프 ({len(missing_in_catalog)}개):")
        for pid in missing_in_catalog:
            print(f"  ? {pid}")

    if not apply:
        print("\n[dry-run] 실제 변경 없음. --apply 플래그를 추가하면 적용됩니다.")
        print(f"  예: python {Path(__file__).name} --apply")
        return

    # 백업
    bak = path.with_suffix('.json.bak')
    shutil.copy2(path, bak)
    print(f"\n[BACKUP] 원본을 {bak.name}로 백업")

    # 적용
    for p in pumps:
        pid = p.get('id')
        if pid in SPEED_MAP:
            p['speed_display'] = SPEED_MAP[pid]

    data['updated_at'] = '2026-05-18'
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"[APPLY] catalog.json 갱신 완료 — {len(updated)}개 펌프 speed_display 채움")


if __name__ == '__main__':
    main()
