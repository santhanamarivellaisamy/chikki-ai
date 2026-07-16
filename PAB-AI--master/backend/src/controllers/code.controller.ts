import { Request, Response, NextFunction } from 'express';
import { codeGenerationService } from '../services/code-generation.service';

export const generateCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { description, language, context } = req.body;
    if (!description) {
      res.status(400).json({ error: { message: 'Description is required' } });
      return;
    }
    const result = await codeGenerationService.generateCode(description, language, context);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const explainCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, language } = req.body;
    if (!code) {
      res.status(400).json({ error: { message: 'Code is required' } });
      return;
    }
    const result = await codeGenerationService.explainCode(code, language);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const debugCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, errorMessage, language } = req.body;
    if (!code) {
      res.status(400).json({ error: { message: 'Code is required' } });
      return;
    }
    const result = await codeGenerationService.debugCode(code, errorMessage, language);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const optimizeCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, language, optimizationTarget } = req.body;
    if (!code) {
      res.status(400).json({ error: { message: 'Code is required' } });
      return;
    }
    const result = await codeGenerationService.optimizeCode(code, language, optimizationTarget);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const convertCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, fromLanguage, toLanguage } = req.body;
    if (!code || !fromLanguage || !toLanguage) {
      res.status(400).json({ error: { message: 'code, fromLanguage, and toLanguage are required' } });
      return;
    }
    const result = await codeGenerationService.convertCode(code, fromLanguage, toLanguage);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const reviewCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, language } = req.body;
    if (!code) {
      res.status(400).json({ error: { message: 'Code is required' } });
      return;
    }
    const result = await codeGenerationService.reviewCode(code, language);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};
