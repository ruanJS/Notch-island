use crate::platform::PlatformAdapter;

pub mod monitor;
pub mod startup;
pub mod window;

pub struct WindowsAdapter;

impl PlatformAdapter for WindowsAdapter {
    fn platform_name(&self) -> &'static str {
        "windows"
    }
}
