//! Janela efêmera, transparente e sem captura de mouse para as quatro bordas.
use tauri::{AppHandle, Manager, Monitor, PhysicalPosition, PhysicalSize, Position, Size, WebviewUrl, WebviewWindowBuilder};

const LABEL: &str = "placement";

fn window(app: &AppHandle) -> Result<tauri::WebviewWindow, String> {
    let window = if let Some(window) = app.get_webview_window(LABEL) {
        window
    } else {
        WebviewWindowBuilder::new(app, LABEL, WebviewUrl::App("index.html?window=placement".into()))
            .title("Notch Island placement guides")
            .inner_size(1.0, 1.0)
            .decorations(false)
            .transparent(true)
            .shadow(false)
            .always_on_top(false)
            .skip_taskbar(true)
            .focused(false)
            .focusable(false)
            .visible(false)
            .resizable(false)
            .build()
            .map_err(|e| e.to_string())?
    };
    window.set_ignore_cursor_events(true).map_err(|e| e.to_string())?;
    Ok(window)
}

/// Load the guide webview before the first pointer gesture. Creating and
/// loading it during pointer-down can consume the entire short drag.
pub fn prepare(app: &AppHandle) -> Result<(), String> {
    let _ = window(app)?;
    Ok(())
}

pub fn show(app: &AppHandle, monitor: &Monitor) -> Result<(), String> {
    let area = monitor.work_area();
    let window = window(app)?;
    window.set_position(Position::Physical(PhysicalPosition::new(area.position.x, area.position.y))).map_err(|e| e.to_string())?;
    window.set_size(Size::Physical(PhysicalSize::new(area.size.width, area.size.height))).map_err(|e| e.to_string())?;
    window.show().map_err(|e| e.to_string())?;
    // Promote after showing: the guide stroke must be drawn above the
    // already-topmost widget, including at its current edge.
    window.set_always_on_top(true).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn hide(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(LABEL) {
        let _ = window.hide();
        let _ = window.set_always_on_top(false);
    }
}
