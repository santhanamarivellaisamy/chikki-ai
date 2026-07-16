import { AIChatRequest, AIChatResponse, AIProviderModel } from './types';

export interface AIProvider {
  /**
   * Unique identifier for the provider (e.g., 'gemini', 'openai')
   */
  readonly id: string;

  /**
   * Process a standard chat request and return a standard response.
   */
  chat(request: AIChatRequest): Promise<AIChatResponse>;

  /**
   * Process a chat request and return an async iterable for streaming responses.
   * Yields partial AIChatResponse objects or string chunks depending on implementation.
   */
  chatStream(request: AIChatRequest): AsyncIterable<string>;

  /**
   * Get the list of available models for this provider dynamically.
   */
  getAvailableModels(): Promise<AIProviderModel[]>;
  
  /**
   * Check if the provider is properly configured (e.g., API keys exist and are valid).
   */
  isConfigured(): boolean;
}
