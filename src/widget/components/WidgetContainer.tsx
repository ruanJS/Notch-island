/**
 * WidgetContainer — Componente principal com inteligência de bordas,
 * auto-orientação (vertical nas laterais, horizontal no topo/baixo),
 * snap 0px integrado e rastreamento milimétrico da seta para a IA hovereada.
 */
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '@app/store';
import { providerService } from '@providers/services/providerService';
import ProviderItem from './ProviderItem';
import ProviderFlyout, {
  FLYOUT_H,
  FLYOUT_SIDE_GAP,
  FLYOUT_VERTICAL_GAP,
  FLYOUT_W,
  type FlyoutDirection,
} from './ProviderFlyout';
import ProximityCurve from './ProximityCurve';
import { useWidgetPosition } from '../hooks/useWidgetPosition';
import { useCornerSelector } from '../hooks/useCornerSelector';
import widgetService from '../services/widgetService';
import { Settings } from 'lucide-react';

// Outsets lógicos do maior shadow existente em cada direção. O máximo de
// 88px é somente a cauda inferior do flyout (28px de offset + 60px de blur).
// Esses valores ampliam o canvas transparente; não alteram o CSS visual.
const SHADOW_RENDER_OUTSETS_CSS_PX = {
  left: 72,
  right: 72,
  top: 72,
  bottom: 88,
} as const;
// Reserva a transição dos controles verticais (42 + margens/padding) sem
// redimensionar a janela a cada frame da animação de hover.
const VERTICAL_CONTROLS_RESERVE_PX = 76;
const HOVER_EXIT_DELAY_MS = 650;
// A janela só encolhe depois da transição visual de 580 ms do clip-path.
// Encolher antes recorta o dock aberto e expõe uma faixa retangular preta.
const COMPACT_BOUNDS_DELAY_MS = 640;
interface WidgetLayout {
  /** Offset lógico do wrapper DOM dentro do canvas nativo transparente. */
  left: number;
  top: number;
}

interface PendingBoundsUpdate {
  key: string;
  request: {
    edge: 'left' | 'right' | 'top' | 'bottom';
    width: number;
    height: number;
    dock_left: number;
    dock_top: number;
    dock_width: number;
    dock_height: number;
  };
}

