# Approved icon generation prompt

The selected **B — Light level** artwork was generated on 2026-09-28 with
`image_gen.imagegen`, using the built-in tool in edit mode.

Input references, in order:

1. The previous Devie Quota white-filled hexagon icon.
2. The approved Devie Code white fish icon with violet light near its tail.
3. The Devie shaders `rising-together.png` artwork.

The tool returned the selected 1254 × 1254 RGBA image. `master.png` is an
unchanged copy of that result. The export script only adds the family safe
area and generates the required sizes; it does not run this prompt again.

## Exact prompt

```text
Create a polished macOS application icon concept for Devie Quota, a local AI quota tracker. This is a precise redesign of reference image 1 (the existing Quota icon). Reference 2 is the APPROVED Devie Code icon: use it as the exact app-family guide for the dark plate, white ink, restrained violet lighting, fine grain, proportions and padding. Reference 3 is the Devie light-seams shader artwork: use only its fine grain, crisp light boundary, and smooth diffused colored light. Do not copy its full purple background. Produce ONE square icon, no text, no labels, no side-by-side layouts.

Canvas: 1024 by 1024, real transparent background outside the rounded square plate. Plate bounding box about (100,100) to (924,924), centered, with radius about 180. Match reference 2's inset and nearly black matte charcoal plate, its restrained top-edge highlight and fine grain. No extra frame. Artwork is front-on, flat and graphic. No glass, chrome, 3D extrusions, folded surfaces, neon tubes, stars, particles, batteries, letters, numerical percentages, fish or robot.

Preserve the exact existing Quota mark silhouette and proportions from reference 1. It is a pointy-top hexagon shell around a chevron-topped lower quota fill. IMPORTANT it has SIX outer vertices with perfectly vertical left and right sides and symmetrical top and bottom points; do not turn it into a house or cube. Approximate coordinates on the new canvas: outer top (512,225), upper right (758,347), lower right (758,677), bottom (512,799), lower left (266,677), upper left (266,347), back to top. Outer white stroke about 28px thick, gently rounded joins. Inner quota boundary rises from left (266,529) to peak (512,406) and descends to right (758,529). Its two straight diagonal edges are parallel to the two top shell edges. The upper chevron-shaped area remains dark. Mark centered, balanced, no extra lines.

Color strength should be comparable to the purple tail glow on the approved Code icon, not a fully purple icon. Bright clean white mark on charcoal, violet #6b16df with a lilac #c075ff light rim near the central inner quota boundary. Strong legibility at 32px.

CONCEPT B — LIGHT LEVEL. Change ONLY the lower quota fill treatment: replace the solid white lower polygon with a deep violet-to-charcoal light field confined inside the original hexagon below the exact inner chevron boundary. This violet fill is brightest immediately BELOW the two inner diagonal edges, then smoothly fades into dark charcoal toward the bottom point. Draw the inner chevron boundary itself as a crisp luminous WHITE line of about 28px, same weight as the shell. Keep the complete outer hexagon shell bright white and the region above the chevron dark charcoal. Fine restrained grain across the plate and violet field. No vertical interior line: it must NOT become an isometric cube. This is a flat quota gauge filled with soft colored light. The resulting emblem has a full white outer hexagonal outline and one white rising chevron seam across its middle. Keep purple subtle and locally strongest where the inner seam meets the shell; no large unrelated glow or off-shape light trails.
```
