"""
Pretendard ttf 서브셋 생성 — 3D 텍스트(drei Text/troika)용.

troika는 웹폰트(woff2)가 아니라 폰트 파일을 직접 파싱하므로 ttf가 필요하다.
한글 전체(11172자)를 담으면 파일이 12MB를 넘어가서, 상용 한글 2350자(KS X 1001)와
기본 기호만 남겨 굽는다. 감자꽃 손글씨 폰트와 같은 방식이다.

사용: python scripts/subset-pretendard.py
"""

from pathlib import Path
from fontTools import subset

SOURCE_DIR = Path("node_modules/pretendard/dist/public/static/alternative")
OUTPUT_DIR = Path("public/fonts/pretendard")
WEIGHTS = ["Regular", "Bold"]


def build_charset() -> str:
    chars = []

    # 아스키 + 라틴 보충 문자
    chars += [chr(c) for c in range(0x20, 0x7F)]
    chars += [chr(c) for c in range(0xA0, 0x100)]

    # 자주 쓰는 문장 부호(따옴표·대시·말줄임표·가운뎃점 등)
    chars += list("‘’“”–—…•·※")

    # 한중일 기호·구두점, 전각 영숫자·기호
    chars += [chr(c) for c in range(0x3000, 0x3040)]
    chars += [chr(c) for c in range(0xFF01, 0xFF5F)]

    # 한글 호환 자모(ㄱ, ㅏ 등 낱자)
    chars += [chr(c) for c in range(0x3131, 0x318F)]

    # 상용 한글 2350자 — euc-kr로 인코딩되는 음절이 곧 KS X 1001 집합이다.
    for code in range(0xAC00, 0xD7A4):
        ch = chr(code)
        try:
            ch.encode("euc-kr")
        except UnicodeEncodeError:
            continue
        chars.append(ch)

    return "".join(chars)


def main() -> None:
    charset = build_charset()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for weight in WEIGHTS:
        source = SOURCE_DIR / f"Pretendard-{weight}.ttf"
        output = OUTPUT_DIR / f"Pretendard-{weight}-Subset.ttf"
        subset.main([
            str(source),
            f"--text={charset}",
            f"--output-file={output}",
            "--layout-features=*",
            "--no-hinting",
            "--desubroutinize",
        ])
        size_mb = output.stat().st_size / 1024 / 1024
        print(f"{output} : {size_mb:.2f} MB")


if __name__ == "__main__":
    main()
