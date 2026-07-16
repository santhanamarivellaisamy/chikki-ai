import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { uploadSingle, uploadMultiple, getFileCategory } from '../config/multer';
import { fileUploadService } from '../services/file-upload.service';
import { imageProcessingService } from '../services/image-processing.service';
import { voiceProcessingService } from '../services/voice-processing.service';
import { documentProcessingService } from '../services/document-processing.service';
import { circuitDiagramService } from '../services/circuit-diagram.service';

// ─────────────────────────────────────────────────────────────
//  FILE UPLOAD
// ─────────────────────────────────────────────────────────────

export const uploadFile = [
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No file uploaded' } });
        return;
      }

      const userId = req.user!.id;
      const category = getFileCategory(req.file.mimetype);

      const uploaded = await fileUploadService.uploadFile(
        userId,
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        category
      );

      res.status(201).json({ success: true, file: uploaded });
    } catch (error) {
      next(error);
    }
  },
];

export const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const storagePath = decodeURIComponent(req.params.storagePath as string);
    await fileUploadService.deleteFile(storagePath);
    res.status(200).json({ success: true, message: 'File deleted' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
//  IMAGE PROCESSING
// ─────────────────────────────────────────────────────────────

export const analyzeImage = [
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No image uploaded' } });
        return;
      }

      const analysisType = (req.body.analysisType || 'general') as 'general' | 'ocr' | 'caption' | 'objects';
      const result = await imageProcessingService.analyzeImage(
        req.file.path,
        req.file.originalname,
        analysisType
      );

      // Cleanup temp file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      res.status(200).json({ success: true, result });
    } catch (error) {
      next(error);
    }
  },
];

export const extractTextFromImage = [
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No image uploaded' } });
        return;
      }

      const text = await imageProcessingService.extractText(req.file.path, req.file.originalname);

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      res.status(200).json({ success: true, text });
    } catch (error) {
      next(error);
    }
  },
];

// ─────────────────────────────────────────────────────────────
//  VOICE PROCESSING
// ─────────────────────────────────────────────────────────────

export const transcribeAudio = [
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No audio file uploaded' } });
        return;
      }

      const language = (req.body.language as string) || 'en';
      const result = await voiceProcessingService.transcribeAudio(
        req.file.path,
        req.file.originalname,
        language
      );

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      res.status(200).json({ success: true, transcription: result });
    } catch (error) {
      next(error);
    }
  },
];

export const synthesizeSpeech = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text, voice, language } = req.body;
    if (!text) {
      res.status(400).json({ error: { message: 'Text is required' } });
      return;
    }

    const result = await voiceProcessingService.synthesizeSpeech(text, voice, language);
    res.status(200).json({ success: true, tts: result });
  } catch (error) {
    next(error);
  }
};

export const detectLanguage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: { message: 'Text is required' } });
      return;
    }

    const language = await voiceProcessingService.detectLanguage(text);
    res.status(200).json({ success: true, language });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
//  DOCUMENT PROCESSING
// ─────────────────────────────────────────────────────────────

export const uploadAndExtractDocument = [
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No document uploaded' } });
        return;
      }

      const text = await documentProcessingService.extractText(
        req.file.path,
        req.file.originalname,
        req.file.mimetype
      );

      res.status(200).json({
        success: true,
        filename: req.file.originalname,
        documentType: documentProcessingService.getDocumentType(req.file.mimetype, req.file.originalname),
        text,
      });
    } catch (error) {
      next(error);
    }
  },
];

export const summarizeDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, filename, summaryLength } = req.body;
    if (!content) {
      res.status(400).json({ error: { message: 'Document content is required' } });
      return;
    }

    const result = await documentProcessingService.summarizeDocument(
      content,
      filename || 'document',
      summaryLength || 'detailed'
    );
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const askDocumentQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, question, filename } = req.body;
    if (!content || !question) {
      res.status(400).json({ error: { message: 'Content and question are required' } });
      return;
    }

    const result = await documentProcessingService.answerQuestion(content, question, filename || 'document');
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
//  CIRCUIT DIAGRAM ANALYSIS
// ─────────────────────────────────────────────────────────────

export const analyzeCircuit = [
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No circuit diagram image uploaded' } });
        return;
      }

      const result = await circuitDiagramService.analyzeCircuit(req.file.path, req.file.originalname);

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      res.status(200).json({ success: true, analysis: result });
    } catch (error) {
      next(error);
    }
  },
];
