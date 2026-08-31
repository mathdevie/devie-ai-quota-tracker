fn main() {
    // The PostHog key is baked in at build time; a change must rebuild.
    println!("cargo:rerun-if-env-changed=POSTHOG_API_KEY");
    tauri_build::build()
}
