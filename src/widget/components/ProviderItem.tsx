/**
 * ProviderItem — Renderiza o medidor circular individual no dock vertical.
 * Design de referência: Anel de progresso circular colorido com ícone no centro
 * e porcentagem em destaque logo abaixo.
 */
import type { AIProvider, UsageSnapshot } from '@providers/domain/types';
import { ProviderIcon } from '@shared/components/AIIcons';

import { useAppStore } from '@app/store';

interface Props {
  provider: AIProvider;
  snapshot?: UsageSnapshot;
  index?: number;
  isActive?: boolean;
  onHover?: () => void;
  onClick?: () => void;
}

export default function ProviderItem({
  provider,
  snapshot,
  index = 0,
  isActive = false,
  onHover,
  onClick,
}: Props) {
  const { customRingColors } = useAppStore();
  const percentage = Math.min(100, Math.max(0, snapshot?.percentage ?? 0));

  // Anel de 44 px, próximo da proporção 44:70 do corpo do notch.
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Cor do anel personalizada ou original
  const ringColor = customRingColors[provider.id] || provider.color || '#ff7b3d';

  return (
    <button
      type="button"
      className={`dock-item ${isActive ? 'dock-item--active' : ''}`}
      id={`dock-provider-${provider.id}`}
      style={{ '--item-index': index } as React.CSSProperties}
      aria-label={`${provider.name}: ${provider.id === 'antigravity' ? '~0' : `${percentage}%`} de uso`}
      onMouseEnter={onHover}
      onClick={onClick}
    >
      <div className="dock-item__gauge-wrapper">
        <svg className="dock-item__svg" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#2a2a2a" />
          {/* Trilha de fundo */}
          <circle
            className="dock-item__track"
            cx="24"
            cy="24"
            r={radius}
            strokeWidth="4"
            fill="none"
          />
          {/* Anel de progresso */}
          <circle
            className="dock-item__progress"
            cx="24"
            cy="24"
            r={radius}
            strokeWidth="4"
            stroke={ringColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 24 24)"
          />
        </svg>

        {/* Ícone no centro do anel */}
        <div className="dock-item__icon-center">
          <ProviderIcon
            id={provider.id}
            size={20}
            color={provider.color}
          />
        </div>
      </div>

      {/* Porcentagem abaixo do anel */}
      <span className="dock-item__pct">{provider.id === 'antigravity' ? '~0' : `${percentage}%`}</span>
    </button>
  );
}
