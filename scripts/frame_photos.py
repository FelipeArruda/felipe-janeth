from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parent.parent
INPUT_DIR = ROOT / "public"
OUTPUT_DIR = INPUT_DIR / "enquadradas"

CANVAS_W = 1200
CANVAS_H = 1800
OUTER_MARGIN = 44
INNER_MARGIN = 72
PHOTO_RECT = (150, 285, 1050, 1515)

BG_COLOR = (246, 244, 241)
PAPER_COLOR = (252, 251, 249)
LINE_COLOR = (196, 174, 146)
TEXT_COLOR = (84, 70, 55)


def source_images() -> Iterable[Path]:
    extensions = {".jpg", ".jpeg", ".png", ".webp"}
    for path in sorted(INPUT_DIR.iterdir()):
        if path.is_file() and path.suffix.lower() in extensions:
            yield path


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def cover_fit(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    src_w, src_h = img.size
    scale = max(target_w / src_w, target_h / src_h)
    new_w = int(src_w * scale)
    new_h = int(src_h * scale)

    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def refine_photo(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Color(img).enhance(1.05)
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Sharpness(img).enhance(1.08)

    tone = Image.new("RGB", img.size, (248, 242, 234))
    img = Image.blend(img, tone, 0.06)
    dark = Image.new("RGB", img.size, (236, 229, 220))
    return ImageChops.soft_light(img, dark)


def draw_corner_ornament(draw: ImageDraw.ImageDraw, x: int, y: int, flip_x: bool = False, flip_y: bool = False) -> None:
    points = [(0, 0), (30, 0), (48, 18), (18, 18), (0, 0)]

    def t(pt: tuple[int, int]) -> tuple[int, int]:
        px, py = pt
        if flip_x:
            px = -px
        if flip_y:
            py = -py
        return x + px, y + py

    draw.line([t((0, 0)), t((56, 0))], fill=LINE_COLOR, width=2)
    draw.line([t((0, 0)), t((0, 56))], fill=LINE_COLOR, width=2)
    draw.line(list(map(t, points)), fill=LINE_COLOR, width=2)
    draw.line([t((18, 18)), t((34, 34))], fill=LINE_COLOR, width=2)


def build_frame(photo: Image.Image, label: str) -> Image.Image:
    canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    draw.rounded_rectangle(
        (OUTER_MARGIN, OUTER_MARGIN, CANVAS_W - OUTER_MARGIN, CANVAS_H - OUTER_MARGIN),
        radius=26,
        fill=PAPER_COLOR,
        outline=(218, 210, 200),
        width=3,
    )

    draw.rounded_rectangle(
        (INNER_MARGIN, INNER_MARGIN, CANVAS_W - INNER_MARGIN, CANVAS_H - INNER_MARGIN),
        radius=20,
        outline=(222, 210, 193),
        width=2,
    )

    pin_x = CANVAS_W // 2
    pin_y = 74
    draw.ellipse((pin_x - 16, pin_y - 16, pin_x + 16, pin_y + 16), fill=(220, 206, 186), outline=(172, 146, 114), width=2)

    px1, py1, px2, py2 = PHOTO_RECT
    target = cover_fit(photo.convert("RGB"), px2 - px1, py2 - py1)
    target = refine_photo(target)
    photo_mask = rounded_mask((px2 - px1, py2 - py1), radius=24)
    canvas.paste(target, (px1, py1), photo_mask)

    draw.rounded_rectangle((px1, py1, px2, py2), radius=24, outline=(214, 197, 174), width=3)

    draw_corner_ornament(draw, INNER_MARGIN + 18, INNER_MARGIN + 170)
    draw_corner_ornament(draw, CANVAS_W - INNER_MARGIN - 18, INNER_MARGIN + 170, flip_x=True)
    draw_corner_ornament(draw, INNER_MARGIN + 18, CANVAS_H - INNER_MARGIN - 18, flip_y=True)
    draw_corner_ornament(draw, CANVAS_W - INNER_MARGIN - 18, CANVAS_H - INNER_MARGIN - 18, flip_x=True, flip_y=True)

    title_font = load_font(["C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/timesbd.ttf"], 34)
    subtitle_font = load_font(["C:/Windows/Fonts/georgia.ttf", "C:/Windows/Fonts/times.ttf"], 20)

    heading = "MOMENTO ESPECIAL"
    name_line = label

    draw.text((CANVAS_W // 2, 180), heading, fill=(140, 117, 89), font=subtitle_font, anchor="mm")
    draw.text((CANVAS_W // 2, 224), name_line, fill=TEXT_COLOR, font=title_font, anchor="mm")

    draw.line((390, 255, 540, 255), fill=LINE_COLOR, width=2)
    draw.line((660, 255, 810, 255), fill=LINE_COLOR, width=2)
    draw.text((CANVAS_W // 2, 255), "***", fill=(160, 136, 107), font=subtitle_font, anchor="mm")

    draw.line((160, CANVAS_H - 170, CANVAS_W - 160, CANVAS_H - 170), fill=(216, 201, 180), width=2)
    footer_font_big = load_font(["C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/timesbd.ttf"], 26)
    footer_font_small = load_font(["C:/Windows/Fonts/georgia.ttf", "C:/Windows/Fonts/times.ttf"], 22)
    draw.text((CANVAS_W // 2, CANVAS_H - 118), "JANETH & FELIPE", fill=(116, 93, 67), font=footer_font_big, anchor="mm")
    draw.text((CANVAS_W // 2, CANVAS_H - 82), "24 ABRIL 2026", fill=(116, 93, 67), font=footer_font_small, anchor="mm")

    return canvas


def display_label_from_filename(path: Path) -> str:
    base = path.stem.replace("_", " ").replace("-", " ").strip()
    return " ".join(word.capitalize() for word in base.split()) or "Foto"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    count = 0
    for src in source_images():
        with Image.open(src) as img:
            label = display_label_from_filename(src)
            framed = build_frame(img, label)
            dest = OUTPUT_DIR / f"{src.stem}-enquadrada.jpg"
            framed.save(dest, format="JPEG", quality=96, optimize=True)
            count += 1
            print(f"OK {src.name} -> {dest.name}")

    print(f"Concluido: {count} imagens em {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
