import { ProviderRegistry } from '../registry/ProviderRegistry';
import { AIChatRequest, AIChatResponse } from '../interfaces/types';
import { ModelManager } from '../models/ModelManager';

// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`[AIGateway] Call failed, retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

export class AIGateway {
  private registry: ProviderRegistry;
  private modelManager: ModelManager;

  constructor() {
    this.registry = ProviderRegistry.getInstance();
    this.modelManager = ModelManager.getInstance();
  }

  /**
   * Optimizes prompt by cleaning up whitespace and adding basic instructions if necessary.
   */
  private optimizePrompt(prompt: string): string {
    return prompt.trim();
  }

  /**
   * Process a chat request by routing it to the selected provider.
   * If the provider fails or is not configured, fall back to other configured providers.
   * If no providers are configured at all, fallback to the MockProvider.
   */
  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const optimizedMessage = this.optimizePrompt(request.message);
    const optimizedRequest = { ...request, message: optimizedMessage };

    // Determine the chain of providers to try
    const providersToTry: string[] = [optimizedRequest.provider];
    
    // Append other configured providers as fallback options
    this.registry.getAllProviders().forEach((prov) => {
      if (prov.id !== optimizedRequest.provider && prov.isConfigured() && prov.id !== 'mock') {
        providersToTry.push(prov.id);
      }
    });

    // If no provider has valid configuration, fallback to the mock provider
    const hasAnyConfigured = this.registry.getAllProviders().some((p) => p.id !== 'mock' && p.isConfigured());
    if (!hasAnyConfigured) {
      console.log('[AIGateway] No AI providers are configured. Routing to MockProvider.');
      providersToTry.push('mock');
    }

    let lastError: any = null;

    for (const providerId of providersToTry) {
      try {
        const provider = this.registry.getProvider(providerId);
        if (!provider.isConfigured()) {
          continue; // Skip if not configured
        }

        console.log(`[AIGateway] Attempting chat with provider: ${providerId}`);
        const resolvedModel = this.modelManager.resolveModelAlias(
          providerId === optimizedRequest.provider ? optimizedRequest.model : ''
        );
        const payload = { ...optimizedRequest, provider: providerId, model: resolvedModel };

        const response = await retryWithBackoff(() => provider.chat(payload), 2, 500);
        return response;
      } catch (error: any) {
        console.error(`[AIGateway] Provider '${providerId}' failed:`, error.message);
        lastError = error;
      }
    }

    // If everything failed, try to use MockProvider as a last resort
    try {
      const mockProvider = this.registry.getProvider('mock');
      console.log('[AIGateway] All providers failed. Falling back to MockProvider.');
      return await mockProvider.chat(optimizedRequest);
    } catch (e) {
      return {
        success: false,
        provider: request.provider,
        model: request.model,
        response: '',
        error: lastError?.message || 'All providers failed and Mock fallback was unavailable.',
      };
    }
  }

  /**
   * Stream a chat request by routing it to the selected provider.
   * Fallback to MockProvider if not configured.
   */
  public async *chatStream(request: AIChatRequest): AsyncIterable<string> {
    const optimizedMessage = this.optimizePrompt(request.message);
    const optimizedRequest = { ...request, message: optimizedMessage };

    let providerId = optimizedRequest.provider;
    let provider = this.registry.getProvider(providerId);

    if (!provider.isConfigured()) {
      const hasAnyConfigured = this.registry.getAllProviders().some((p) => p.id !== 'mock' && p.isConfigured());
      if (!hasAnyConfigured) {
        console.log(`[AIGateway] Provider '${providerId}' is not configured and no others are available. Falling back to MockProvider for stream.`);
        providerId = 'mock';
        provider = this.registry.getProvider('mock');
      } else {
        // Find another configured provider
        const alternative = this.registry.getAllProviders().find((p) => p.id !== 'mock' && p.isConfigured());
        if (alternative) {
          console.log(`[AIGateway] Provider '${providerId}' is not configured. Falling back to '${alternative.id}' for stream.`);
          providerId = alternative.id;
          provider = alternative;
        }
      }
    }

    try {
      const resolvedModel = this.modelManager.resolveModelAlias(
        providerId === optimizedRequest.provider ? optimizedRequest.model : ''
      );
      const payload = { ...optimizedRequest, provider: providerId, model: resolvedModel };
      yield* provider.chatStream(payload);
    } catch (error: any) {
      console.error(`[AIGateway] Stream error with provider '${providerId}':`, error);
      yield `[Stream Error with ${providerId}: ${error.message || 'Unknown error'}]`;
    }
  }

  /**
   * Get the configuration of all registered providers.
   */
  public async getConfig(): Promise<any[]> {
    const providers = this.registry.getAllProviders();
    const config = [];

    for (const provider of providers) {
      config.push({
        id: provider.id,
        isConfigured: provider.isConfigured(),
        models: await provider.getAvailableModels(),
      });
    }

    return config;
  }
}
