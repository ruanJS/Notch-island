use tauri::Manager;
use tauri_plugin_store::StoreExt;

/// Inicializa o estado da aplicação na primeira execução.
/// README seção 6: verifica hasCompletedOnboarding e decide qual janela mostrar.
pub fn init(app: &mut tauri::App) -> tauri::Result<()> {
    let handle = app.handle().clone();

    let store = handle.store("notchly.json").expect("falha ao abrir store");

    let completed = store
        .get("hasCompletedOnboarding")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    if completed {
        // Onboarding já foi feito → abre diretamente o widget nativo no desktop.
        if let Some(win) = handle.get_webview_window("onboarding") {
            let _ = win.hide();
        }
        if let Some(win) = handle.get_webview_window("main") {
            let _ = win.hide();
        }
        let _ = crate::commands::widget::position_widget_window(&handle);
        if let Some(win) = handle.get_webview_window("widget") {
            let _ = win.show();
        }
    }
    // Se não completou → janela de onboarding já está visível (default no tauri.conf.json)

    Ok(())
}
