/**
 * System Service — startup e configurações de sistema.
 * README seção 41: somente services conhecem os comandos Tauri.
 */
import { invokeNative } from './tauriRuntime';

const systemService = {
  async enableStartup(): Promise<void> {
    return invokeNative<void>('enable_startup');
  },

  async disableStartup(): Promise<void> {
    return invokeNative<void>('disable_startup');
  },

  async isStartupEnabled(): Promise<boolean> {
    return invokeNative<boolean>('is_startup_enabled', undefined, () => false);
  },
};

export default systemService;
