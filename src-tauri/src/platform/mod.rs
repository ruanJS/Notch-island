/// Platform abstraction layer.
/// README seção 4: separação explícita de plataforma.
/// Windows implementado agora; macOS preparado para fase futura (seção 50).
pub mod windows;

pub trait PlatformAdapter: Send + Sync {
    fn platform_name(&self) -> &'static str;
}

#[cfg(target_os = "windows")]
pub fn create_adapter() -> impl PlatformAdapter {
    windows::WindowsAdapter
}
