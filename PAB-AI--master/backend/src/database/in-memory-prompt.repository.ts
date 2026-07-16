import { IPromptRepository } from './prompt.repository';
import { Prompt, PromptVersion } from '../models/prompt.model';
import { InMemoryDB } from './in-memory-db';
import crypto from 'crypto';

export class InMemoryPromptRepository implements IPromptRepository {
  async createPrompt(promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'version'>, userId: string): Promise<Prompt> {
    const prompt: Prompt = {
      ...promptData,
      id: crypto.randomUUID(),
      userId,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    InMemoryDB.prompts.push(prompt);
    // initial version
    const version: PromptVersion = {
      id: crypto.randomUUID(),
      promptId: prompt.id,
      content: prompt.content,
      version: 1,
      createdAt: new Date(),
    };
    InMemoryDB.promptVersions.push(version);
    return prompt;
  }

  async getUserPrompts(userId: string): Promise<Prompt[]> {
    return InMemoryDB.prompts.filter((p) => p.userId === userId);
  }

  async getPromptById(promptId: string, userId: string): Promise<Prompt | null> {
    return InMemoryDB.prompts.find((p) => p.id === promptId && p.userId === userId) || null;
  }

  async updatePrompt(
    promptId: string,
    userId: string,
    updates: Partial<Pick<Prompt, 'name' | 'content' | 'description' | 'category'>> 
  ): Promise<Prompt | null> {
    const idx = InMemoryDB.prompts.findIndex((p) => p.id === promptId && p.userId === userId);
    if (idx === -1) return null;
    const oldPrompt = InMemoryDB.prompts[idx];
    const newVersion = oldPrompt.version + 1;
    const updated: Prompt = {
      ...oldPrompt,
      ...updates,
      version: newVersion,
      updatedAt: new Date(),
    };
    InMemoryDB.prompts[idx] = updated;
    if (updates.content) {
      const version: PromptVersion = {
        id: crypto.randomUUID(),
        promptId,
        content: updates.content,
        version: newVersion,
        createdAt: new Date(),
      };
      InMemoryDB.promptVersions.push(version);
    }
    return updated;
  }

  async deletePrompt(promptId: string, userId: string): Promise<boolean> {
    const idx = InMemoryDB.prompts.findIndex((p) => p.id === promptId && p.userId === userId);
    if (idx === -1) return false;
    InMemoryDB.prompts.splice(idx, 1);
    // also delete versions
    InMemoryDB.promptVersions = InMemoryDB.promptVersions.filter((v) => v.promptId !== promptId);
    return true;
  }

  async getPromptHistory(promptId: string): Promise<PromptVersion[]> {
    return InMemoryDB.promptVersions
      .filter((v) => v.promptId === promptId)
      .sort((a, b) => a.version - b.version);
  }
}
