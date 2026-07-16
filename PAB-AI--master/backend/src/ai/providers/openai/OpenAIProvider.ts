import { AIProvider } from '../../interfaces/AIProvider.interface';
import { AIChatRequest, AIChatResponse, AIProviderModel } from '../../interfaces/types';
import { APIKeyManager } from '../../utils/APIKeyManager';
import { UsageTracker } from '../../utils/UsageTracker';

export class OpenAIProvider implements AIProvider {
  public readonly id = 'openai';
  private keyManager = APIKeyManager.getInstance();
  private usageTracker = UsageTracker.getInstance();

  public isConfigured(): boolean {
    return this.keyManager.hasKey(this.id);
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const apiKey = this.keyManager.requireKey(this.id);
    const model = request.model || 'gpt-4o-mini';
    
    const url = `https://api.openai.com/v1/chat/completions`;
    
    const payload = {
      model: model,
      messages: [{ role: 'user', content: request.message }],
      stream: false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.choices?.[0]?.message?.content || '';
    
    const usage = {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    };
    
    this.usageTracker.trackUsage(this.id, model, usage);

    return {
      success: true,
      provider: this.id,
      model: model,
      response: textResponse,
      usage
    };
  }

  public async *chatStream(request: AIChatRequest): AsyncIterable<string> {
    const apiKey = this.keyManager.requireKey(this.id);
    const model = request.model || 'gpt-4o-mini';
    
    const url = `https://api.openai.com/v1/chat/completions`;
    
    const payload = {
      model: model,
      messages: [{ role: 'user', content: request.message }],
      stream: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.body) {
      throw new Error("ReadableStream not supported by fetch environment.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  }

  public async getAvailableModels(): Promise<AIProviderModel[]> {
    return [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-5', name: 'GPT-5' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini' }
    ];
  }
}
