import { AIProvider } from '../interfaces/AIProvider.interface';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, AIProvider> = new Map();

  private constructor() {}

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Registers a new AI provider.
   */
  public register(provider: AIProvider): void {
    if (this.providers.has(provider.id)) {
      console.warn(`[ProviderRegistry] Provider ${provider.id} is already registered. Overwriting.`);
    }
    this.providers.set(provider.id, provider);
    console.log(`[ProviderRegistry] Successfully registered provider: ${provider.id}`);
  }

  /**
   * Retrieves a registered AI provider by ID.
   */
  public getProvider(id: string): AIProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider with ID '${id}' not found in registry.`);
    }
    return provider;
  }

  /**
   * Returns a list of all registered providers.
   */
  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}
