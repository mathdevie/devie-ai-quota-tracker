//! Tray and notification strings, read from the same locale files as the
//! interface (`src/i18n/messages/*.json`). The frontend owns the language
//! choice and sends it through `set_language`.

use std::{collections::HashMap, sync::OnceLock};

use serde_json::Value;

pub const DEFAULT_LOCALE: &str = "en-US";

const FILES: &[(&str, &str)] = &[
    ("en-US", include_str!("../../src/i18n/messages/en-US.json")),
    ("en-GB", include_str!("../../src/i18n/messages/en-GB.json")),
    ("fr-FR", include_str!("../../src/i18n/messages/fr-FR.json")),
    ("de-DE", include_str!("../../src/i18n/messages/de-DE.json")),
    ("it-IT", include_str!("../../src/i18n/messages/it-IT.json")),
    ("es-ES", include_str!("../../src/i18n/messages/es-ES.json")),
    (
        "es-419",
        include_str!("../../src/i18n/messages/es-419.json"),
    ),
    ("pt-BR", include_str!("../../src/i18n/messages/pt-BR.json")),
    ("fi-FI", include_str!("../../src/i18n/messages/fi-FI.json")),
    ("da-DK", include_str!("../../src/i18n/messages/da-DK.json")),
    ("nl-NL", include_str!("../../src/i18n/messages/nl-NL.json")),
    ("nb-NO", include_str!("../../src/i18n/messages/nb-NO.json")),
    ("sv-SE", include_str!("../../src/i18n/messages/sv-SE.json")),
    ("ja-JP", include_str!("../../src/i18n/messages/ja-JP.json")),
    ("zh-CN", include_str!("../../src/i18n/messages/zh-CN.json")),
];

fn catalog() -> &'static HashMap<&'static str, Value> {
    static CATALOG: OnceLock<HashMap<&'static str, Value>> = OnceLock::new();
    CATALOG.get_or_init(|| {
        FILES
            .iter()
            .filter_map(|(locale, json)| {
                serde_json::from_str(json)
                    .ok()
                    .map(|value| (*locale, value))
            })
            .collect()
    })
}

pub fn is_supported(locale: &str) -> bool {
    FILES.iter().any(|(candidate, _)| *candidate == locale)
}

/// The supported locale closest to a BCP 47 tag, such as "fr" or "pt-BR".
pub fn closest(tag: &str) -> Option<&'static str> {
    let lower = tag.to_lowercase().replace('_', "-");
    let exact = FILES
        .iter()
        .map(|(locale, _)| *locale)
        .find(|locale| locale.to_lowercase() == lower);
    exact.or_else(|| {
        let base = lower.split('-').next().unwrap_or_default();
        FILES
            .iter()
            .map(|(locale, _)| *locale)
            .find(|locale| locale.to_lowercase().starts_with(&format!("{base}-")))
    })
}

fn lookup(locale: &str, key: &str) -> Option<&'static str> {
    let mut node = catalog().get(locale)?;
    for part in key.split('.') {
        node = node.get(part)?;
    }
    node.as_str()
}

/// The message for a dotted key, with `{{name}}` placeholders filled in.
/// Falls back to en-US, then to the key itself.
pub fn t(locale: &str, key: &str, values: &[(&str, &str)]) -> String {
    let template = lookup(locale, key)
        .or_else(|| lookup(DEFAULT_LOCALE, key))
        .unwrap_or(key);
    values
        .iter()
        .fold(template.to_string(), |text, (name, value)| {
            text.replace(&format!("{{{{{name}}}}}"), value)
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_locale_parses_and_has_tray_keys() {
        for (locale, _) in FILES {
            assert!(catalog().contains_key(locale), "{locale} did not parse");
            assert!(
                lookup(locale, "Tray.Open").is_some(),
                "{locale} lacks Tray.Open"
            );
        }
    }

    #[test]
    fn interpolates_and_falls_back() {
        assert_eq!(
            t(
                "fr-FR",
                "Notifications.ResetHappenedTitle",
                &[("provider", "Claude")]
            ),
            "Quota Claude réinitialisé"
        );
        assert_eq!(t("xx-XX", "Tray.Quit", &[]), "Quit Devie Quota");
        assert_eq!(t("en-US", "Missing.Key", &[]), "Missing.Key");
    }

    #[test]
    fn finds_the_closest_locale() {
        assert_eq!(closest("fr"), Some("fr-FR"));
        assert_eq!(closest("pt_BR"), Some("pt-BR"));
        assert_eq!(closest("es-MX"), Some("es-ES"));
        assert_eq!(closest("ja"), Some("ja-JP"));
        assert_eq!(closest("zh-Hans"), Some("zh-CN"));
        assert_eq!(closest("xx-XX"), None);
    }
}
