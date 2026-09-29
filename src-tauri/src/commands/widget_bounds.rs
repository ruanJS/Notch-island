use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WidgetEdge { Left, Right, Top, Bottom }

impl Default for WidgetEdge { fn default() -> Self { Self::Right } }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Point { pub x: i32, pub y: i32 }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Extent { pub width: i32, pub height: i32 }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct DockRect { pub left: i32, pub top: i32, pub width: i32, pub height: i32 }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct WorkArea { pub left: i32, pub top: i32, pub width: i32, pub height: i32 }

impl WorkArea {
    pub fn right(self) -> i32 { self.left + self.width }
    pub fn bottom(self) -> i32 { self.top + self.height }
}

/// Shadow is rendered inside the transparent native canvas. No visual inset is
/// added between the content edge and the monitor work area.
pub const SCREEN_MARGIN_LOGICAL: f64 = 0.0;

pub fn physical(logical: f64, scale_factor: f64) -> i32 {
    (logical.max(0.0) * scale_factor).round() as i32
}

pub fn constrain_size(requested: Extent, work_area: WorkArea, margin: i32) -> Extent {
    let available_width = (work_area.width - margin.saturating_mul(2)).max(1);
    let available_height = (work_area.height - margin.saturating_mul(2)).max(1);
    Extent {
        width: requested.width.clamp(1, available_width),
        height: requested.height.clamp(1, available_height),
    }
}

pub fn max_offset_logical(edge: WidgetEdge, size: Extent, area: WorkArea, scale: f64) -> f64 {
    let physical_axis = match edge {
        WidgetEdge::Left | WidgetEdge::Right => area.height - size.height,
        WidgetEdge::Top | WidgetEdge::Bottom => area.width - size.width,
    };
    (physical_axis.max(0) as f64 / scale.max(f64::EPSILON)).max(0.0)
}

pub fn clamp_offset_logical(edge: WidgetEdge, offset: f64, size: Extent, area: WorkArea, scale: f64) -> f64 {
    offset.clamp(0.0, max_offset_logical(edge, size, area, scale))
}

/// Converts the canonical edge+logical offset into the physical position of
/// the entire native transparent window (not just its DOM or flyout).
pub fn position_from_edge_offset(edge: WidgetEdge, offset: f64, size: Extent, area: WorkArea, scale: f64) -> (Point, f64) {
    let normalized = clamp_offset_logical(edge, offset, size, area, scale);
    let axis = physical(normalized, scale);
    let position = match edge {
        WidgetEdge::Left => Point { x: area.left, y: area.top + axis },
        WidgetEdge::Right => Point { x: area.right() - size.width, y: area.top + axis },
        WidgetEdge::Top => Point { x: area.left + axis, y: area.top },
        WidgetEdge::Bottom => Point { x: area.left + axis, y: area.bottom() - size.height },
    };
    (position, normalized)
}

