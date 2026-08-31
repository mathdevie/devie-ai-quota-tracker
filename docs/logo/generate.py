#!/usr/bin/env python3
"""Generate the Devie Quota app icon and its size preview.

Run from the repository root:

    python3 docs/logo/generate.py
    cp docs/logo/app-icon.svg src-desktop/icons/app-icon.svg
    cp docs/logo/app-icon.svg src/app/icon.svg
    bun tauri icon src-desktop/icons/app-icon.svg
"""

import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))

# --- mark geometry ---------------------------------------------------------
# A pointy-top hexagon shell with a chevron-topped fill. The fill level reads
# as a quota gauge, and its peak echoes the shell's peak.
CX = 256          # the canvas is 512x512
CY = 256          # the geometric centre
WIDTH = 306
HEIGHT = 356
SHOULDER = 76     # vertical drop from the peak to the first side vertex
PEAK = 0.315      # fill peak, as a fraction of the mark height
LEVEL = 0.53      # fill shoulders, as a fraction of the mark height
STROKE = 18

PLATE = '<rect width="512" height="512" rx="115"'


def paths():
    top, bottom, hw = CY - HEIGHT / 2, CY + HEIGHT / 2, WIDTH / 2
    shell = [
        (CX, top),
        (CX + hw, top + SHOULDER),
        (CX + hw, bottom - SHOULDER),
        (CX, bottom),
        (CX - hw, bottom - SHOULDER),
        (CX - hw, top + SHOULDER),
    ]
    peak_y, level_y = top + HEIGHT * PEAK, top + HEIGHT * LEVEL
    fill = [
        (CX - hw, level_y),
        (CX, peak_y),
        (CX + hw, level_y),
        (CX + hw, bottom - SHOULDER),
        (CX, bottom),
        (CX - hw, bottom - SHOULDER),
    ]

    def draw(points):
        return " ".join(f"{'M' if i == 0 else 'L'}{x:.1f} {y:.1f}"
                        for i, (x, y) in enumerate(points)) + "Z"

    return draw(shell), draw(fill)


SHELL, FILL = paths()

# --- the icon -------------------------------------------------------------
# The plate is top-lit and vignetted at the corners, with a rim highlight
# along the top edge, so it reads with depth rather than as flat black.
DEFS = '''    <linearGradient id="plate" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2e2e35"/><stop offset="0.48" stop-color="#15151a"/><stop offset="1" stop-color="#07070a"/>
    </linearGradient>
    <radialGradient id="vignette" cx="256" cy="230" r="330" gradientUnits="userSpaceOnUse">
      <stop offset="0.35" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.5"/>
    </radialGradient>
    <linearGradient id="rim" x1="256" y1="0" x2="256" y2="320" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.36"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
'''

BODY = f'''  {PLATE} fill="url(#plate)"/>
  {PLATE} fill="url(#vignette)"/>
  {PLATE} fill="none" stroke="url(#rim)" stroke-width="3"/>
  <g>
    <path d="{FILL}" fill="#ffffff" stroke="#ffffff" stroke-width="{STROKE}" stroke-linejoin="round"/>
    <path d="{SHELL}" fill="none" stroke="#ffffff" stroke-width="{STROKE}" stroke-linejoin="round"/>
  </g>
'''


def render():
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n'
           '  <title>Devie Quota</title>\n'
           f'  <defs>\n{DEFS}  </defs>\n{BODY}</svg>\n')
    with open(os.path.join(HERE, "app-icon.svg"), "w") as handle:
        handle.write(svg)
    return svg


def preview():
    """One sheet showing the icon at 460px down to 22px.

    22px is the menu-bar size, and it decides whether the treatment survives.
    """
    pad, big, gap = 28, 460, 24
    # Quick Look always renders a square thumbnail, so build a square sheet.
    side = pad + big + gap + 128 + pad
    ox = (side - big) // 2

    row = [(128, 0), (64, 32), (32, 64), (22, 76)]
    x = ox
    cells = [f'<g transform="translate({ox},{pad}) scale({big / 512})">{BODY}</g>']
    for px, drop in row:
        y = pad + big + gap + drop
        cells.append(f'<g transform="translate({x},{y}) scale({px / 512})">{BODY}</g>')
        x += px + 20

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{side}" height="{side}"'
           f' viewBox="0 0 {side} {side}">\n<defs>{DEFS}</defs>'
           f'<rect width="{side}" height="{side}" fill="#f3f3f5"/>{"".join(cells)}</svg>')
    path = os.path.join(HERE, "_preview.svg")
    with open(path, "w") as handle:
        handle.write(svg)
    subprocess.run(["qlmanage", "-t", "-s", str(side), "-o", HERE, path],
                   check=True, capture_output=True)
    os.replace(path + ".png", os.path.join(HERE, "preview.png"))
    os.remove(path)


if __name__ == "__main__":
    render()
    preview()
    print("wrote docs/logo/app-icon.svg and docs/logo/preview.png")