export default function WidgetContainer() {
  const {
    selectedProviderIds,
    snapshots,
    setSnapshots,
    orientationMode,
    glassStyle,
    fontFamily,
    themePreset,
  } = useAppStore();

  const { position, syncPosition } = useWidgetPosition();
  const dockRef = useRef<HTMLDivElement | null>(null);
  const dockRestRef = useRef<HTMLButtonElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const lastBoundsKeyRef = useRef('');
  const pendingBoundsRef = useRef<PendingBoundsUpdate | null>(null);
  const boundsUpdateRunningRef = useRef(false);
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout>({
    left: SHADOW_RENDER_OUTSETS_CSS_PX.left,
    top: SHADOW_RENDER_OUTSETS_CSS_PX.top,
  });

  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [isDockEngaged, setIsDockEngaged] = useState(false);
  const [compactBoundsReady, setCompactBoundsReady] = useState(true);
  const [targetCenterOffset, setTargetCenterOffset] = useState<number>(56);
  const leaveTimeoutRef = useRef<number | null>(null);
  const wasSelectingRef = useRef(false);
  const { isSelecting, onPointerDown, onPointerUp, onPointerCancel } = useCornerSelector();

  useEffect(() => {
    if (isSelecting && leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (!isSelecting && wasSelectingRef.current) {
      setActiveProviderId(null);
      setIsDockEngaged(false);
    }
    wasSelectingRef.current = isSelecting;
  }, [isSelecting]);

  // Carrega snapshots de uso
  useEffect(() => {
    providerService.refreshAll().then(setSnapshots);
    const interval = setInterval(() => {
      providerService.refreshAll().then(setSnapshots);
    }, 30_000);
    return () => clearInterval(interval);
  }, [setSnapshots]);

  const allProviders = providerService.getProviders();
  const activeProviders = allProviders.filter((p) =>
    selectedProviderIds.includes(p.id),
  );

  // Determina orientação (vertical vs horizontal)
  let orientation: 'vertical' | 'horizontal' = 'vertical';
  const isHorizMode = orientationMode === 'horizontal';
  const isVertMode = orientationMode === 'vertical';

  if (isHorizMode) {
    orientation = 'horizontal';
  } else if (isVertMode) {
    orientation = 'vertical';
  } else {
    orientation = position.edge === 'top' || position.edge === 'bottom'
      ? 'horizontal'
      : 'vertical';
  }

  // Direção do flyout para apontar sempre para DENTRO da tela
  let flyoutDirection: FlyoutDirection = 'left';
  if (orientation === 'vertical') {
    const isRightAnchored = position.edge !== 'left';
    flyoutDirection = isRightAnchored ? 'left' : 'right';
  } else {
    flyoutDirection = position.edge === 'bottom' ? 'top' : 'bottom';
  }

  // Atualiza o ponto focal da seta para apontar exatamente para a IA hovereada
  const updateArrowTarget = useCallback(
    (id: string) => {
      if (!dockRef.current) return;
      const itemEl = dockRef.current.querySelector<HTMLElement>(`#dock-provider-${id}`);
      if (!itemEl) return;

      const dockRect = dockRef.current.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      if (orientation === 'vertical') {
        const centerY = itemRect.top + itemRect.height / 2 - dockRect.top;
        setTargetCenterOffset(centerY);
      } else {
        const centerX = itemRect.left + itemRect.width / 2 - dockRect.left;
        setTargetCenterOffset(centerX);
      }
    },
    [orientation],
  );

  // Provider ativo no hover/click
  const currentProviderId = activeProviderId;
  const activeProvider = activeProviders.find((p) => p.id === currentProviderId) ?? null;
  const activeSnapshot = activeProvider ? snapshots.find((s) => s.providerId === activeProvider.id) : undefined;
  const isResting = !isDockEngaged && !activeProvider && !isSelecting;

  useEffect(() => {
    if (!isResting) {
      setCompactBoundsReady(false);
      return;
    }
    if (compactBoundsReady) return;
    const timer = window.setTimeout(() => setCompactBoundsReady(true), COMPACT_BOUNDS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isResting, compactBoundsReady]);

  useEffect(() => () => {
    if (leaveTimeoutRef.current !== null) window.clearTimeout(leaveTimeoutRef.current);
  }, []);

  // Serializa e combina pedidos rápidos de hover. Nunca existem dois invokes
  // concorrentes executando set_size/set_position no backend.
  const flushBoundsUpdates = useCallback(async () => {
    if (boundsUpdateRunningRef.current) return;
    boundsUpdateRunningRef.current = true;
    try {
      while (pendingBoundsRef.current) {
        const update = pendingBoundsRef.current;
        pendingBoundsRef.current = null;
        try {
          const nativePosition = await widgetService.updateBounds(update.request);
          syncPosition(nativePosition);
        } catch (error) {
          if (lastBoundsKeyRef.current === update.key) lastBoundsKeyRef.current = '';
          console.warn('Could not update native widget bounds:', error);
        }
      }
    } finally {
      boundsUpdateRunningRef.current = false;
    }
  }, [syncPosition]);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const dock = dockRef.current;
      if (!dock) return;

      // Em repouso, a janela nativa deve conter somente a pequena aba do
      // notch. Isso evita que a camada transparente (tooltip/flyout) reserve
      // uma área grande da tela e também mantém o hitbox exatamente na borda.
      const compact = isResting && compactBoundsReady && !isSelecting && Boolean(dockRestRef.current);
      const anchor = compact ? dockRestRef.current! : dock;

      if (compact) {
        const compactWidth = Math.max(1, anchor.offsetWidth);
        const compactHeight = Math.max(1, anchor.offsetHeight);
        // offsetLeft/Top ignoram o `translate` que centraliza a aba. Medir o
        // retângulo renderizado evita recortar metade dela no topo/rodapé ou
        // deslocá-la verticalmente nas laterais.
        const anchorRect = anchor.getBoundingClientRect();
        const wrapperRect = anchor.parentElement!.getBoundingClientRect();
        const nextLayout = {
          left: wrapperRect.left - anchorRect.left,
          top: wrapperRect.top - anchorRect.top,
        };
        setWidgetLayout((current) => (
          current.left === nextLayout.left && current.top === nextLayout.top ? current : nextLayout
        ));

        const dockInCanvas = {
          dock_left: 0,
          dock_top: 0,
          dock_width: compactWidth,
          dock_height: compactHeight,
        };
        const boundsKey = `${position.monitor_id ?? 'unknown'}:${position.edge}:compact:${compactWidth}x${compactHeight}`;
        if (lastBoundsKeyRef.current === boundsKey) return;
        lastBoundsKeyRef.current = boundsKey;
        pendingBoundsRef.current = {
          key: boundsKey,
          request: { edge: position.edge, width: compactWidth, height: compactHeight, ...dockInCanvas },
        };
        void flushBoundsUpdates();
        return;
      }

      // Reserva o percurso inteiro do tooltip uma única vez. O card pode
      // apontar para qualquer IA sem redimensionar/mover a janela nativa.
      // offset* ignora o scale transitório da animação do dock.
      let domHullLeftCssPx = dock.offsetLeft;
      let domHullTopCssPx = dock.offsetTop;
      let domHullRightCssPx = dock.offsetLeft + dock.offsetWidth;
      let domHullBottomCssPx = dock.offsetTop + dock.offsetHeight;
      if (orientation === 'vertical') {
        const flyoutLeft = flyoutDirection === 'left'
          ? dock.offsetLeft - FLYOUT_SIDE_GAP - FLYOUT_W
          : domHullRightCssPx + FLYOUT_SIDE_GAP;
        domHullLeftCssPx = Math.min(domHullLeftCssPx, flyoutLeft);
        domHullRightCssPx = Math.max(domHullRightCssPx, flyoutLeft + FLYOUT_W);
        domHullTopCssPx -= FLYOUT_H / 2;
        domHullBottomCssPx += FLYOUT_H / 2;
      } else {
        const flyoutTop = flyoutDirection === 'top'
          ? dock.offsetTop - FLYOUT_VERTICAL_GAP - FLYOUT_H
          : domHullBottomCssPx + FLYOUT_VERTICAL_GAP;
        domHullTopCssPx = Math.min(domHullTopCssPx, flyoutTop);
        domHullBottomCssPx = Math.max(domHullBottomCssPx, flyoutTop + FLYOUT_H);
        domHullLeftCssPx -= FLYOUT_W / 2;
        domHullRightCssPx += FLYOUT_W / 2;
      }

      // No lado ancorado o inset é zero: a borda visual coincide com a borda
      // da janela. A reserva de shadow existe somente nos lados voltados para
      // dentro da tela, portanto não cria um recuo visual de 88px.
      const shadowInsetsCssPx = {
        left: position.edge === 'left' ? 0 : SHADOW_RENDER_OUTSETS_CSS_PX.left,
        right: position.edge === 'right' ? 0 : SHADOW_RENDER_OUTSETS_CSS_PX.right,
        top: position.edge === 'top' ? 0 : SHADOW_RENDER_OUTSETS_CSS_PX.top,
        bottom: position.edge === 'bottom' ? 0 : SHADOW_RENDER_OUTSETS_CSS_PX.bottom,
      };
      const nextLayout = {
        left: Math.ceil(shadowInsetsCssPx.left - domHullLeftCssPx),
        top: Math.ceil(shadowInsetsCssPx.top - domHullTopCssPx),
      };
      setWidgetLayout((current) => (
        current.left === nextLayout.left && current.top === nextLayout.top ? current : nextLayout
      ));

      const nativeCanvasWidthCssPx = Math.ceil(
        domHullRightCssPx - domHullLeftCssPx
        + shadowInsetsCssPx.left + shadowInsetsCssPx.right,
      );
      const nativeCanvasHeightCssPx = Math.ceil(
        domHullBottomCssPx - domHullTopCssPx
        + shadowInsetsCssPx.top + shadowInsetsCssPx.bottom
        + (orientation === 'vertical' ? VERTICAL_CONTROLS_RESERVE_PX : 0),
      );
      const dockInCanvas = {
        dock_left: nextLayout.left + dock.offsetLeft,
        dock_top: nextLayout.top + dock.offsetTop,
        dock_width: dock.offsetWidth,
        dock_height: dock.offsetHeight,
      };
      const boundsKey = `${position.monitor_id ?? 'unknown'}:${position.edge}:${nativeCanvasWidthCssPx}x${nativeCanvasHeightCssPx}:${Object.values(dockInCanvas).join(',')}`;
      if (lastBoundsKeyRef.current === boundsKey) return;
      lastBoundsKeyRef.current = boundsKey;

      pendingBoundsRef.current = {
        key: boundsKey,
        request: { edge: position.edge, width: nativeCanvasWidthCssPx, height: nativeCanvasHeightCssPx, ...dockInCanvas },
      };
      void flushBoundsUpdates();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    activeProviders.length,
    flyoutDirection,
    flushBoundsUpdates,
    fontFamily,
    orientation,
    position.edge,
    position.monitor_id,
    syncPosition,
    themePreset,
    isResting,
    compactBoundsReady,
    isSelecting,
  ]);

  const handleProviderHover = (id: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setActiveProviderId(id);
    updateArrowTarget(id);
  };

  const handleProviderClick = (id: string) => {
    setIsDockEngaged(true);
    setActiveProviderId((prev) => {
      const next = prev === id ? null : id;
      if (next) updateArrowTarget(next);
      return next;
    });
  };

  const handleContainerMouseLeave = () => {
    if (isSelecting) return;
    if (leaveTimeoutRef.current !== null) window.clearTimeout(leaveTimeoutRef.current);
    leaveTimeoutRef.current = window.setTimeout(() => {
      leaveTimeoutRef.current = null;
      setActiveProviderId(null);
      setIsDockEngaged(false);
    }, HOVER_EXIT_DELAY_MS);
  };

  const handleContainerMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsDockEngaged(true);
  };

  // Detecção de snap nas 4 bordas (efeito bezel/notch integrado somente quando encostado)
  // Considera encostado na borda apenas quando estiver rente (<= 4px)
  const isSnappedLeft = orientation === 'vertical' && position.edge === 'left';
  const isSnappedRight = orientation === 'vertical' && position.edge === 'right';
  const isSnappedTop = orientation === 'horizontal' && position.edge === 'top';
  const isSnappedBottom = orientation === 'horizontal' && position.edge === 'bottom';

  let snappedClass = '';
  if (isSnappedLeft) snappedClass = 'widget-dock--snapped-left';
  else if (isSnappedRight) snappedClass = 'widget-dock--snapped-right';
  else if (isSnappedTop) snappedClass = 'widget-dock--snapped-top';
  else if (isSnappedBottom) snappedClass = 'widget-dock--snapped-bottom';

  return (
    <>
      <div
        className={`widget-wrapper widget-wrapper--${orientation} ${activeProvider ? 'widget-wrapper--expanded' : 'widget-wrapper--compact'} widget-wrapper--glass-${glassStyle} widget-wrapper--font-${fontFamily} widget-wrapper--theme-${themePreset}`}
        data-edge={position.edge}
        data-resting={isResting}
        style={{ left: widgetLayout.left, top: widgetLayout.top }}
        // No repouso, o wrapper transparente cobre o canvas nativo inteiro e
        // não pode abrir o dock ao ser apenas atravessado pelo cursor. Depois
        // de aberto, ele volta a receber os eventos para manter o flyout vivo.
        onMouseLeave={isResting ? undefined : handleContainerMouseLeave}
        onMouseEnter={isResting ? undefined : handleContainerMouseEnter}
      >
        {/* Flyout Card (adaptativo em 4 direções, com seta milimétrica e seguro na tela) */}
        {activeProvider && (
          <ProviderFlyout
            key={activeProvider.id}
            provider={activeProvider}
            snapshot={activeSnapshot}
            direction={flyoutDirection}
            targetCenterOffset={targetCenterOffset}
            flyoutRef={flyoutRef}
          />
        )}

        {/* Dock Flutuante (Vertical ou Horizontal) */}
        <div
          ref={dockRef}
          className={`widget-dock widget-dock--${orientation} ${snappedClass} ${isResting ? 'widget-dock--resting' : 'widget-dock--engaged'}`}
          onMouseEnter={handleContainerMouseEnter}
        >
          {/* Lista de Medidores Circulares */}
          <div className={`dock-items dock-items--${orientation}`}>
            {activeProviders.map((provider, index) => {
              const snapshot = snapshots.find((s) => s.providerId === provider.id);
              const isActive = provider.id === currentProviderId;
              return (
                <ProviderItem
                  key={provider.id}
                  provider={provider}
                  snapshot={snapshot}
                  isActive={isActive}
                  index={index}
                  onHover={() => handleProviderHover(provider.id)}
                  onClick={() => handleProviderClick(provider.id)}
                />
              );
            })}
          </div>

        </div>
        <button
          type="button"
          ref={dockRestRef}
          className="widget-dock-rest"
          aria-label="Expandir o Notch Island"
          tabIndex={isResting ? 0 : -1}
          onMouseEnter={handleContainerMouseEnter}
          onFocus={handleContainerMouseEnter}
          onClick={handleContainerMouseEnter}
        />
        <ProximityCurve
          orientation={orientation}
          isDragging={isSelecting}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        />
        <button
            type="button"
            className="widget-settings-button"
            aria-label="Abrir configurações"
            title="Configurações"
            onMouseEnter={handleContainerMouseEnter}
            onClick={() => { void widgetService.openSettings(); }}
          >
            <svg className="widget-settings-button__arc" viewBox="-36 -36 72 72" aria-hidden="true">
              <circle r="28.5" fill="none" stroke="#2e2e2e" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="44.77 179.07" />
            </svg>
            <span className="widget-settings-button__disc" aria-hidden="true"><Settings size={21} strokeWidth={2.4} /></span>
        </button>
      </div>
    </>
  );
}
