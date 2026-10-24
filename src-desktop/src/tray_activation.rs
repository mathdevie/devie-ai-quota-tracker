//! macOS status-item activation also comes from accessibility and remote clients,
//! without the mouse-up event emitted by tray-icon's custom view.

use std::cell::RefCell;

use objc2::{define_class, msg_send, rc::Retained, sel, DeclaredClass, MainThreadOnly};
use objc2_app_kit::{NSEvent, NSEventType, NSMenu, NSStatusItem};
use objc2_foundation::{MainThreadMarker, NSObject, NSObjectProtocol, NSPoint};

struct ActionState {
    item: Retained<NSStatusItem>,
    menu: Retained<NSMenu>,
    activate: Box<dyn Fn()>,
}

define_class!(
    #[unsafe(super(NSObject))]
    #[thread_kind = MainThreadOnly]
    #[name = "DevieQuotaTrayAction"]
    #[ivars = ActionState]
    struct TrayAction;

    unsafe impl NSObjectProtocol for TrayAction {}

    impl TrayAction {
        #[unsafe(method(openQuotas:))]
        fn open_quotas(&self, _sender: &NSObject) {
            (self.ivars().activate)();
        }
    }
);

thread_local! {
    // NSControl's target is not retained. Keep it alive on AppKit's main thread,
    // replacing it when tray-icon recreates the item or changes its menu.
    static ACTION: RefCell<Option<Retained<TrayAction>>> = const { RefCell::new(None) };
}

pub(crate) fn install(item: Retained<NSStatusItem>, activate: impl Fn() + 'static) {
    let mtm =
        MainThreadMarker::new().expect("tray activation must be installed on the main thread");
    // Reapplying visibility to an already-visible item must preserve its menu.
    let menu = item.menu(mtm).or_else(|| {
        ACTION.with(|slot| {
            slot.borrow().as_ref().and_then(|action| {
                (Retained::as_ptr(&action.ivars().item) == Retained::as_ptr(&item))
                    .then(|| action.ivars().menu.clone())
            })
        })
    });
    let (Some(menu), Some(button)) = (menu, item.button(mtm)) else {
        return;
    };
    let action = TrayAction::alloc(mtm).set_ivars(ActionState {
        item: item.clone(),
        menu,
        activate: Box::new(activate),
    });
    // SAFETY: NSObject initialization; the target implements openQuotas: and
    // ACTION retains it for at least as long as the button uses it.
    unsafe {
        let action: Retained<TrayAction> = msg_send![super(action), init];
        // An attached NSMenu takes precedence over target/action, including AXPress.
        item.setMenu(None);
        button.setTarget(Some(&action));
        button.setAction(Some(sel!(openQuotas:)));
        ACTION.with(|slot| slot.replace(Some(action)));
    }
}

/// A left press on our status button belongs to the popover toggle. Dismissing
/// it as an outside click on mouse-down would make mouse-up reopen it.
pub(crate) fn is_primary_click_on_tray(event: &NSEvent) -> bool {
    if event.r#type() != NSEventType::LeftMouseDown {
        return false;
    }
    let action = ACTION.with(|slot| slot.borrow().clone());
    let Some(action) = action else { return false };
    let mtm = MainThreadMarker::from(&*action);
    let Some(button) = action.ivars().item.button(mtm) else {
        return false;
    };
    let Some(window) = button.window() else {
        return false;
    };
    if !window.isVisible() {
        return false;
    }
    let bounds = window.convertRectToScreen(button.convertRect_toView(button.bounds(), None));
    // AppKit supplies window coordinates for local events and screen coordinates
    // when there is no window. Use native points throughout, including on Retina
    // and displays whose screen origin is negative.
    let point = event.window(mtm).map_or_else(
        || event.locationInWindow(),
        |window| window.convertPointToScreen(event.locationInWindow()),
    );
    point.x >= bounds.origin.x
        && point.x < bounds.origin.x + bounds.size.width
        && point.y >= bounds.origin.y
        && point.y < bounds.origin.y + bounds.size.height
}

/// Only called for an explicit right-click, never for native/AX activation.
pub(crate) fn show_context_menu() {
    // AppKit tracks menus in a nested event loop. Do not keep the RefCell borrowed
    // while it runs: a menu action can update the language or tray visibility.
    let action = ACTION.with(|slot| slot.borrow().clone());
    let Some(action) = action else { return };
    let state = action.ivars();
    let mtm = MainThreadMarker::from(&*action);
    if let Some(button) = state.item.button(mtm) {
        let bounds = button.bounds();
        button.highlight(true);
        state.menu.popUpMenuPositioningItem_atLocation_inView(
            None,
            NSPoint::new(bounds.origin.x, bounds.origin.y),
            Some(&button),
        );
        button.highlight(false);
    }
}
