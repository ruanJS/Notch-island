#![allow(linker_messages)]

pub mod commands;
pub mod platform;
pub mod storage;
pub mod tray;

pub fn run() {
    tauri::Builder::default()
        .manage(commands::widget::WidgetLayoutState::default())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            use tauri::Manager;
            if let Some(widget) = app.get_webview_window("widget") {
                let _ = widget.show();
                let _ = widget.set_focus();
            }
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .setup(|app| {
            tray::setup_tray(app)?;
            storage::app_state::init(app)?;
            commands::placement_guides::prepare(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::widget::get_widget_position,
            commands::widget::update_widget_bounds,
            commands::widget::set_widget_placement,
            commands::widget::place_widget_from_pointer,
            commands::widget::begin_widget_placement,
            commands::widget::show_widget,
            commands::widget::hide_widget,
            commands::system::enable_startup,
            commands::system::disable_startup,
            commands::system::is_startup_enabled,
            commands::settings::open_settings,
            commands::settings::close_settings,
            commands::onboarding::complete_onboarding,
            commands::onboarding::has_completed_onboarding,
        ])
        .run(tauri::generate_context!())
        .expect("error while running notchly");
}
