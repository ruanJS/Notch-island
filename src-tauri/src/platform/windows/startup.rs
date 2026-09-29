/// Startup helpers para Windows.
/// README seção 23: Start Notch Island with Windows.
/// A implementação real usa tauri-plugin-autostart (ver commands/system.rs).
/// Este módulo é o stub da camada de plataforma para extensão futura.

pub fn startup_registry_key() -> &'static str {
    "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"
}

pub fn app_startup_name() -> &'static str {
    "Notch Island"
}
