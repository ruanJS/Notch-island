/**
 * Tipos do domínio de providers.
 * README seção 24 — interface AIProvider
 * README seção 25 — interface UsageSnapshot
 */

// ─── Provider ────────────────────────────────────────────────

export interface AIProvider {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  fetchUsage(): Promise<UsageSnapshot>;
  fetchLimits(): Promise<UsageLimit[]>;
}

// ─── Usage Snapshot ──────────────────────────────────────────

export type UsagePeriod =
  | 'session'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export interface UsageSnapshot {
  providerId: string;

  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;

  used?: number;
  limit?: number;

  percentage?: number;

  period: UsagePeriod;

  resetAt?: Date;

  sessionPercentage?: number;
  sessionResetIn?: string;
  allModelsPercentage?: number;
  allModelsResetAt?: string;

  estimatedCost?: number;

  updatedAt: Date;
}

export interface UsageLimit {
  providerId: string;
  period: UsagePeriod;
  limit: number;
  unit: 'tokens' | 'requests' | 'cost';
}

// ─── Provider Info (metadados de exibição) ────────────────────

export interface ProviderInfo {
  id: string;
  name: string;
  icon?: string;
  color: string;
  enabled: boolean;
}
