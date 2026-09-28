#!/usr/bin/env python3
"""Export the approved Devie Quota light-level icon.

The raster master preserves the selected white hexagon, violet light seam,
and fine grain. Export only adds transparent spacing and resizes the image.

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

# The selected artwork already has a transparent border. Scaling its full
# canvas to 915/1024 makes the visible plate about 81% of the export canvas,
# matching the approved Devie Code icon. Do not crop or redraw the artwork.
ARTWORK_SIZE = 915
CANVAS_SIZE = 1024


def image_data(path):
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def export():
    """Normalize the safe area, then export the native and browser icons."""
    inset = (CANVAS_SIZE - ARTWORK_SIZE) / 2
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{CANVAS_SIZE}" height="{CANVAS_SIZE}" '
        f'viewBox="0 0 {CANVAS_SIZE} {CANVAS_SIZE}">'
        f'<image x="{inset}" y="{inset}" '
        f'width="{ARTWORK_SIZE}" height="{ARTWORK_SIZE}" '
        f'xlink:href="{image_data(MASTER)}"/></svg>'
    )
    with tempfile.TemporaryDirectory(prefix="devie-quota-icon-") as output:
        directory = Path(output)
        source = directory / "source.svg"
        source.write_text(svg)
        subprocess.run(
            ["bun", "tauri", "icon", str(source), "--output", output,
             "--png", str(CANVAS_SIZE)],
            cwd=ROOT,
            check=True,
        )
        shutil.copyfile(directory / f"{CANVAS_SIZE}x{CANVAS_SIZE}.png", ICON)
        subprocess.run(
            ["bun", "tauri", "icon", str(ICON), "--output", output],
            cwd=ROOT,
            check=True,
            capture_output=True,
        )
        for name in EXPORTS:
            shutil.copyfile(directory / name, DESKTOP / name)
        shutil.copyfile(directory / "128x128.png", ROOT / "src/app/icon.png")


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
    print("wrote the app icon, macOS exports, browser favicon, and size preview")
