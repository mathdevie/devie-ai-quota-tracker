# Icon generation prompt

The current master was generated on 2026-10-19 with the built-in
`image_gen.imagegen` tool in edit mode, with transparency disabled.
`master.png` is an unchanged copy of the 1254 × 1254 output.

Inputs, in order:

1. A white-background concept with a continuous black hexagonal ring and
   one inward arm, based on the [Rosamax shape](https://logobook.com/logo/rosamax/).
2. The [approved Devie UI logo](references/devie-ui-rainbow.png), used for
   the separated sections, material, and rainbow highlights.

The export script clips only the outer rounded plate and adds transparent
spacing. It does not regenerate the artwork or remove the white center.

## Exact final edit prompt

```text
Edit image 1, the hexagonal Quota Tracker logo. Image 2 is the original Devie UI logo and the exact reference for CLEAN WHITE CUTS between separate matte black sections. The user specifically says image 1 lacks those clean cuts.
Keep the overall upright hexagonal ring and single diagonal inward arm, same white background and framing. Redesign its construction as THREE physically separate, flat, matte black pieces separated by crisp WHITE AIR GAPS, exactly like image 2. The top chevron/crown (two upper sloping sides) is one piece; the lower-left section and inward diagonal arm form another piece; the lower-right section forms the third piece.
Make THREE unmistakable clean straight cuts: at the upper-left shoulder separating the crown from the left side and arm; at the upper-right shoulder separating the crown from the right side; and vertically through the bottom vertex separating the lower-left and lower-right sides. Each cut is a continuous pure white slit 10–14 pixels wide on this 1254px canvas, running completely across the black band's thickness from outside background to the white inner opening. These are real background gaps, not grooves, gray lines, shadows, colored seams or engraved strokes. Slightly soften the cut endpoints like image 2 while keeping cut faces sharp and straight.
Material correction: remove the puffy rounded tube treatment and shiny bevel from image 1. Use flat broad nearly black surfaces, restrained fine grain, crisp edges, only very shallow depth, matching image 2. Thin spectral rainbow edge accents remain at the outer perimeter, but keep the cuts clean white without colored bloom filling them. Keep cyan/green at upper left/top, amber/red at right, violet/magenta along bottom. The diagonal arm still points from upper-left toward center and stops with a modest rounded endpoint. Large center remains entirely white. No extra arms, no extra lines or glyphs, no text, no tile. One polished logo on white. Priority is visibly separated geometric sections with clean white cuts.
```
