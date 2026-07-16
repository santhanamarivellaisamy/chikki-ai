import { AIGateway } from './gateway/AIGateway';
import { ProviderRegistry } from './registry/ProviderRegistry';
import { GeminiProvider } from './providers/gemini/GeminiProvider';
import { OpenAIProvider } from './providers/openai/OpenAIProvider';
import { ClaudeProvider } from './providers/claude/ClaudeProvider';
import { DeepSeekProvider } from './providers/deepseek/DeepSeekProvider';
import { GLMProvider } from './providers/glm/GLMProvider';
import { KimiProvider } from './providers/kimi/KimiProvider';
import { MockProvider } from './providers/mock/MockProvider';

// Export core types and interfaces
export * from './interfaces/types';
export * from './interfaces/AIProvider.interface';
export { AIGateway } from './gateway/AIGateway';

/**
 * Bootstraps the AI Gateway by registering all available providers.
 * Run this on application startup.
 */
export function bootstrapAIGateway(): AIGateway {
  const registry = ProviderRegistry.getInstance();
  
  registry.register(new GeminiProvider());
  registry.register(new OpenAIProvider());
  registry.register(new ClaudeProvider());
  registry.register(new DeepSeekProvider());
  registry.register(new GLMProvider());
  registry.register(new KimiProvider());
  registry.register(new MockProvider());

  return new AIGateway();
}
