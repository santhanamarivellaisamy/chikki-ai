import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  uploadFile,
  deleteFile,
  analyzeImage,
  extractTextFromImage,
  transcribeAudio,
  synthesizeSpeech,
  detectLanguage,
  uploadAndExtractDocument,
  summarizeDocument,
  askDocumentQuestion,
  analyzeCircuit,
} from '../controllers/processing.controller';
import {
  generateCode,
  explainCode,
  debugCode,
  optimizeCode,
  convertCode,
  reviewCode,
} from '../controllers/code.controller';
import {
  getTemplates,
  getUserPrompts,
  createPrompt,
  getPromptById,
  updatePrompt,
  deletePrompt,
  getPromptHistory,
  resolvePrompt,
} from '../controllers/prompt.controller';

const router = Router();
router.use(requireAuth);

// ── File Upload ──────────────────────────────────────────────
router.post('/upload', ...uploadFile);
router.delete('/upload/:storagePath', deleteFile);

// ── Image Processing ─────────────────────────────────────────
router.post('/image/analyze', ...analyzeImage);
router.post('/image/ocr', ...extractTextFromImage);

// ── Voice Processing ─────────────────────────────────────────
router.post('/voice/transcribe', ...transcribeAudio);
router.post('/voice/synthesize', synthesizeSpeech);
router.post('/voice/detect-language', detectLanguage);

// ── Document Processing ──────────────────────────────────────
router.post('/document/extract', ...uploadAndExtractDocument);
router.post('/document/summarize', summarizeDocument);
router.post('/document/ask', askDocumentQuestion);

// ── Circuit Diagram ──────────────────────────────────────────
router.post('/circuit/analyze', ...analyzeCircuit);

// ── Code Generation ──────────────────────────────────────────
router.post('/code/generate', generateCode);
router.post('/code/explain', explainCode);
router.post('/code/debug', debugCode);
router.post('/code/optimize', optimizeCode);
router.post('/code/convert', convertCode);
router.post('/code/review', reviewCode);

// ── Prompt Management ─────────────────────────────────────────
router.get('/prompts/templates', getTemplates);
router.get('/prompts', getUserPrompts);
router.post('/prompts', createPrompt);
router.get('/prompts/:promptId', getPromptById);
router.put('/prompts/:promptId', updatePrompt);
router.delete('/prompts/:promptId', deletePrompt);
router.get('/prompts/:promptId/history', getPromptHistory);
router.post('/prompts/:promptId/resolve', resolvePrompt);

export default router;
