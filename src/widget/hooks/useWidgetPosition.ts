/**
 * useWidgetPosition — Hook para carregar e salvar a posição do widget.
 */
import { useCallback, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { isNativeRuntime } from '@shared/services/tauriRuntime';
import widgetService, { type WidgetPosition } from '../services/widgetService';

export function useWidgetPosition() {
  const [position, setPosition] = useState<WidgetPosition>({
    placement: 'RIGHT_CENTER',
    monitor_id: null,
    edge: 'right',
    offset: 0,
  });

  useEffect(() => {
    widgetService
      .getPosition()
      .then((pos) => {
        if (pos && typeof pos.offset === 'number' && typeof pos.edge === 'string') setPosition(pos);
        window.localStorage.setItem('notchly:widget-layout', 'native-edge-offset-v1');
      })
      .catch((err) => {
        console.warn('Fallback widget position:', err);
      });
  }, []);

  useEffect(() => {
    if (!isNativeRuntime()) return undefined;
    let dispose: (() => void) | undefined;
    void listen<WidgetPosition>('widget-position-changed', (event) => {
      if (event.payload && typeof event.payload.offset === 'number') setPosition(event.payload);
    }).then((unlisten) => { dispose = unlisten; });
    return () => dispose?.();
  }, []);

  // Atualiza somente o estado React quando a posição já foi aplicada e
  // persistida pelo backend (resize, show ou drag).
  const syncPosition = useCallback((nativePosition: WidgetPosition) => {
    setPosition(nativePosition);
  }, []);

  return { position, syncPosition };
}
