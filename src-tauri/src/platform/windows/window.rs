/// Window utilities para Windows.
/// README seção 18: borderless, transparent, floating, always on top, no taskbar.
/// Configurações aplicadas via tauri.conf.json — este módulo é reservado para
/// customizações Win32 futuras que o Tauri não cobre nativamente.

pub fn snap_threshold_px() -> f64 {
    20.0
}
