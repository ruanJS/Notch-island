/**
 * Onboarding Service — completa o onboarding via Tauri.
 * README seção 41: somente services conhecem comandos Tauri.
 */
import { invokeNative } from '@shared/services/tauriRuntime';

const onboardingService = {
  async hasCompleted(): Promise<boolean> {
    return invokeNative<boolean>('has_completed_onboarding', undefined, () => localStorage.getItem('notchly:onboarding-complete') === 'true');
  },

  async complete(): Promise<void> {
    return invokeNative<void>('complete_onboarding', undefined, () => {
      localStorage.setItem('notchly:onboarding-complete', 'true');
    });
  },
};

export default onboardingService;
