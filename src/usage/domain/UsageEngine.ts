/**
 * UsageEngine — módulo de domínio independente de UI.
 * README seção 27: normalização, percentuais, remaining, cálculos de consumo.
 */
import type { UsageSnapshot } from '@providers/domain/types';

export interface UsageStats {
  percentage: number;         // 0–100
  remaining: number;          // unidades restantes
  remainingPercentage: number;
  isOverLimit: boolean;
}

/**
 * Calcula estatísticas de uso a partir de um snapshot.
 * Domínio puro — sem dependência de React, Tauri ou providers.
 */
export function computeUsageStats(snapshot: UsageSnapshot): UsageStats {
  const used  = snapshot.used  ?? 0;
  const limit = snapshot.limit ?? 0;

  if (limit === 0) {
    return {
      percentage: snapshot.percentage ?? 0,
      remaining: 0,
      remainingPercentage: 0,
      isOverLimit: false,
    };
  }

  const percentage        = Math.min((used / limit) * 100, 100);
  const remaining         = Math.max(limit - used, 0);
  const remainingPct      = 100 - percentage;
  const isOverLimit       = used > limit;

  return {
    percentage: Math.round(percentage),
    remaining,
    remainingPercentage: Math.round(remainingPct),
    isOverLimit,
  };
}

/**
 * Retorna a classe CSS de cor baseada no percentual.
 * README seção 20: estados Compact/Medium/Expanded.
 */
export function getUsageColorClass(percentage: number): string {
  if (percentage >= 90) return 'high';
  if (percentage >= 60) return 'mid';
  return 'low';
}

/**
 * Prediction Engine simplificado.
 * README seção 29: algoritmo determinístico.
 */
export function estimateDepletionMessage(
  percentage: number,
  resetAt?: Date,
): string | null {
  if (percentage < 50) return null;
  if (!resetAt) return null;

  const now     = Date.now();
  const resetMs = resetAt.getTime() - now;
  if (resetMs <= 0) return 'Período encerrado.';

  const remainingPct = 100 - percentage;
  if (remainingPct <= 0) return 'Limite atingido.';

  // Velocidade estimada: ms por ponto percentual já consumido
  const velocity = (now - resetAt.getTime() + resetMs) / percentage;
  const msToDepletion = velocity * remainingPct;

  const hours = Math.round(msToDepletion / 3_600_000);
  if (hours < 1) return 'Menos de 1 hora restante.';
  if (hours < 24) return `Estimativa: ${hours}h restantes.`;
  const days = Math.round(hours / 24);
  return `Estimativa: ${days} dias restantes.`;
}
