import { Request, Response, NextFunction } from 'express';
import { promptManagementService } from '../services/prompt-management.service';

export const getTemplates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const templates = promptManagementService.getTemplates();
    res.status(200).json({ success: true, templates });
  } catch (error) {
    next(error);
  }
};

export const getUserPrompts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const includeTemplates = req.query.includeTemplates !== 'false';
    const prompts = promptManagementService.getUserPrompts(userId, includeTemplates);
    res.status(200).json({ success: true, prompts });
  } catch (error) {
    next(error);
  }
};

export const createPrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, content, category, description, isTemplate } = req.body;
    if (!name || !content) {
      res.status(400).json({ error: { message: 'Name and content are required' } });
      return;
    }
    const prompt = promptManagementService.createPrompt(userId, name, content, category, description, isTemplate);
    res.status(201).json({ success: true, prompt });
  } catch (error) {
    next(error);
  }
};

export const getPromptById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const promptId = req.params.promptId as string;
    const prompt = promptManagementService.getPromptById(promptId, userId);
    if (!prompt) {
      res.status(404).json({ error: { message: 'Prompt not found' } });
      return;
    }
    res.status(200).json({ success: true, prompt });
  } catch (error) {
    next(error);
  }
};

export const updatePrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const promptId = req.params.promptId as string;
    const { name, content, description, category } = req.body;
    const updated = promptManagementService.updatePrompt(promptId, userId, { name, content, description, category });
    if (!updated) {
      res.status(404).json({ error: { message: 'Prompt not found' } });
      return;
    }
    res.status(200).json({ success: true, prompt: updated });
  } catch (error) {
    next(error);
  }
};

export const deletePrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const promptId = req.params.promptId as string;
    const deleted = promptManagementService.deletePrompt(promptId, userId);
    if (!deleted) {
      res.status(404).json({ error: { message: 'Prompt not found' } });
      return;
    }
    res.status(200).json({ success: true, message: 'Prompt deleted' });
  } catch (error) {
    next(error);
  }
};

export const getPromptHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promptId = req.params.promptId as string;
    const history = promptManagementService.getPromptHistory(promptId);
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

export const resolvePrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const promptId = req.params.promptId as string;
    const { variables } = req.body;
    const content = promptManagementService.resolvePrompt(promptId, userId, variables);
    if (!content) {
      res.status(404).json({ error: { message: 'Prompt not found' } });
      return;
    }
    res.status(200).json({ success: true, content });
  } catch (error) {
    next(error);
  }
};
