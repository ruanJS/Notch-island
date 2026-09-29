use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Manager,
};

/// Configura o ícone e menu do System Tray.
/// README seção 22: Show Widget / Hide Widget / Settings / Providers / Pause Tracking / Quit
pub fn setup_tray(app: &mut App) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show_widget", "Show Widget", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide_widget", "Hide Widget", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let providers = MenuItem::with_id(app, "providers", "Providers", true, None::<&str>)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let pause = MenuItem::with_id(app, "pause_tracking", "Pause Tracking", true, None::<&str>)?;
    let sep3 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Sair do Notch Island", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &show, &hide, &sep1, &settings, &providers, &sep2, &pause, &sep3, &quit,
        ],
    )?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| handle_menu_event(app, event.id().as_ref()))
        .on_tray_icon_event(|tray, event| {
            // Clique duplo no ícone do tray abre o widget
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                let _ = crate::commands::widget::show_widget(app.clone());
            }
        })
        .build(app)?;

    Ok(())
}

fn handle_menu_event(app: &AppHandle, id: &str) {
    match id {
        "show_widget" => {
            let _ = crate::commands::widget::show_widget(app.clone());
        }
        "hide_widget" => {
            if let Some(win) = app.get_webview_window("widget") {
                let _ = win.hide();
            }
        }
        "settings" => {
            if let Some(win) = app.get_webview_window("settings") {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }
        "providers" => {
            // Abre settings direto na aba providers (via URL hash)
            if let Some(win) = app.get_webview_window("settings") {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }
        "quit" => {
            app.exit(0);
        }
        _ => {}
    }
}
