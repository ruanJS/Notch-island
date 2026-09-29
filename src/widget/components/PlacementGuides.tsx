import './placement-guides.css';
import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { isNativeRuntime } from '@shared/services/tauriRuntime';
import type { NotchPlacement } from '../services/widgetService';

/** Apenas a silhueta das quatro posições; a escolha é feita no backend. */
export default function PlacementGuides() {
  const [target, setTarget] = useState<NotchPlacement | null>(null);
  const [current, setCurrent] = useState<NotchPlacement | null>(null);

  useEffect(() => {
    if (!isNativeRuntime()) return;
    let disposed = false;
    let unlistenTarget: (() => void) | undefined;
    let unlistenCurrent: (() => void) | undefined;
    void listen<NotchPlacement | null>('widget-placement-target', (event) => {
      setTarget(event.payload);
    }).then((stop) => {
      if (disposed) stop();
      else unlistenTarget = stop;
    });
    void listen<NotchPlacement>('widget-placement-current', (event) => {
      setCurrent(event.payload);
      setTarget(null);
    }).then((stop) => {
      if (disposed) stop();
      else unlistenCurrent = stop;
    });
    return () => { disposed = true; unlistenTarget?.(); unlistenCurrent?.(); };
  }, []);

  const zoneClass = (placement: NotchPlacement, edge: string) => [
    'placement-guides__zone',
    `placement-guides__zone--${edge}`,
    current === placement && 'placement-guides__zone--current',
    target === placement && 'placement-guides__zone--active',
  ].filter(Boolean).join(' ');

  return (
    <div className="placement-guides" aria-hidden="true">
      <div className={zoneClass('TOP_CENTER', 'top')} />
      <div className={zoneClass('RIGHT_CENTER', 'right')} />
      <div className={zoneClass('BOTTOM_CENTER', 'bottom')} />
      <div className={zoneClass('LEFT_CENTER', 'left')} />
    </div>
  );
}
