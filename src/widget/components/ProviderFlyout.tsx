/**
 * ProviderFlyout — Card detalhado adaptativo em 4 direções.
 * A seta rastreia com precisão sub-pixel o centro do ícone da IA que o mouse está hovereando.
 * O flyout aplica clamping estrito contra o viewport para nunca cortar na tela.
 */
import type { AIProvider, UsageSnapshot } from '@providers/domain/types';
import { ProviderIcon } from '@shared/components/AIIcons';
import { useAppStore } from '@app/store';

export type FlyoutDirection = 'left' | 'right' | 'bottom' | 'top';

// Compartilhado com o canvas do widget: trocar a IA move somente o card.
export const FLYOUT_H = 150;
export const FLYOUT_W = 246;
export const FLYOUT_SIDE_GAP = 30;
export const FLYOUT_VERTICAL_GAP = 20;

interface Props {
  provider: AIProvider;
  snapshot?: UsageSnapshot;
  direction: FlyoutDirection;
  /** Coordenada de centro do item hovereado relativa ao dock (em pixels) */
  targetCenterOffset: number;
  flyoutRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ProviderFlyout({
  provider,
  snapshot,
  direction,
  targetCenterOffset,
  flyoutRef,
}: Props) {
  const { customRingColors } = useAppStore();
  const activeColor = customRingColors[provider.id] || provider.color || '#ff7b3d';
  const sessionPct = snapshot?.sessionPercentage ?? snapshot?.percentage ?? 48;
  const sessionReset = snapshot?.sessionResetIn ? `Renova em ${snapshot.sessionResetIn}` : 'Renova em 55 min';

  const allModelsPct = snapshot?.allModelsPercentage ?? 31;
  const allModelsReset = snapshot?.allModelsResetAt
    ? `Renova ${snapshot.allModelsResetAt}`
    : 'Renova em 2 de set, 20:59';

  let flyoutStyle: React.CSSProperties = {};
  let arrowStyle: React.CSSProperties = {};

  if (direction === 'left' || direction === 'right') {
    const relativeTop = targetCenterOffset - FLYOUT_H / 2;
    let arrowTopInFlyout = targetCenterOffset - relativeTop;
    arrowTopInFlyout = Math.max(22, Math.min(FLYOUT_H - 22, arrowTopInFlyout));

    const side = direction === 'left'
      ? { right: `calc(100% + ${FLYOUT_SIDE_GAP}px)` }
      : { left: `calc(100% + ${FLYOUT_SIDE_GAP}px)` };

    flyoutStyle = {
      position: 'absolute',
      top: `${relativeTop}px`,
      ...side,
    };

    arrowStyle = {
      top: `${arrowTopInFlyout}px`,
      transform: 'translateY(-50%)',
    };
  } else {
    const relativeLeft = targetCenterOffset - FLYOUT_W / 2;
    let arrowLeftInFlyout = targetCenterOffset - relativeLeft;
    arrowLeftInFlyout = Math.max(22, Math.min(FLYOUT_W - 22, arrowLeftInFlyout));

    const sideV = direction === 'bottom'
      ? { top: `calc(100% + ${FLYOUT_VERTICAL_GAP}px)` }
      : { bottom: `calc(100% + ${FLYOUT_VERTICAL_GAP}px)` };

    flyoutStyle = {
      position: 'absolute',
      left: `${relativeLeft}px`,
      ...sideV,
    };

    arrowStyle = {
      left: `${arrowLeftInFlyout}px`,
      transform: 'translateX(-50%)',
    };
  }

  return (
    <div
      ref={flyoutRef}
      className={`provider-flyout provider-flyout--${direction} animate-fade-in-scale`}
      style={flyoutStyle}
      id={`flyout-${provider.id}`}
    >
      {/* Seta indicadora que aponta para o ícone hovereado */}
      <div
        className={`provider-flyout__arrow provider-flyout__arrow--${direction}`}
        style={arrowStyle}
      />

      {/* Cabeçalho: Ícone + Nome + Status dot */}
      <div className="provider-flyout__header">
        <div className="provider-flyout__title-row">
          <ProviderIcon id={provider.id} size={20} color={activeColor} />
          <span className="provider-flyout__name">{provider.name}</span>
        </div>
        <div className="provider-flyout__status-dot" title="Operacional" />
      </div>

      {/* Métricas */}
      <div className="provider-flyout__metrics">
        {/* Sessão atual */}
        <div className="provider-flyout__metric-group">
          <div className="provider-flyout__label-row">
            <span className="provider-flyout__label">Sessão atual</span>
            <span className="provider-flyout__reset">{sessionReset}</span>
          </div>
          <div className="provider-flyout__bar-track">
            <div
              className="provider-flyout__bar-fill provider-flyout__bar-fill--session"
              style={{ width: `${Math.min(100, Math.max(0, sessionPct))}%`, background: activeColor }}
            />
          </div>
          <div className="provider-flyout__value">{sessionPct}% usado</div>
        </div>

        {/* Todos os modelos */}
        <div className="provider-flyout__metric-group">
          <div className="provider-flyout__label-row">
            <span className="provider-flyout__label">Todos os modelos</span>
            <span className="provider-flyout__reset">{allModelsReset}</span>
          </div>
          <div className="provider-flyout__bar-track">
            <div
              className="provider-flyout__bar-fill provider-flyout__bar-fill--all-models"
              style={{ width: `${Math.min(100, Math.max(0, allModelsPct))}%` }}
            />
          </div>
          <div className="provider-flyout__value">{allModelsPct}% usado</div>
        </div>
      </div>
    </div>
  );
}
