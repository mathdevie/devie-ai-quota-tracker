//! Exercise real NSStatusItem target/action without a Tauri runtime or user data.
#[cfg(target_os = "macos")]
#[path = "../src/tray_activation.rs"]
mod tray_activation;

#[cfg(target_os = "macos")]
fn main() {
    use std::{cell::Cell, rc::Rc};

    use objc2::{
        define_class, msg_send, rc::Retained, runtime::ProtocolObject, DeclaredClass,
        MainThreadMarker, MainThreadOnly,
    };
    use objc2_app_kit::{
        NSApplication, NSMenu, NSMenuDelegate, NSStatusBar, NSVariableStatusItemLength,
    };
    use objc2_foundation::{NSObject, NSObjectProtocol, NSString};

    define_class!(
        #[unsafe(super(NSObject))]
        #[thread_kind = MainThreadOnly]
        #[name = "DevieTrayMenuProbe"]
        #[ivars = Rc<Cell<usize>>]
        struct MenuProbe;

        unsafe impl NSObjectProtocol for MenuProbe {}

        unsafe impl NSMenuDelegate for MenuProbe {
            #[unsafe(method(menuWillOpen:))]
            fn menu_will_open(&self, menu: &NSMenu) {
                self.ivars().set(self.ivars().get() + 1);
                menu.cancelTrackingWithoutAnimation();
            }
        }
    );

    let mtm = MainThreadMarker::new().expect("AppKit main thread");
    let _app = NSApplication::sharedApplication(mtm);
    let bar = NSStatusBar::systemStatusBar();
    let count = Rc::new(Cell::new(0));

    for generation in 0..2 {
        // A second status item models tray-icon's hide/show recreation.
        let item = bar.statusItemWithLength(NSVariableStatusItemLength);
        let button = item.button(mtm).expect("status button");
        button.setTitle(&NSString::from_str("Tray test"));

        for language in 0..2 {
            // Tauri's set_menu attaches a fresh native menu on language changes.
            let menu = NSMenu::new(mtm);
            let opened = Rc::new(Cell::new(0));
            let probe = MenuProbe::alloc(mtm).set_ivars(opened.clone());
            let probe: Retained<MenuProbe> = unsafe { msg_send![super(probe), init] };
            menu.setDelegate(Some(ProtocolObject::from_ref(&*probe)));
            unsafe {
                menu.addItemWithTitle_action_keyEquivalent(
                    &NSString::from_str("Test action"),
                    None,
                    &NSString::new(),
                );
            }
            item.setMenu(Some(&menu));
            for _ in 0..2 {
                // Reinstalling on an already-visible item must also remain safe.
                let count = count.clone();
                tray_activation::install(item.clone(), move || count.set(count.get() + 1));
                assert!(
                    item.menu(mtm).is_none(),
                    "native menu must not intercept activation"
                );
            }

            let before = count.get();
            unsafe { button.performClick(None) };
            assert_eq!(
                count.get(),
                before + 1,
                "native click activates exactly once"
            );

            // AXPress is a separate entry point used by accessibility clients.
            // NSStatusBarButton can return false even after dispatching the
            // action, so assert its observable effect rather than that return.
            let _: bool = unsafe { msg_send![&*button, accessibilityPerformPress] };
            assert_eq!(count.get(), before + 2, "AXPress activates exactly once");
            assert_eq!(
                opened.get(),
                0,
                "native and AX activation must not open the menu"
            );
            tray_activation::show_context_menu();
            assert_eq!(
                opened.get(),
                1,
                "explicit context action opens the current menu"
            );
            assert_eq!(
                count.get(),
                before + 2,
                "context menu must not activate the popover"
            );
            println!(
                "native click and AXPress passed (generation {generation}, language {language})"
            );
        }
        bar.removeStatusItem(&item);
    }
}

#[cfg(not(target_os = "macos"))]
fn main() {}
