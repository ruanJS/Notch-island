/**
 * ProviderService — camada de serviço entre UI e providers.
 * README seção 41: somente services conhecem os detalhes de cada adapter.
 */
import type { AIProvider, UsageSnapshot } from '../domain/types';
import { MOCK_PROVIDERS } from '../adapters/MockProvider';

class ProviderService {
  private providers: AIProvider[] = MOCK_PROVIDERS;

  getProviders(): AIProvider[] {
    return this.providers;
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.find((p) => p.id === id);
  }

  async refreshAll(): Promise<UsageSnapshot[]> {
    const snapshots = await Promise.all(
      this.providers.map((p) => p.fetchUsage()),
    );
    return snapshots;
  }

  async refresh(providerId: string): Promise<UsageSnapshot | null> {
    const provider = this.getProvider(providerId);
    if (!provider) return null;
    return provider.fetchUsage();
  }
}

export const providerService = new ProviderService();
