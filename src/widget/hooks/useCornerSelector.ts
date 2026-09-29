import { useCallback, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { isNativeRuntime } from '@shared/services/tauriRuntime';
import widgetService from '../services/widgetService';

/** O handle só inicia a seleção; o cursor é acompanhado fora da janela pelo Rust. */
export function useCornerSelector() {
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (!isNativeRuntime()) return;
    let disposed = false;
    let unlisten: (() => void) | undefined;
    void listen('widget-placement-ended', () => setIsSelecting(false)).then((stop) => {
      if (disposed) stop();
      else unlisten = stop;
    });
    return () => { disposed = true; unlisten?.(); };
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || isSelecting) return;
    event.preventDefault();
    setIsSelecting(true);
    void widgetService.beginPlacement().catch((error) => {
      console.warn('Could not show placement guides:', error);
      setIsSelecting(false);
    });
  }, [isSelecting]);

  // A soltura fora do WebView continua sob responsabilidade do backend. Se
  // ocorrer sobre o botão, encerra também o estado visual imediatamente.
  const onPointerUp = useCallback(() => {
    setIsSelecting(false);
  }, []);
  // Leaving the tiny widget window may cancel its DOM pointer stream while
  // the physical mouse button is still held. Rust continues tracking it.
  const onPointerCancel = useCallback(() => {
    if (!isNativeRuntime()) setIsSelecting(false);
  }, []);

  return { isSelecting, onPointerDown, onPointerUp, onPointerCancel };
}
