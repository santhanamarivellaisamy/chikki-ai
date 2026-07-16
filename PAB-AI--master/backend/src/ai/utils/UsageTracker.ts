import { TokenUsage } from '../interfaces/types';

export class UsageTracker {
  private static instance: UsageTracker;
  
  // Example in-memory store. In production, this would hit a DB/Redis.
  private usageRecords: Map<string, TokenUsage[]> = new Map();

  private constructor() {}

  public static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  /**
   * Track usage for a specific provider/model.
   */
  public trackUsage(providerId: string, model: string, usage: TokenUsage): void {
    const key = `${providerId}:${model}`;
    const records = this.usageRecords.get(key) || [];
    records.push(usage);
    this.usageRecords.set(key, records);
    
    // In production, log or push to DB asynchronously
    console.log(`[UsageTracker] ${providerId}/${model}: Prompt: ${usage.promptTokens}, Completion: ${usage.completionTokens}`);
  }

  /**
   * Get total usage across all requests (in-memory for demo).
   */
  public getTotalUsage(): TokenUsage {
    let totalPrompt = 0;
    let totalCompletion = 0;
    
    for (const records of this.usageRecords.values()) {
      for (const record of records) {
        totalPrompt += record.promptTokens;
        totalCompletion += record.completionTokens;
      }
    }

    return {
      promptTokens: totalPrompt,
      completionTokens: totalCompletion,
      totalTokens: totalPrompt + totalCompletion
    };
  }
}
