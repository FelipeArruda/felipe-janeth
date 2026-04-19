from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
INPUT_DIR = ROOT / "public"
OUTPUT_DIR = INPUT_DIR / "porta-retrato"

TARGET_W = 1800  # 15 cm @ 300 dpi
TARGET_H = 1200  # 10 cm @ 300 dpi

EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def cover_fit(img: Image.Image, w: int, h: int) -> Image.Image:
    sw, sh = img.size
    scale = max(w / sw, h / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return resized.crop((left, top, left + w, top + h))


def refine(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Color(img).enhance(1.03)
    img = ImageEnhance.Contrast(img).enhance(1.03)
    img = ImageEnhance.Sharpness(img).enhance(1.06)
    return img


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    count = 0
    for src in sorted(INPUT_DIR.iterdir()):
        if not src.is_file() or src.suffix.lower() not in EXTS:
            continue
        if "-enquadrada" in src.stem or "-impressao-" in src.stem or "-porta-retrato-" in src.stem:
            continue

        with Image.open(src) as im:
            rgb = im.convert("RGB")
            out = cover_fit(rgb, TARGET_W, TARGET_H)
            out = refine(out)

        dest = OUTPUT_DIR / f"{src.stem}-porta-retrato-15x10.jpg"
        out.save(dest, format="JPEG", quality=96, optimize=True, subsampling=0, dpi=(300, 300))
        count += 1
        print(f"OK {src.name} -> {dest.name}")

    print(f"Concluido: {count} arquivos em {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
