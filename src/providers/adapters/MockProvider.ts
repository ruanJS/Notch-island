/**
 * Mock Provider — dados estáticos para o MVP.
 * README seção 47: Claude 48%, ChatGPT 22%, Cursor 16%.
 */
import type { AIProvider, UsageLimit, UsageSnapshot } from '../domain/types';

export class MockProvider implements AIProvider {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly color: string,
    private readonly mockPercentage: number,
    private readonly mockUsed: number,
    private readonly mockLimit: number,
    private readonly sessionPercentage?: number,
    private readonly sessionResetIn: string = '55 min',
    private readonly allModelsPercentage?: number,
    private readonly allModelsResetAt: string = 'Wed, 2 Sep at 20:59',
  ) {}

  async fetchUsage(): Promise<UsageSnapshot> {
    return {
      providerId: this.id,
      used: this.mockUsed,
      limit: this.mockLimit,
      percentage: this.mockPercentage,
      period: 'monthly',
      sessionPercentage: this.sessionPercentage ?? this.mockPercentage,
      sessionResetIn: this.sessionResetIn,
      allModelsPercentage: this.allModelsPercentage ?? Math.max(10, Math.round(this.mockPercentage * 0.65)),
      allModelsResetAt: this.allModelsResetAt,
      updatedAt: new Date(),
    };
  }

  async fetchLimits(): Promise<UsageLimit[]> {
    return [
      {
        providerId: this.id,
        period: 'monthly',
        limit: this.mockLimit,
        unit: 'tokens',
      },
    ];
  }
}

/** Lista de providers mockados para o MVP */
export const MOCK_PROVIDERS: AIProvider[] = [
  new MockProvider('claude',  'Claude',  '#ff7b3d', 48, 4_800_000, 10_000_000, 48, '55 min', 31, '2 set. · 20:59'),
  new MockProvider('chatgpt', 'ChatGPT', '#2ee6a6', 22, 2_200_000, 10_000_000, 22, '2h 15 min', 18, '4 set. · 18:00'),
  new MockProvider('cursor',  'Cursor',  '#dfff3f', 16, 8_400_000, 20_000_000, 16, '3h 40 min', 12, '7 set. · 00:00'),
  new MockProvider('gemini',  'Gemini',  '#4e8cff', 28, 2_800_000, 10_000_000, 28, '1h 30 min', 20, '3 set. · 12:00'),
  new MockProvider('codex',   'Codex',   '#8b6cff', 14, 1_400_000, 10_000_000, 14, '4h 00 min', 10, '5 set. · 23:59'),
  new MockProvider('antigravity', 'Antigravity', '#a8a8a8', 0, 0, 10_000_000, 0, '—', 0, '—'),
];
