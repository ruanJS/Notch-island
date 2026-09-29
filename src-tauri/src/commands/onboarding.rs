use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use super::widget::{NotchPlacement, WidgetPosition};

/// Verifica se o onboarding foi concluído e decide qual janela exibir.
/// README seção 6: hasCompletedOnboarding?
#[tauri::command]
pub fn has_completed_onboarding(app: AppHandle) -> Result<bool, String> {
    let store = app.store("notchly.json").map_err(|e| e.to_string())?;

    let completed = store
        .get("hasCompletedOnboarding")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    Ok(completed)
}

/// Marca onboarding como concluído, oculta janela de onboarding e exibe janela principal.
#[tauri::command]
pub fn complete_onboarding(app: AppHandle) -> Result<(), String> {
    // Persiste flag
    let store = app.store("notchly.json").map_err(|e| e.to_string())?;
    store.set("hasCompletedOnboarding", serde_json::Value::Bool(true));
    store.set(
        "widgetPosition",
        serde_json::to_value(WidgetPosition { placement: NotchPlacement::RightCenter, edge: super::widget_bounds::WidgetEdge::Right, offset: 0.0, monitor_id: None })
            .map_err(|e| e.to_string())?,
    );
    store.set("widgetEdgeOffsetV1", serde_json::Value::Bool(true));
    store.save().map_err(|e| e.to_string())?;

    // Fecha onboarding
    if let Some(win) = app.get_webview_window("onboarding") {
        win.hide().map_err(|e| e.to_string())?;
    }

    // Abre o widget nativo diretamente no canto da tela.
    crate::commands::widget::position_widget_window(&app)?;
    if let Some(win) = app.get_webview_window("widget") {
        win.show().map_err(|e| e.to_string())?;
        win.set_focus().map_err(|e| e.to_string())?;
    }

    Ok(())
}
