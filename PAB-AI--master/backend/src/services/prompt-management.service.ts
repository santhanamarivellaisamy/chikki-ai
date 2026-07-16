import crypto from 'crypto';
import { Prompt, PromptVersion } from '../models/prompt.model';
import { InMemoryDB } from '../database/in-memory-db';

// Built-in system prompt templates
const SYSTEM_TEMPLATES: Omit<Prompt, 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'tpl-general',
    name: 'General Assistant',
    content: 'You are a helpful, accurate, and friendly AI assistant. Provide clear and concise responses.',
    description: 'Default general-purpose assistant prompt',
    category: 'general',
    isTemplate: true,
    version: 1,
  },
  {
    id: 'tpl-coder',
    name: 'Expert Programmer',
    content: 'You are an expert software engineer. Provide clean, well-commented, production-ready code. Explain your decisions. Follow best practices and design patterns.',
    description: 'For code generation and review tasks',
    category: 'coding',
    isTemplate: true,
    version: 1,
  },
  {
    id: 'tpl-teacher',
    name: 'Patient Teacher',
    content: 'You are a patient and thorough teacher. Explain concepts step by step, use analogies and examples, and check for understanding. Adapt to the learner\'s level.',
    description: 'Educational explanations and tutoring',
    category: 'education',
    isTemplate: true,
    version: 1,
  },
  {
    id: 'tpl-writer',
    name: 'Creative Writer',
    content: 'You are a skilled creative writer. Help craft engaging, vivid, and well-structured content. Be creative, use strong imagery, and maintain consistent tone and style.',
    description: 'Creative writing and storytelling',
    category: 'creative',
    isTemplate: true,
    version: 1,
  },
  {
    id: 'tpl-analyst',
    name: 'Data Analyst',
    content: 'You are an expert data analyst. Analyze data and information systematically. Provide insights backed by evidence. Structure your analysis with clear sections: summary, findings, recommendations.',
    description: 'Data analysis and insights',
    category: 'analysis',
    isTemplate: true,
    version: 1,
  },
];

export class PromptManagementService {
  /**
   * Get all system templates.
   */
  getTemplates(): Omit<Prompt, 'userId' | 'createdAt' | 'updatedAt'>[] {
    return SYSTEM_TEMPLATES;
  }

  /**
   * Create a new user prompt.
   */
  createPrompt(
    userId: string,
    name: string,
    content: string,
    category = 'custom',
    description?: string,
    isTemplate = false
  ): Prompt {
    const prompt: Prompt = {
      id: crypto.randomUUID(),
      userId,
      name,
      content,
      description,
      category,
      isTemplate,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    InMemoryDB.prompts.push(prompt);

    // Store initial version
    const version: PromptVersion = {
      id: crypto.randomUUID(),
      promptId: prompt.id,
      content,
      version: 1,
      createdAt: new Date(),
    };
    if (!InMemoryDB.promptVersions) InMemoryDB.promptVersions = [];
    InMemoryDB.promptVersions.push(version);

    return prompt;
  }

  /**
   * Get all prompts for a user (includes system templates).
   */
  getUserPrompts(userId: string, includeTemplates = true): any[] {
    const userPrompts = InMemoryDB.prompts.filter((p: Prompt) => p.userId === userId);
    if (includeTemplates) {
      const now = new Date();
      const templates = SYSTEM_TEMPLATES.map((t) => ({
        ...t,
        userId: 'system',
        createdAt: now,
        updatedAt: now,
      }));
      return [...templates, ...userPrompts];
    }
    return userPrompts;
  }

  /**
   * Get a prompt by ID.
   */
  getPromptById(promptId: string, userId: string): Prompt | null {
    // Check system templates first
    const template = SYSTEM_TEMPLATES.find((t) => t.id === promptId);
    if (template) {
      const now = new Date();
      return { ...template, userId: 'system', createdAt: now, updatedAt: now };
    }

    const prompt = InMemoryDB.prompts.find((p: Prompt) => p.id === promptId && p.userId === userId);
    return prompt || null;
  }

  /**
   * Update a user prompt (creates a new version).
   */
  updatePrompt(promptId: string, userId: string, updates: Partial<Pick<Prompt, 'name' | 'content' | 'description' | 'category'>>): Prompt | null {
    const idx = InMemoryDB.prompts.findIndex((p: Prompt) => p.id === promptId && p.userId === userId);
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

    // Store version history
    if (!InMemoryDB.promptVersions) InMemoryDB.promptVersions = [];
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

  /**
   * Delete a user prompt.
   */
  deletePrompt(promptId: string, userId: string): boolean {
    const idx = InMemoryDB.prompts.findIndex((p: Prompt) => p.id === promptId && p.userId === userId);
    if (idx === -1) return false;
    InMemoryDB.prompts.splice(idx, 1);
    return true;
  }

  /**
   * Get version history of a prompt.
   */
  getPromptHistory(promptId: string): PromptVersion[] {
    if (!InMemoryDB.promptVersions) return [];
    return (InMemoryDB.promptVersions as PromptVersion[])
      .filter((v) => v.promptId === promptId)
      .sort((a, b) => a.version - b.version);
  }

  /**
   * Apply a prompt template — returns the content ready to inject as a system instruction.
   */
  resolvePrompt(promptId: string, userId: string, variables?: Record<string, string>): string {
    const prompt = this.getPromptById(promptId, userId);
    if (!prompt) return '';

    let content = prompt.content;

    // Replace {{variable}} placeholders
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    return content;
  }
}

export const promptManagementService = new PromptManagementService();
