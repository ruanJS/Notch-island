use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Mutex;
 
use tauri::{AppHandle, Emitter, Manager, Monitor, PhysicalPosition, PhysicalSize, Position, Size};

use super::widget_bounds::{
    constrain_size,
    physical, position_for_dock_center, position_from_edge_offset, DockRect, Extent, Point, WidgetEdge, WorkArea,
    SCREEN_MARGIN_LOGICAL,
};

const POSITION_LAYOUT_VERSION: &str = "notchPlacementV1";
const POSITION_KEY: &str = "notchPlacement";

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum NotchPlacement {
    RightCenter,
    LeftCenter,
    TopCenter,
    BottomCenter,
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
}

impl Default for NotchPlacement {
    fn default() -> Self { Self::RightCenter }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetPosition {
    #[serde(default)]
    pub placement: NotchPlacement,
    pub edge: WidgetEdge,
    /// Deslocamento lógico/CSS ao longo da borda. X/Y físicos são derivados.
    pub offset: f64,
    /// Metadado para restaurar no monitor anterior quando ele ainda existir.
    pub monitor_id: Option<String>,
}

impl Default for WidgetPosition {
    fn default() -> Self { Self { placement: NotchPlacement::RightCenter, edge: WidgetEdge::Right, offset: 0.0, monitor_id: None } }
}

#[derive(Debug, Clone, Copy, Deserialize)]
pub struct WidgetBoundsRequest {
    pub edge: WidgetEdge,
    /// Canvas nativo total em pixels lógicos/CSS: DOM + reserva transparente
    /// para sombras. O Rust converte uma única vez para pixels físicos.
    pub width: f64,
    pub height: f64,
    /// Retângulo do dock visível dentro do canvas, em pixels lógicos.
    pub dock_left: f64,
    pub dock_top: f64,
    pub dock_width: f64,
    pub dock_height: f64,
}

#[derive(Default)]
pub struct WidgetLayoutState(Mutex<Option<WidgetBoundsRequest>>);

fn remembered_layout(app: &AppHandle) -> Result<Option<WidgetBoundsRequest>, String> {
    app.state::<WidgetLayoutState>().0.lock().map(|layout| *layout).map_err(|e| e.to_string())
}

fn remember_layout(app: &AppHandle, layout: WidgetBoundsRequest) -> Result<(), String> {
    *app.state::<WidgetLayoutState>().0.lock().map_err(|e| e.to_string())? = Some(layout);
    Ok(())
}

#[derive(Debug, Clone, Deserialize)]
pub struct PointerPositionRequest { pub x: i32, pub y: i32 }

#[derive(Debug, Clone, Deserialize)]
pub struct PlacementRequest { pub placement: NotchPlacement }

fn work_area(monitor: &Monitor) -> WorkArea {
    let area = monitor.work_area();
    WorkArea { left: area.position.x, top: area.position.y, width: area.size.width as i32, height: area.size.height as i32 }
}

fn placement_edge_offset(placement: NotchPlacement, size: Extent, area: WorkArea, scale: f64) -> (WidgetEdge, f64) {
    let (edge, fraction) = match placement {
        NotchPlacement::RightCenter => (WidgetEdge::Right, 0.5),
        NotchPlacement::LeftCenter => (WidgetEdge::Left, 0.5),
        NotchPlacement::TopCenter => (WidgetEdge::Top, 0.5),
        NotchPlacement::BottomCenter => (WidgetEdge::Bottom, 0.5),
        NotchPlacement::TopLeft => (WidgetEdge::Top, 0.0),
        NotchPlacement::TopRight => (WidgetEdge::Top, 1.0),
        NotchPlacement::BottomLeft => (WidgetEdge::Bottom, 0.0),
        NotchPlacement::BottomRight => (WidgetEdge::Bottom, 1.0),
    };
    let max = super::widget_bounds::max_offset_logical(edge, size, area, scale);
    (edge, max * fraction)
}

/// Hitboxes match the four dashed guides rendered by placement-guides.css.
/// Releasing between guides leaves the current placement untouched.
fn placement_from_pointer(point: Point, area: WorkArea, scale: f64) -> Option<NotchPlacement> {
    let horizontal_width = physical(360.0, scale).min(area.width * 55 / 100);
    let horizontal_height = physical(70.0, scale).min(area.height);
    let vertical_width = physical(70.0, scale).min(area.width);
    let vertical_height = physical(360.0, scale).min(area.height * 55 / 100);
    let horizontal_left = area.left + (area.width - horizontal_width) / 2;
    let vertical_top = area.top + (area.height - vertical_height) / 2;
    let in_horizontal = point.x >= horizontal_left && point.x < horizontal_left + horizontal_width;
    let in_vertical = point.y >= vertical_top && point.y < vertical_top + vertical_height;
    if in_horizontal && point.y >= area.top && point.y < area.top + horizontal_height {
        Some(NotchPlacement::TopCenter)
    } else if in_horizontal && point.y >= area.bottom() - horizontal_height && point.y < area.bottom() {
        Some(NotchPlacement::BottomCenter)
    } else if in_vertical && point.x >= area.left && point.x < area.left + vertical_width {
        Some(NotchPlacement::LeftCenter)
    } else if in_vertical && point.x >= area.right() - vertical_width && point.x < area.right() {
        Some(NotchPlacement::RightCenter)
    } else {
        None
    }
}

fn centered_placement(placement: NotchPlacement) -> NotchPlacement {
    match placement {
        NotchPlacement::TopLeft | NotchPlacement::TopRight => NotchPlacement::TopCenter,
        NotchPlacement::BottomLeft | NotchPlacement::BottomRight => NotchPlacement::BottomCenter,
        other => other,
    }
}

fn window_point(window: &tauri::WebviewWindow) -> Result<Point, String> {
    let p = window.outer_position().map_err(|e| e.to_string())?;
    Ok(Point { x: p.x, y: p.y })
}

fn window_extent(window: &tauri::WebviewWindow) -> Result<Extent, String> {
    let s = window.outer_size().map_err(|e| e.to_string())?;
    Ok(Extent { width: s.width as i32, height: s.height as i32 })
}

fn distance_to_work_area(point: Point, area: WorkArea) -> i64 {
    let x = point.x.clamp(area.left, area.right());
    let y = point.y.clamp(area.top, area.bottom());
    let dx = i64::from(point.x - x);
    let dy = i64::from(point.y - y);
    dx * dx + dy * dy
}

fn monitor_for_rect(window: &tauri::WebviewWindow, position: Point, size: Extent) -> Result<Monitor, String> {
    let center = Point { x: position.x + size.width / 2, y: position.y + size.height / 2 };
    if let Some(monitor) = window.monitor_from_point(center.x as f64, center.y as f64).map_err(|e| e.to_string())? {
        return Ok(monitor);
    }
    window.available_monitors().map_err(|e| e.to_string())?.into_iter()
        .min_by_key(|monitor| distance_to_work_area(center, work_area(monitor)))
        .or_else(|| window.primary_monitor().ok().flatten())
        .ok_or_else(|| "no monitor available".to_string())
}

fn monitor_by_id(window: &tauri::WebviewWindow, id: Option<&str>) -> Result<Option<Monitor>, String> {
    let Some(id) = id else { return Ok(None) };
    Ok(window.available_monitors().map_err(|e| e.to_string())?.into_iter()
        .find(|monitor| monitor.name().map(String::as_str) == Some(id)))
}

fn current_monitor(window: &tauri::WebviewWindow) -> Result<Monitor, String> {
    let position = window_point(window)?;
    let size = window_extent(window)?;
    monitor_for_rect(window, position, size)
}

fn save_position(app: &AppHandle, position: &WidgetPosition) -> Result<(), String> {
    let store = tauri_plugin_store::StoreExt::store(app, "notchly.json").map_err(|e| e.to_string())?;
    store.set(POSITION_KEY, serde_json::to_value(position).map_err(|e| e.to_string())?);
    store.set(POSITION_LAYOUT_VERSION, Value::Bool(true));
    store.save().map_err(|e| e.to_string())
}

fn apply_position(window: &tauri::WebviewWindow, position: Point) -> Result<(), String> {
    window.set_position(Position::Physical(PhysicalPosition::new(position.x, position.y))).map_err(|e| e.to_string())
}

fn emit_position(app: &AppHandle, position: &WidgetPosition) {
    let _ = app.emit("widget-position-changed", position);
}

fn canonical_position(value: &Value) -> Option<WidgetPosition> {
    serde_json::from_value(value.clone()).ok()
}

/// Reads the canonical corner placement. Older records are intentionally
/// ignored and fall back to RIGHT_CENTER.
fn load_or_migrate_position(app: &AppHandle) -> Result<Option<WidgetPosition>, String> {
    let store = tauri_plugin_store::StoreExt::store(app, "notchly.json").map_err(|e| e.to_string())?;
    let Some(value) = store.get(POSITION_KEY) else { return Ok(None) };
    if let Some(position) = canonical_position(&value) {
        return Ok(Some(position));
    }

    Ok(None)
}

fn normalized_for_monitor(position: &WidgetPosition, monitor: &Monitor, size: Extent) -> WidgetPosition {
    let area = work_area(monitor);
    let scale = monitor.scale_factor();
    let placement = centered_placement(position.placement);
    let (edge, placement_offset) = placement_edge_offset(placement, size, area, scale);
    let (_, offset) = position_from_edge_offset(edge, placement_offset, size, area, scale);
    WidgetPosition { placement, edge, offset, monitor_id: monitor.name().cloned() }
}

fn apply_edge_position(window: &tauri::WebviewWindow, position: &WidgetPosition, monitor: &Monitor, size: Extent) -> Result<WidgetPosition, String> {
    let area = work_area(monitor);
    let scale = monitor.scale_factor();
    let (native_position, offset) = position_from_edge_offset(position.edge, position.offset, size, area, scale);
    apply_position(window, native_position)?;
    Ok(WidgetPosition { placement: position.placement, edge: position.edge, offset, monitor_id: monitor.name().cloned() })
}

/// Every placement uses the visible notch as its anchor. The transparent
/// canvas may grow for a flyout, but its extra area never shifts the dock.
fn apply_dock_layout(window: &tauri::WebviewWindow, monitor: &Monitor, placement: NotchPlacement, layout: WidgetBoundsRequest) -> Result<WidgetPosition, String> {
    let area = work_area(monitor);
    let scale = monitor.scale_factor();
    let requested = Extent { width: physical(layout.width.max(1.0), scale), height: physical(layout.height.max(1.0), scale) };
    let size = constrain_size(requested, area, physical(SCREEN_MARGIN_LOGICAL, scale));
    if window_extent(window)? != size {
        window.set_size(Size::Physical(PhysicalSize::new(size.width as u32, size.height as u32))).map_err(|e| e.to_string())?;
    }
    let dock = DockRect {
        left: (layout.dock_left * scale).round() as i32,
        top: (layout.dock_top * scale).round() as i32,
        width: physical(layout.dock_width, scale),
        height: physical(layout.dock_height, scale),
    };
    let placement = centered_placement(placement);
    let (edge, offset) = placement_edge_offset(placement, Extent { width: dock.width, height: dock.height }, area, scale);
    apply_position(window, position_for_dock_center(edge, dock, area))?;
    Ok(WidgetPosition { placement, edge, offset, monitor_id: monitor.name().cloned() })
}

/// Restores the saved edge/offset on its monitor, or initializes right+0.
pub fn position_widget_window(app: &AppHandle) -> Result<WidgetPosition, String> {
    let window = app.get_webview_window("widget").ok_or_else(|| "widget window not found".to_string())?;
    let size = window_extent(&window)?;
    let saved = load_or_migrate_position(app)?.unwrap_or_default();
    let monitor = monitor_by_id(&window, saved.monitor_id.as_deref())?
        .or_else(|| current_monitor(&window).ok())
        .or_else(|| window.primary_monitor().ok().flatten())
        .ok_or_else(|| "no monitor available".to_string())?;
    let result = if let Some(layout) = remembered_layout(app)? {
        apply_dock_layout(&window, &monitor, saved.placement, layout)?
    } else {
        let normalized = normalized_for_monitor(&saved, &monitor, size);
        apply_edge_position(&window, &normalized, &monitor, size)?
    };
    save_position(app, &result)?;
    emit_position(app, &result);
    Ok(result)
}

#[tauri::command]
pub fn get_widget_position(app: AppHandle) -> Result<WidgetPosition, String> {
    let window = app.get_webview_window("widget").ok_or_else(|| "widget window not found".to_string())?;
    let size = window_extent(&window)?;
    let position = load_or_migrate_position(&app)?.unwrap_or_else(|| {
        let monitor = current_monitor(&window).ok();
        WidgetPosition { placement: NotchPlacement::RightCenter, edge: WidgetEdge::Right, offset: 0.0, monitor_id: monitor.and_then(|m| m.name().cloned()) }
    });
    let monitor = current_monitor(&window)?;
    let normalized = normalized_for_monitor(&position, &monitor, size);
    if normalized.offset != position.offset || normalized.monitor_id != position.monitor_id || normalized.placement != position.placement { save_position(&app, &normalized)?; }
    Ok(normalized)
}

/// Resizes the native canvas, then derives its position from edge+offset.
#[tauri::command]
pub fn update_widget_bounds(app: AppHandle, request: WidgetBoundsRequest) -> Result<WidgetPosition, String> {
    let window = app.get_webview_window("widget").ok_or_else(|| "widget window not found".to_string())?;
    let old_position = window_point(&window)?;
    let old_size = window_extent(&window)?;
    let saved = load_or_migrate_position(&app)?.unwrap_or_default();
    if request.edge != saved.edge {
        // A resize queued before a placement must not move the freshly
        // selected dock using the previous edge's DOM geometry.
        return Ok(saved);
    }
    let monitor = monitor_by_id(&window, saved.monitor_id.as_deref())?
        .or_else(|| monitor_for_rect(&window, old_position, old_size).ok())
        .ok_or_else(|| "no monitor available".to_string())?;
    let result = apply_dock_layout(&window, &monitor, saved.placement, request)?;
    remember_layout(&app, request)?;
    save_position(&app, &result)?;
    emit_position(&app, &result);
    Ok(result)
}

#[tauri::command]
pub fn set_widget_placement(app: AppHandle, request: PlacementRequest) -> Result<WidgetPosition, String> {
    let window = app.get_webview_window("widget").ok_or_else(|| "widget window not found".to_string())?;
    let size = window_extent(&window)?;
    let monitor = current_monitor(&window)?;
    let area = work_area(&monitor);
    let scale = monitor.scale_factor();
    let (edge, offset) = placement_edge_offset(request.placement, size, area, scale);
    let next = WidgetPosition { placement: request.placement, edge, offset, monitor_id: monitor.name().cloned() };
    let result = if let Some(layout) = remembered_layout(&app)? {
        apply_dock_layout(&window, &monitor, request.placement, layout)?
    } else {
        apply_edge_position(&window, &next, &monitor, size)?
    };
    save_position(&app, &result)?;
    emit_position(&app, &result);
    Ok(result)
}

#[tauri::command]
pub fn place_widget_from_pointer(app: AppHandle, request: PointerPositionRequest) -> Result<WidgetPosition, String> {
    let window = app.get_webview_window("widget").ok_or_else(|| "widget window not found".to_string())?;
    let point = Point { x: request.x, y: request.y };
    let monitor = monitor_for_rect(&window, point, Extent { width: 1, height: 1 })?;
    let Some(placement) = placement_from_pointer(point, work_area(&monitor), monitor.scale_factor()) else {
        return Ok(load_or_migrate_position(&app)?.unwrap_or_default());
    };
    let size = window_extent(&window)?;
    let area = work_area(&monitor);
    let scale = monitor.scale_factor();
    let (edge, offset) = placement_edge_offset(placement, size, area, scale);
    let next = WidgetPosition { placement, edge, offset, monitor_id: monitor.name().cloned() };
    // With a measured layout, React must first switch vertical/horizontal
    // orientation. Its next bounds update then resizes and snaps the notch in
    // one step; applying the old orientation here makes it visibly jump.
    let result = if remembered_layout(&app)?.is_some() {
        next
    } else {
        apply_edge_position(&window, &next, &monitor, size)?
    };
    save_position(&app, &result)?;
    emit_position(&app, &result);
    Ok(result)
}

#[tauri::command]
pub fn show_widget(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("widget") {
        position_widget_window(&app)?;
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn hide_widget(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("widget") { window.hide().map_err(|e| e.to_string())?; }
    Ok(())
}

#[cfg(windows)]
fn left_button_down() -> bool {
    #[link(name = "user32")]
    extern "system" { fn GetAsyncKeyState(key: i32) -> i16; }
    unsafe { (GetAsyncKeyState(0x01) as u16 & 0x8000) != 0 }
}

#[cfg(not(windows))]
fn left_button_down() -> bool { false }

/// O handle seleciona uma borda; o widget permanece parado até a soltura.
#[tauri::command]
pub fn begin_widget_placement(app: AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("widget").ok_or_else(|| "widget window not found".to_string())?;
    let monitor = current_monitor(&window)?;
    let start = app.cursor_position().map_err(|e| e.to_string())?;
    let current = load_or_migrate_position(&app)?.unwrap_or_default();
    super::placement_guides::show(&app, &monitor)?;
    let _ = app.emit("widget-placement-current", centered_placement(current.placement));
    std::thread::spawn(move || {
        let mut selected_monitor = monitor;
        let mut last = start;
        let mut last_target = None;
        let started = std::time::Instant::now();
        // Never leave the overlay or handle stuck if Windows misses a button-up.
        while left_button_down() && started.elapsed() < std::time::Duration::from_secs(30) {
            if let Ok(point) = app.cursor_position() {
                last = point;
                if let Ok(Some(next_monitor)) = window.monitor_from_point(point.x, point.y) {
                    if next_monitor.name() != selected_monitor.name() {
                        selected_monitor = next_monitor;
                        let _ = super::placement_guides::show(&app, &selected_monitor);
                        last_target = None;
                    }
                }
                let target = placement_from_pointer(
                    Point { x: point.x.round() as i32, y: point.y.round() as i32 },
                    work_area(&selected_monitor), selected_monitor.scale_factor(),
                );
                if target != last_target {
                    let _ = app.emit("widget-placement-target", target);
                    last_target = target;
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(16));
        }
        if let Ok(point) = app.cursor_position() { last = point; }
        super::placement_guides::hide(&app);
        // Um clique simples não reposiciona o widget.
        let dx = last.x - start.x;
        let dy = last.y - start.y;
        if dx * dx + dy * dy >= 100.0 {
            let _ = place_widget_from_pointer(app.clone(), PointerPositionRequest { x: last.x.round() as i32, y: last.y.round() as i32 });
        }
        let _ = app.emit("widget-placement-ended", ());
    });
    Ok(())
}

#[cfg(test)]
mod placement_tests {
    use super::*;
    #[test]
    fn pointer_selects_only_the_four_dashed_targets() {
        let area = WorkArea { left: -1920, top: 40, width: 1920, height: 1040 };
        assert_eq!(placement_from_pointer(Point { x: -1900, y: 560 }, area, 1.0), Some(NotchPlacement::LeftCenter));
        assert_eq!(placement_from_pointer(Point { x: -960, y: 42 }, area, 1.0), Some(NotchPlacement::TopCenter));
        assert_eq!(placement_from_pointer(Point { x: -960, y: 1078 }, area, 1.0), Some(NotchPlacement::BottomCenter));
        assert_eq!(placement_from_pointer(Point { x: -2, y: 560 }, area, 1.0), Some(NotchPlacement::RightCenter));
        assert_eq!(placement_from_pointer(Point { x: -960, y: 560 }, area, 1.0), None);
        assert_eq!(placement_from_pointer(Point { x: -1900, y: 50 }, area, 1.0), None);
    }
    #[test]
    fn all_new_placements_are_centered() {
        let area = WorkArea { left: 0, top: 0, width: 1920, height: 1040 };
        let size = Extent { width: 400, height: 300 };
        for placement in [NotchPlacement::LeftCenter, NotchPlacement::RightCenter, NotchPlacement::TopCenter, NotchPlacement::BottomCenter] {
            let (edge, offset) = placement_edge_offset(placement, size, area, 1.0);
            let (point, _) = position_from_edge_offset(edge, offset, size, area, 1.0);
            match edge {
                WidgetEdge::Left | WidgetEdge::Right => assert_eq!(point.y + size.height / 2, area.top + area.height / 2),
                WidgetEdge::Top | WidgetEdge::Bottom => assert_eq!(point.x + size.width / 2, area.left + area.width / 2),
            }
        }
    }
    #[test]
    fn old_corner_records_upgrade_to_their_edge_center() {
        assert_eq!(centered_placement(NotchPlacement::TopLeft), NotchPlacement::TopCenter);
        assert_eq!(centered_placement(NotchPlacement::TopRight), NotchPlacement::TopCenter);
        assert_eq!(centered_placement(NotchPlacement::BottomLeft), NotchPlacement::BottomCenter);
        assert_eq!(centered_placement(NotchPlacement::BottomRight), NotchPlacement::BottomCenter);
    }
}
