//! Provider logos for the menu bar item. The same PNG files as the web UI
//! (`public/providers`), decoded once and given rounded corners like a macOS
//! app icon. The tray shows them in color, not as template images.

use std::{collections::HashMap, sync::OnceLock};

use tauri::image::Image;

use crate::model::Provider;

const CLAUDE: &[u8] = include_bytes!("../../public/providers/claude.png");
const CODEX: &[u8] = include_bytes!("../../public/providers/codex.png");
const GEMINI: &[u8] = include_bytes!("../../public/providers/gemini-cli.png");
const COPILOT: &[u8] = include_bytes!("../../public/providers/copilot.png");
const CURSOR: &[u8] = include_bytes!("../../public/providers/cursor.png");

/// Corner radius as a share of the icon size, the macOS app icon ratio.
const CORNER_RATIO: f64 = 0.225;

fn cache() -> &'static HashMap<&'static str, Image<'static>> {
    static ICONS: OnceLock<HashMap<&'static str, Image<'static>>> = OnceLock::new();
    ICONS.get_or_init(|| {
        [
            ("claude", CLAUDE),
            ("codex", CODEX),
            ("gemini-cli", GEMINI),
            ("copilot", COPILOT),
            ("cursor", CURSOR),
        ]
        .into_iter()
        .filter_map(|(id, bytes)| Some((id, rounded(Image::from_bytes(bytes).ok()?))))
        .collect()
    })
}

/// A copy of the provider logo, or None when the PNG failed to decode.
pub fn provider_icon(provider: &Provider) -> Option<Image<'static>> {
    let icon = cache().get(provider.as_str())?;
    Some(Image::new_owned(
        icon.rgba().to_vec(),
        icon.width(),
        icon.height(),
    ))
}

/// Clears the alpha outside a rounded rectangle, with a soft one-pixel edge.
fn rounded(image: Image<'_>) -> Image<'static> {
    let (width, height) = (image.width(), image.height());
    let radius = f64::from(width.min(height)) * CORNER_RATIO;
    let mut rgba = image.rgba().to_vec();
    for y in 0..height {
        for x in 0..width {
            let coverage = corner_coverage(x, y, width, height, radius);
            if coverage < 1.0 {
                let alpha = &mut rgba[((y * width + x) * 4 + 3) as usize];
                *alpha = (f64::from(*alpha) * coverage).round() as u8;
            }
        }
    }
    Image::new_owned(rgba, width, height)
}

/// 1.0 inside the rounded rectangle, 0.0 outside, in between on the edge.
fn corner_coverage(x: u32, y: u32, width: u32, height: u32, radius: f64) -> f64 {
    let px = f64::from(x) + 0.5;
    let py = f64::from(y) + 0.5;
    let cx = px.clamp(radius, f64::from(width) - radius);
    let cy = py.clamp(radius, f64::from(height) - radius);
    let distance = ((px - cx).powi(2) + (py - cy).powi(2)).sqrt();
    (radius - distance + 0.5).clamp(0.0, 1.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_every_provider_logo() {
        for provider in [
            Provider::Claude,
            Provider::Codex,
            Provider::Gemini,
            Provider::Copilot,
            Provider::Cursor,
        ] {
            let icon = provider_icon(&provider).expect("logo decodes");
            assert_eq!(icon.width(), 128);
            // The corner pixel is transparent, the center keeps its alpha.
            assert_eq!(icon.rgba()[3], 0);
            let center = ((64 * 128 + 64) * 4 + 3) as usize;
            assert_eq!(icon.rgba()[center], 255);
        }
    }
}
