import { AIProvider } from '../../interfaces/AIProvider.interface';
import { AIChatRequest, AIChatResponse, AIProviderModel } from '../../interfaces/types';
import { APIKeyManager } from '../../utils/APIKeyManager';
import { UsageTracker } from '../../utils/UsageTracker';

export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini';
  private keyManager = APIKeyManager.getInstance();
  private usageTracker = UsageTracker.getInstance();

  public isConfigured(): boolean {
    return this.keyManager.hasKey(this.id);
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const apiKey = this.keyManager.requireKey(this.id);
    const model = request.model || 'gemini-2.5-flash';
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: request.message }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Usage data varies, mock tracking here if not provided exactly by endpoint
    const promptTokens = data.usageMetadata?.promptTokenCount || 0;
    const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;
    const usage = {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
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
    const model = request.model || 'gemini-2.5-flash';
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: request.message }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      yield chunk; // Simplified SSE yielding
    }
  }

  public async getAvailableModels(): Promise<AIProviderModel[]> {
    return [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }
    ];
  }
}
