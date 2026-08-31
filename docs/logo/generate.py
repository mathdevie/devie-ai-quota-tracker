#!/usr/bin/env python3
"""Generate the Devie Quota app-icon variants and their preview sheets.

Run from the repository root:

    python3 docs/logo/generate.py

It writes the four candidate variants and two preview PNGs into docs/logo/,
then you copy the chosen variant over the two live icon sources:

    cp docs/logo/variant-a-slate-lift.svg src-desktop/icons/app-icon.svg
    cp docs/logo/variant-a-slate-lift.svg src/app/icon.svg
    bun tauri icon src-desktop/icons/app-icon.svg
"""

import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))

# --- mark geometry ---------------------------------------------------------
# A pointy-top hexagon shell with a chevron-topped fill. The fill level reads
# as a quota gauge, and its peak echoes the shell's peak.
CX = 256          # canvas is 512x512
CY = 256          # geometric centre; the mark used to sit 16px high
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
    fmt = lambda pts: " ".join(f"{'M' if i == 0 else 'L'}{x:.1f} {y:.1f}"
                               for i, (x, y) in enumerate(pts)) + "Z"
    return fmt(shell), fmt(fill)


SHELL, FILL = paths()


def mark(paint, group_attrs=""):
    return (
        f'  <g{" " + group_attrs if group_attrs else ""}>\n'
        f'    <path d="{FILL}" fill="{paint}" stroke="{paint}"'
        f' stroke-width="{STROKE}" stroke-linejoin="round"/>\n'
        f'    <path d="{SHELL}" fill="none" stroke="{paint}"'
        f' stroke-width="{STROKE}" stroke-linejoin="round"/>\n'
        f'  </g>\n'
    )


# --- variants -------------------------------------------------------------
VARIANTS = {}

VARIANTS["variant-a-slate-lift"] = ('''    <linearGradient id="plate" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2e2e35"/><stop offset="0.48" stop-color="#15151a"/><stop offset="1" stop-color="#07070a"/>
    </linearGradient>
    <radialGradient id="vignette" cx="256" cy="230" r="330" gradientUnits="userSpaceOnUse">
      <stop offset="0.35" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.5"/>
    </radialGradient>
    <linearGradient id="rim" x1="256" y1="0" x2="256" y2="320" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.36"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
''', f'''  {PLATE} fill="url(#plate)"/>
  {PLATE} fill="url(#vignette)"/>
  {PLATE} fill="none" stroke="url(#rim)" stroke-width="3"/>
{mark("#ffffff")}''')

VARIANTS["variant-b-mana-light"] = ('''    <linearGradient id="plate" x1="100" y1="0" x2="412" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#eeeef1"/><stop offset="1" stop-color="#cfcfd6"/>
    </linearGradient>
    <linearGradient id="rim" x1="256" y1="0" x2="256" y2="260" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="mark" x1="150" y1="78" x2="370" y2="434" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#202025"/><stop offset="1" stop-color="#51515a"/>
    </linearGradient>
    <filter id="lift" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
''', f'''  {PLATE} fill="url(#plate)"/>
  {PLATE} fill="none" stroke="url(#rim)" stroke-width="3"/>
{mark("url(#mark)", 'filter="url(#lift)"')}''')

VARIANTS["variant-c-deep-well"] = ('''    <radialGradient id="plate" cx="256" cy="215" r="345" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#33333b"/><stop offset="0.45" stop-color="#16161b"/><stop offset="1" stop-color="#040406"/>
    </radialGradient>
    <linearGradient id="rim" x1="256" y1="0" x2="256" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="mark" x1="256" y1="78" x2="256" y2="434" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e5e5ed"/>
    </linearGradient>
''', f'''  {PLATE} fill="url(#plate)"/>
  {PLATE} fill="none" stroke="url(#rim)" stroke-width="3"/>
{mark("url(#mark)")}''')

VARIANTS["variant-d-spotlight"] = ('''    <linearGradient id="plate" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1a1a1f"/><stop offset="1" stop-color="#050507"/>
    </linearGradient>
    <radialGradient id="spot" cx="256" cy="150" r="300" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rim" x1="256" y1="0" x2="256" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="lift" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
''', f'''  {PLATE} fill="url(#plate)"/>
  {PLATE} fill="url(#spot)"/>
  {PLATE} fill="none" stroke="url(#rim)" stroke-width="3"/>
{mark("#ffffff", 'filter="url(#lift)"')}''')


