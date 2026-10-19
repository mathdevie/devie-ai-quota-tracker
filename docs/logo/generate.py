#!/usr/bin/env python3
"""Export the approved Devie Quota segmented hexagon icon.

The raster master preserves the clean cuts, rainbow edges, and fine grain.
Export only clips the app plate, adds safe area, and resizes the image.

Run on macOS after bun install:

    python3 docs/logo/generate.py
"""

import base64
from pathlib import Path
import shutil
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
MASTER = HERE / "master.png"
ICON = HERE / "app-icon.png"
DESKTOP = ROOT / "src-desktop/icons"
EXPORTS = ("32x32.png", "128x128.png", "128x128@2x.png", "icon.icns", "icon.png")
SIZES = (16, 22, 32, 64, 128, 256, 512, 1024)
ASSETS = HERE / "exports"
ARTWORK_SIZE = 824
CANVAS_SIZE = 1024


def image_data(path):
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def source_svg(rounded):
    """Wrap the unchanged master in a square or inset rounded plate."""
    size = ARTWORK_SIZE if rounded else CANVAS_SIZE
    inset = (CANVAS_SIZE - size) / 2
    radius = size * 0.225 if rounded else 0
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{CANVAS_SIZE}" height="{CANVAS_SIZE}" '
        f'viewBox="0 0 {CANVAS_SIZE} {CANVAS_SIZE}">'
        '<defs><clipPath id="plate">'
        f'<rect x="{inset}" y="{inset}" width="{size}" height="{size}" '
        f'rx="{radius}"/></clipPath></defs>'
        f'<image clip-path="url(#plate)" x="{inset}" y="{inset}" '
        f'width="{size}" height="{size}" '
        f'xlink:href="{image_data(MASTER)}"/></svg>'
    )


def export():
    """Export both size sets, the macOS icons, and the browser favicon."""
    with tempfile.TemporaryDirectory(prefix="devie-quota-icon-") as output:
        directory = Path(output)
        source = directory / "source.svg"
        for variant in ("square", "rounded"):
            destination = ASSETS / variant
            destination.mkdir(parents=True, exist_ok=True)
            source.write_text(source_svg(variant == "rounded"))
            sizes = [arg for size in SIZES for arg in ("--png", str(size))]
            subprocess.run(
                ["bun", "tauri", "icon", str(source), "--output",
                 str(destination), *sizes],
                cwd=ROOT,
                check=True,
            )
        shutil.copyfile(ASSETS / "rounded/1024x1024.png", ICON)
        subprocess.run(
            ["bun", "tauri", "icon", str(ICON), "--output", output],
            cwd=ROOT,
            check=True,
            capture_output=True,
        )
        for name in EXPORTS:
            shutil.copyfile(directory / name, DESKTOP / name)
        shutil.copyfile(ASSETS / "square/128x128.png", ROOT / "src/app/icon.png")


def preview():
    """Show the exported artwork at 460, 128, 64, 32, 22, and 16px."""
    side = 696
    cells = ['<use xlink:href="#icon" x="118" y="20" width="460" height="460"/>']
    x = 130
    for size in (128, 64, 32, 22, 16):
        cells.append(
            f'<use xlink:href="#icon" x="{x}" y="{638 - size}" '
            f'width="{size}" height="{size}"/>'
            f'<text x="{x + size / 2}" y="661" text-anchor="middle" '
            f'font-family="sans-serif" font-size="12" fill="#66616e">{size}px</text>'
        )
        x += size + 26
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{side}" height="{side}" viewBox="0 0 {side} {side}">'
        f'<defs><symbol id="icon" viewBox="0 0 {CANVAS_SIZE} {CANVAS_SIZE}">'
        f'<image width="{CANVAS_SIZE}" height="{CANVAS_SIZE}" '
        f'xlink:href="{image_data(ICON)}"/></symbol></defs>'
        f'<rect width="{side}" height="{side}" fill="#eae8ee"/>'
        f'{"".join(cells)}</svg>'
    )
    with tempfile.TemporaryDirectory(prefix="devie-quota-icon-preview-") as output:
        path = Path(output) / "preview.svg"
        path.write_text(svg)
        subprocess.run(
            ["qlmanage", "-t", "-s", str(side), "-o", output, str(path)],
            check=True,
            capture_output=True,
        )
        shutil.copyfile(Path(output) / "preview.svg.png", HERE / "preview.png")


if __name__ == "__main__":
    export()
    preview()
    print("wrote square and rounded assets, macOS icons, favicon, and preview")
