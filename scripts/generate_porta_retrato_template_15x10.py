from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parent.parent
INPUT_DIR = ROOT / "public"
OUTPUT_DIR = ROOT / "public" / "porta-retrato"

TARGET_W = 1800  # 15 cm @ 300 dpi
TARGET_H = 1200  # 10 cm @ 300 dpi

EXTS = {".jpg", ".jpeg", ".png", ".webp"}

BG = (251, 249, 245)
LINE = (196, 174, 146)
LINE_SOFT = (218, 203, 182)
TEXT = (116, 97, 74)
TEXT_SOFT = (140, 122, 98)


def cover_fit(img: Image.Image, w: int, h: int) -> Image.Image:
    sw, sh = img.size
    scale = max(w / sw, h / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return resized.crop((left, top, left + w, top + h))


def cover_fit_with_anchor(
    img: Image.Image, w: int, h: int, ax: float = 0.5, ay: float = 0.5, zoom: float = 1.0
) -> Image.Image:
    """Crop with anchor and optional zoom out for hard portrait-to-landscape cases."""
    sw, sh = img.size
    scale = max(w / sw, h / sh) * max(0.6, zoom)
    nw, nh = int(sw * scale), int(sh * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)

    # When zooming out may leave empty area; use a solid tone from the image itself.
    if nw < w or nh < h:
        tone = resized.resize((1, 1), Image.Resampling.BILINEAR).getpixel((0, 0))
        base = Image.new("RGB", (max(w, nw), max(h, nh)), tone)
        ox = int((base.size[0] - nw) * max(0.0, min(1.0, ax)))
        oy = int((base.size[1] - nh) * max(0.0, min(1.0, ay)))
        base.paste(resized, (ox, oy))
        resized = base
        nw, nh = resized.size

    max_x = max(0, nw - w)
    max_y = max(0, nh - h)
    x = int(max_x * max(0.0, min(1.0, ax)))
    y = int(max_y * max(0.0, min(1.0, ay)))
    return resized.crop((x, y, x + w, y + h))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def load_font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]
    for f in candidates:
        try:
            return ImageFont.truetype(f, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_corner_ornament(draw: ImageDraw.ImageDraw, x: int, y: int, flip_x: bool = False, flip_y: bool = False):
    def t(px: int, py: int):
        if flip_x:
            px = -px
        if flip_y:
            py = -py
        return x + px, y + py

    draw.line([t(0, 0), t(58, 0)], fill=LINE, width=2)
    draw.line([t(0, 0), t(0, 58)], fill=LINE, width=2)
    points = [t(0, 0), t(30, 0), t(48, 18), t(18, 18), t(0, 0)]
    draw.line(points, fill=LINE, width=2)
    draw.line([t(18, 18), t(34, 34)], fill=LINE, width=2)


def refine(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Color(img).enhance(1.03)
    img = ImageEnhance.Contrast(img).enhance(1.03)
    img = ImageEnhance.Sharpness(img).enhance(1.06)
    return img


def compose(photo: Image.Image, photo_name: str) -> Image.Image:
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), BG)
    d = ImageDraw.Draw(canvas)

    outer = (24, 24, TARGET_W - 24, TARGET_H - 24)
    inner = (42, 42, TARGET_W - 42, TARGET_H - 42)

    d.rounded_rectangle(outer, radius=20, outline=LINE_SOFT, width=2)
    d.rounded_rectangle(inner, radius=14, outline=LINE_SOFT, width=1)

    # Header
    small_font = load_font(19, bold=True)
    top_big = load_font(28, bold=True)
    top_small = load_font(24, bold=True)

    d.text((TARGET_W // 2, 128), "JANETH & FELIPE", font=top_big, fill=TEXT, anchor="mm")
    d.text((TARGET_W // 2, 164), "24 ABRIL 2026", font=top_small, fill=TEXT, anchor="mm")
    d.line((760, 200, 870, 200), fill=LINE, width=2)
    d.line((930, 200, 1040, 200), fill=LINE, width=2)
    d.text((900, 200), "•••", font=small_font, fill=(166, 131, 82), anchor="mm")

    # Photo area
    px1, py1, px2, py2 = 110, 230, TARGET_W - 110, TARGET_H - 150
    anchor_map: dict[str, tuple[float, float]] = {
        "ibiti.jpeg": (0.50, 0.30),
        "minie.jpeg": (0.50, 0.66),
        "paris3.jpeg": (0.50, 0.80),
        "paris1.jpeg": (0.50, 0.72),
        "paris2.jpeg": (0.50, 0.74),
        "paris4.jpeg": (0.50, 0.88),
        "curacau.jpeg": (0.52, 0.50),
        "casal1.png": (0.50, 0.40),
        "recife.jpeg": (0.50, 0.32),
        "benicio.jpeg": (0.50, 0.50),
        "portugal.jpeg": (0.50, 0.42),
    }
    zoom_map: dict[str, float] = {
        "portugal.jpeg": 1.06,
        "casal1.png": 1.0,
    }
    ax, ay = anchor_map.get(photo_name.lower(), (0.50, 0.50))
    zoom = zoom_map.get(photo_name.lower(), 1.0)
    framed = cover_fit_with_anchor(
        refine(photo.convert("RGB")),
        px2 - px1,
        py2 - py1,
        ax=ax,
        ay=ay,
        zoom=zoom,
    )
    mask = rounded_mask((px2 - px1, py2 - py1), radius=22)
    canvas.paste(framed, (px1, py1), mask)
    d.rounded_rectangle((px1, py1, px2, py2), radius=22, outline=LINE, width=2)

    # Footer divider only
    d.line((110, TARGET_H - 78, TARGET_W - 110, TARGET_H - 78), fill=LINE_SOFT, width=2)

    # Ornaments
    draw_corner_ornament(d, 75, 95)
    draw_corner_ornament(d, TARGET_W - 75, 95, flip_x=True)
    draw_corner_ornament(d, 75, TARGET_H - 75, flip_y=True)
    draw_corner_ornament(d, TARGET_W - 75, TARGET_H - 75, flip_x=True, flip_y=True)

    return canvas


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    count = 0

    for src in sorted(INPUT_DIR.iterdir()):
        if not src.is_file() or src.suffix.lower() not in EXTS:
            continue
        if "-enquadrada" in src.stem or "-impressao-" in src.stem or "-porta-retrato-" in src.stem:
            continue

        with Image.open(src) as im:
            out = compose(im, src.name)

        dest = OUTPUT_DIR / f"{src.stem}-porta-retrato-template-15x10.jpg"
        out.save(dest, format="JPEG", quality=96, optimize=True, subsampling=0, dpi=(300, 300))
        count += 1
        print(f"OK {src.name} -> {dest.name}")

    print(f"Concluido: {count} arquivos em {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
