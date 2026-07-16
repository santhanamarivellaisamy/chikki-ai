import { AIProvider } from '../../interfaces/AIProvider.interface';
import { AIChatRequest, AIChatResponse, AIProviderModel } from '../../interfaces/types';
import { APIKeyManager } from '../../utils/APIKeyManager';
import { UsageTracker } from '../../utils/UsageTracker';

export class ClaudeProvider implements AIProvider {
  public readonly id = 'claude';
  private keyManager = APIKeyManager.getInstance();
  private usageTracker = UsageTracker.getInstance();

  public isConfigured(): boolean {
    return this.keyManager.hasKey(this.id);
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const apiKey = this.keyManager.requireKey(this.id);
    const model = request.model || 'claude-3-opus-20240229';
    
    const url = `https://api.anthropic.com/v1/messages`;
    
    const payload = {
      model: model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: request.message }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.content?.[0]?.text || '';
    
    const usage = {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
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
    const model = request.model || 'claude-3-opus-20240229';
    
    const url = `https://api.anthropic.com/v1/messages`;
    
    const payload = {
      model: model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: request.message }],
      stream: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.body) {
      throw new Error("ReadableStream not supported.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }

  public async getAvailableModels(): Promise<AIProviderModel[]> {
    return [
      { id: 'claude-3-opus-20240229', name: 'Claude Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude Haiku' }
    ];
  }
}
