import { Prompt, PromptVersion } from  ../models/prompt.model;

export interface IPromptRepository {
  createPrompt(userId: string, name: string, content: string, description?: string, category?: string, isTemplate?: boolean): Promise<Prompt>;
  getPromptById(id: string): Promise<Prompt | null>;
  getPromptsByUserId(userId: string): Promise<Prompt[]>;
  updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  deletePrompt(id: string): Promise<void>;

  // Version handling
  createPromptVersion(promptId: string, content: string, version: number): Promise<PromptVersion>;
  getPromptVersionById(id: string): Promise<PromptVersion | null>;
  getPromptVersions(promptId: string): Promise<PromptVersion[]>;
}
