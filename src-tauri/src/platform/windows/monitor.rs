/// Monitor utilities para Windows.
/// README seção 19: multi-monitor aware desde o início.
/// Implementação futura: enumerar monitores e mapear posições.

pub struct MonitorInfo {
    pub id: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub is_primary: bool,
}

/// Retorna ID do monitor primário como fallback.
/// README seção 19: monitorId salvo com a posição.
pub fn get_primary_monitor_id() -> String {
    "primary".to_string()
}
