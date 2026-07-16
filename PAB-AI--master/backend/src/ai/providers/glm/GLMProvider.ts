import { AIProvider } from '../../interfaces/AIProvider.interface';
import { AIChatRequest, AIChatResponse, AIProviderModel } from '../../interfaces/types';
import { APIKeyManager } from '../../utils/APIKeyManager';
import { UsageTracker } from '../../utils/UsageTracker';

export class GLMProvider implements AIProvider {
  public readonly id = 'glm';
  private keyManager = APIKeyManager.getInstance();
  private usageTracker = UsageTracker.getInstance();

  public isConfigured(): boolean {
    return this.keyManager.hasKey(this.id);
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const apiKey = this.keyManager.requireKey(this.id);
    const model = request.model || 'glm-4';
    
    const url = `https://open.bigmodel.cn/api/paas/v4/chat/completions`;
    
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
      throw new Error(`GLM API Error: ${response.status} - ${errorText}`);
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
    const model = request.model || 'glm-4';
    
    const url = `https://open.bigmodel.cn/api/paas/v4/chat/completions`;
    
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

    if (!response.body) throw new Error("Stream not supported.");

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
      { id: 'glm-4', name: 'GLM-4' },
      { id: 'glm-4.5', name: 'GLM-4.5' }
    ];
  }
}