def render_variant(name):
    defs, body = VARIANTS[name]
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n'
        '  <title>Devie Quota</title>\n'
        f'  <defs>\n{defs}  </defs>\n{body}</svg>\n'
    )
    with open(os.path.join(HERE, name + ".svg"), "w") as handle:
        handle.write(svg)
    return defs, body


# --- preview sheets -------------------------------------------------------
# The ids are shared across variants, so namespace them per cell before
# inlining several variants into one sheet.
def namespaced(defs, body, suffix):
    import re
    for ident in re.findall(r'id="([^"]+)"', defs):
        defs = defs.replace(f'id="{ident}"', f'id="{ident}{suffix}"')
        body = body.replace(f"url(#{ident})", f"url(#{ident}{suffix})")
    return defs, body


def sheet(cells, columns, size, out_name, with_sizes=True):
    pad = 26
    rows = (len(cells) + columns - 1) // columns
    caption = 90 if with_sizes else 46
    width = columns * size + (columns + 1) * pad
    height = rows * (size + caption) + pad
    # Quick Look always renders a square thumbnail, so pad the sheet to square.
    side = max(width, height)
    ox, oy = (side - width) // 2, (side - height) // 2

    defs_out, groups = [], []
    for index, (defs, body, label) in enumerate(cells):
        defs, body = namespaced(defs, body, f"_{index}")
        defs_out.append(defs)
        col, row = index % columns, index // columns
        x = ox + pad + col * (size + pad)
        y = oy + pad + row * (size + caption)
        groups.append(f'<g transform="translate({x},{y}) scale({size / 512})">{body}</g>')
        if with_sizes:
            cy = y + size + 14
            for offset_x, offset_y, px in ((0, 0, 64), (78, 16, 32), (124, 24, 22)):
                groups.append(f'<g transform="translate({x + offset_x},{cy + offset_y})'
                              f' scale({px / 512})">{body}</g>')
            groups.append(f'<text x="{x + 162}" y="{cy + 42}" font-family="-apple-system,'
                          f'Helvetica" font-size="24" fill="#111111">{label}</text>')
        else:
            groups.append(f'<text x="{x + size / 2}" y="{y + size + 30}" text-anchor="middle"'
                          f' font-family="-apple-system,Helvetica" font-size="24"'
                          f' fill="#111111">{label}</text>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{side}" height="{side}"'
           f' viewBox="0 0 {side} {side}">\n<defs>{"".join(defs_out)}</defs>'
           f'<rect width="{side}" height="{side}" fill="#f3f3f5"/>{"".join(groups)}</svg>')
    path = os.path.join(HERE, out_name)
    with open(path, "w") as handle:
        handle.write(svg)
    return path, side


def to_png(svg_path, size, png_name):
    """Rasterise with Quick Look, which ships with macOS."""
    subprocess.run(["qlmanage", "-t", "-s", str(size), "-o", HERE, svg_path],
                   check=True, capture_output=True)
    produced = svg_path + ".png"
    os.replace(produced, os.path.join(HERE, png_name))


def main():
    rendered = {name: render_variant(name) for name in VARIANTS}

    labels = {
        "variant-a-slate-lift": "A · slate lift",
        "variant-b-mana-light": "B · mana light",
        "variant-c-deep-well": "C · deep well",
        "variant-d-spotlight": "D · spotlight",
    }
    cells = [(*rendered[name], labels[name]) for name in labels]
    path, side = sheet(cells, 2, 560, "_variants.svg")
    to_png(path, side, "preview-variants.png")
    os.remove(path)

    # Centering study: the committed placement against the corrected one.
    global CY, WIDTH, HEIGHT, SHELL, FILL
    study = []
    for centre, w, h, label in ((240, 300, 350, "before · 16px high"),
                                (256, 306, 356, "after · centred")):
        CY, WIDTH, HEIGHT = centre, w, h
        SHELL, FILL = paths()
        defs, body = VARIANTS["variant-a-slate-lift"][0], None
        # Rebuild the body with the current geometry.
        body = f'''  {PLATE} fill="url(#plate)"/>
  {PLATE} fill="url(#vignette)"/>
  {PLATE} fill="none" stroke="url(#rim)" stroke-width="3"/>
{mark("#ffffff")}'''
        study.append((defs, body, label))
    path, side = sheet(study, 2, 480, "_centering.svg", with_sizes=False)
    to_png(path, side, "preview-centering.png")
    os.remove(path)

    print("wrote variants and previews to docs/logo/")


if __name__ == "__main__":
    main()
