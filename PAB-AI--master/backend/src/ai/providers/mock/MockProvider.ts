import { AIProvider } from '../../interfaces/AIProvider.interface';
import { AIChatRequest, AIChatResponse, AIProviderModel } from '../../interfaces/types';

export class MockProvider implements AIProvider {
  public readonly id = 'mock';

  public isConfigured(): boolean {
    return true; // Always available for developer testing
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const model = request.model || 'mock-model';
    const responseText = `[Mock Response] You asked: "${request.message}". This is a simulated response because no live AI provider API keys are configured.`;
    
    const usage = {
      promptTokens: request.message.split(' ').length,
      completionTokens: responseText.split(' ').length,
      totalTokens: request.message.split(' ').length + responseText.split(' ').length
    };

    return {
      success: true,
      provider: this.id,
      model,
      response: responseText,
      usage
    };
  }

  public async *chatStream(request: AIChatRequest): AsyncIterable<string> {
    const words = `This is a simulated streaming response for your message: "${request.message}". Please configure your API keys in the .env file to enable live AI responses.`.split(' ');
    
    for (const word of words) {
      // Simulate small delay
      await new Promise((resolve) => setTimeout(resolve, 80));
      yield word + ' ';
    }
  }

  public async getAvailableModels(): Promise<AIProviderModel[]> {
    return [
      { id: 'mock-chat', name: 'Mock Chat Model' }
    ];
  }
}
