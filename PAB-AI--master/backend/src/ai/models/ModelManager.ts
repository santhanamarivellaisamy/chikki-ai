import { AIProviderModel } from '../interfaces/types';

export class ModelManager {
  private static instance: ModelManager;

  // A generic mapping or fallback if a provider doesn't support dynamic fetching,
  // or a place to store alias mappings (e.g., 'gemini-latest' -> 'gemini-2.5-pro').
  private modelAliases: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * Resolve an alias to an actual model ID if it exists.
   */
  public resolveModelAlias(model: string): string {
    return this.modelAliases.get(model) || model;
  }

  /**
   * Register a new model alias.
   */
  public registerAlias(alias: string, actualModelId: string): void {
    this.modelAliases.set(alias, actualModelId);
  }
}
