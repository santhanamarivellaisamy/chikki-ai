export interface Prompt {
  id: string;
  userId: string;
  name: string;
  content: string;
  description?: string;
  category: string;
  isTemplate: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  version: number;
  createdAt: Date;
}
