export interface AIChatRequest {
  provider: string;
  model: string;
  message: string;
  conversationId?: string;
  stream?: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIChatResponse {
  success: boolean;
  provider: string;
  model: string;
  response: string;
  usage?: TokenUsage;
  error?: string;
}

export interface AIProviderModel {
  id: string;
  name: string;
}

export interface ProviderConfig {
  id: string;
  isConfigured: boolean;
  models: AIProviderModel[];
}