/// Anchors the visible dock, not the transparent WebView canvas. A tooltip can
/// enlarge that canvas without moving the notch by a pixel.
pub fn position_for_dock_center(edge: WidgetEdge, dock: DockRect, area: WorkArea) -> Point {
    let dock_center_x = dock.left + dock.width / 2;
    let dock_center_y = dock.top + dock.height / 2;
    match edge {
        WidgetEdge::Left => Point { x: area.left - dock.left, y: area.top + area.height / 2 - dock_center_y },
        WidgetEdge::Right => Point { x: area.right() - dock.left - dock.width, y: area.top + area.height / 2 - dock_center_y },
        WidgetEdge::Top => Point { x: area.left + area.width / 2 - dock_center_x, y: area.top - dock.top },
        WidgetEdge::Bottom => Point { x: area.left + area.width / 2 - dock_center_x, y: area.bottom() - dock.top - dock.height },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    const WORK: WorkArea = WorkArea { left: -1920, top: -200, width: 1920, height: 1040 };

    fn assert_inside(position: Point, size: Extent, area: WorkArea) {
        assert!(position.x >= area.left);
        assert!(position.y >= area.top);
        assert!(position.x + size.width <= area.right());
        assert!(position.y + size.height <= area.bottom());
    }

    #[test]
    fn every_edge_clamps_zero_max_negative_and_oversized_offsets() {
        let size = Extent { width: 400, height: 300 };
        for edge in [WidgetEdge::Left, WidgetEdge::Right, WidgetEdge::Top, WidgetEdge::Bottom] {
            let max = max_offset_logical(edge, size, WORK, 1.0);
            assert_eq!(position_from_edge_offset(edge, 0.0, size, WORK, 1.0).1, 0.0);
            assert_eq!(position_from_edge_offset(edge, -20.0, size, WORK, 1.0).1, 0.0);
            assert_eq!(position_from_edge_offset(edge, max + 20.0, size, WORK, 1.0).1, max);
            let (position, _) = position_from_edge_offset(edge, max, size, WORK, 1.0);
            assert_inside(position, size, WORK);
        }
    }

    #[test]
    fn edge_positions_touch_requested_work_area_side() {
        let size = Extent { width: 400, height: 300 };
        let (left, _) = position_from_edge_offset(WidgetEdge::Left, 120.0, size, WORK, 1.0);
        let (right, _) = position_from_edge_offset(WidgetEdge::Right, 120.0, size, WORK, 1.0);
        let (top, _) = position_from_edge_offset(WidgetEdge::Top, 120.0, size, WORK, 1.0);
        let (bottom, _) = position_from_edge_offset(WidgetEdge::Bottom, 120.0, size, WORK, 1.0);
        assert_eq!(left.x, WORK.left);
        assert_eq!(right.x + size.width, WORK.right());
        assert_eq!(top.y, WORK.top);
        assert_eq!(bottom.y + size.height, WORK.bottom());
    }

    #[test]
    fn oversized_widget_is_reduced_to_work_area() {
        assert_eq!(constrain_size(Extent { width: 5000, height: 4000 }, WORK, 0), Extent { width: 1920, height: 1040 });
    }

    #[test]
    fn negative_virtual_monitor_coordinates_are_preserved() {
        let size = Extent { width: 300, height: 120 };
        let (position, _) = position_from_edge_offset(WidgetEdge::Left, 0.0, size, WORK, 1.0);
        assert_eq!(position, Point { x: -1920, y: -200 });
    }

    #[test]
    fn dpi_uses_one_conversion_without_magic_divisors() {
        for (scale, expected) in [(1.0, 100), (1.25, 125), (1.5, 150), (1.75, 175), (2.0, 200)] {
            assert_eq!(physical(100.0, scale), expected);
            let size = Extent { width: 200, height: 100 };
            let (position, offset) = position_from_edge_offset(WidgetEdge::Left, 100.0, size, WORK, scale);
            assert_eq!(position.y, WORK.top + expected);
            assert_eq!(offset, 100.0);
        }
    }

    #[test]
    fn expansion_cycle_preserves_edge_and_offset() {
        let area = WorkArea { left: 100, top: 50, width: 1920, height: 1040 };
        for edge in [WidgetEdge::Left, WidgetEdge::Right, WidgetEdge::Top, WidgetEdge::Bottom] {
            let compact = Extent { width: 160, height: 120 };
            let expanded = Extent { width: 600, height: 420 };
            let (_, compact_offset) = position_from_edge_offset(edge, 240.0, compact, area, 1.0);
            let (expanded_position, expanded_offset) = position_from_edge_offset(edge, compact_offset, expanded, area, 1.0);
            let (_, collapsed_offset) = position_from_edge_offset(edge, expanded_offset, compact, area, 1.0);
            let (expanded_again, _) = position_from_edge_offset(edge, collapsed_offset, expanded, area, 1.0);
            assert_eq!(expanded_position, expanded_again);
        }
    }

    #[test]
    fn different_monitor_layouts_remain_inside_work_area() {
        let monitors = [
            WorkArea { left: 0, top: 0, width: 1920, height: 1040 },
            WorkArea { left: -2560, top: 180, width: 2560, height: 1400 },
            WorkArea { left: 480, top: -1440, width: 2560, height: 1440 },
        ];
        let size = Extent { width: 476, height: 480 };
        for area in monitors {
            for edge in [WidgetEdge::Left, WidgetEdge::Right, WidgetEdge::Top, WidgetEdge::Bottom] {
                let (position, _) = position_from_edge_offset(edge, f64::MAX, size, area, 1.5);
                assert_inside(position, size, area);
            }
        }
    }

    #[test]
    fn tooltip_canvas_growth_does_not_move_dock_on_any_edge() {
        let area = WorkArea { left: -1920, top: 40, width: 1920, height: 1040 };
        let small = DockRect { left: 72, top: 72, width: 70, height: 350 };
        let with_tooltip = DockRect { left: 348, top: 132, ..small };
        for edge in [WidgetEdge::Left, WidgetEdge::Right, WidgetEdge::Top, WidgetEdge::Bottom] {
            let original = position_for_dock_center(edge, small, area);
            let expanded = position_for_dock_center(edge, with_tooltip, area);
            assert_eq!(original.x + small.left, expanded.x + with_tooltip.left);
            assert_eq!(original.y + small.top, expanded.y + with_tooltip.top);
        }
    }
}
