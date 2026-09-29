/**
 * Settings Service — camada entre UI e comandos Tauri de settings.
 */
import { invokeNative } from '@shared/services/tauriRuntime';

const settingsService = {
  async openSettings(): Promise<void> {
    return invokeNative('open_settings', undefined, () => undefined);
  },

  async closeSettings(): Promise<void> {
    return invokeNative('close_settings', undefined, () => undefined);
  },
};

export default settingsService;
