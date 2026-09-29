/**
 * App.tsx — roteamento por janela Tauri.
 * README seção 5: separação por módulos (onboarding, widget, settings).
 * Cada label de janela Tauri renderiza um módulo diferente.
 */
import { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import OnboardingRouter from './router/OnboardingRouter';
import WidgetRoot from '@widget/components/WidgetRoot';
import PlacementGuides from '@widget/components/PlacementGuides';
import SettingsRoot from '@settings/screens/SettingsRoot';

type WindowLabel = 'onboarding' | 'widget' | 'settings' | 'placement';

export default function App() {
  const [label, setLabel] = useState<WindowLabel | null>(null);

  useEffect(() => {
    // Permite testar diretamente no navegador via ?window=widget ou #widget
    const urlParams = new URLSearchParams(window.location.search);
    const paramLabel = (urlParams.get('window') || window.location.hash.replace('#', '')) as WindowLabel;

    if (paramLabel && ['onboarding', 'widget', 'settings', 'placement'].includes(paramLabel)) {
      setLabel(paramLabel);
      return;
    }

    try {
      const win = getCurrentWindow();
      const currentLabel = win.label as WindowLabel;
      setLabel(currentLabel || 'onboarding');
    } catch {
      setLabel('onboarding');
    }
  }, []);

  if (!label) return null;

  if (label === 'widget') return <WidgetRoot />;
  if (label === 'placement') return <PlacementGuides />;
  if (label === 'settings') return <SettingsRoot />;
  return <OnboardingRouter />;
}
