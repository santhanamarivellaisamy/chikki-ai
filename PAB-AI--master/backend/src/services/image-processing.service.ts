import { bootstrapAIGateway } from '../ai';
import fs from 'fs';
import path from 'path';

const aiGateway = bootstrapAIGateway();

export interface ImageAnalysisResult {
  description: string;
  objects?: string[];
  caption?: string;
  ocrText?: string;
  rawResponse: string;
}

export class ImageProcessingService {
  /**
   * Analyze an image using the AI Gateway.
   * Reads the image as base64 and sends it to Gemini (or mock).
   */
  async analyzeImage(
    imagePath: string,
    originalName: string,
    analysisType: 'general' | 'ocr' | 'caption' | 'objects' = 'general'
  ): Promise<ImageAnalysisResult> {
    const ext = path.extname(originalName).toLowerCase();
    let base64Image = '';
    let mimeType = 'image/jpeg';

    // Read file and encode as base64 if it exists locally
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      base64Image = imageBuffer.toString('base64');
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };
      mimeType = mimeMap[ext] || 'image/jpeg';
    }

    const prompts: Record<string, string> = {
      general: `Analyze this image comprehensively. Describe what you see including objects, scene, colors, text, and any notable features. Be detailed and structured.`,
      ocr: `Extract ALL text visible in this image. Return the text exactly as it appears, preserving formatting, line breaks, and structure. If no text is visible, say "No text detected."`,
      caption: `Generate a single, clear, descriptive caption for this image in 1-2 sentences. Make it suitable for alt text or image description.`,
      objects: `List all objects, entities, and notable elements you can identify in this image. Format as a numbered list. Include approximate positions (top-left, center, etc.) when relevant.`,
    };

    const prompt = prompts[analysisType] || prompts.general;

    // Build the message - if we have base64, include it as multimodal data hint
    const message =
      base64Image
        ? `[Image: ${originalName} (${mimeType}, base64 encoded)]\n\nInstruction: ${prompt}`
        : `[Image file: ${originalName}]\n\nInstruction: ${prompt}`;

    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message,
    });

    const text = response.response || response.error || 'Unable to analyze image.';

    // Parse objects if it's an object detection request
    let objects: string[] | undefined;
    if (analysisType === 'objects') {
      objects = text
        .split('\n')
        .filter((line) => line.match(/^\d+\./))
        .map((line) => line.replace(/^\d+\.\s*/, '').trim());
    }

    return {
      description: analysisType === 'general' ? text : '',
      objects: analysisType === 'objects' ? objects : undefined,
      caption: analysisType === 'caption' ? text : undefined,
      ocrText: analysisType === 'ocr' ? text : undefined,
      rawResponse: text,
    };
  }

  /**
   * Perform OCR on an image (convenience wrapper).
   */
  async extractText(imagePath: string, originalName: string): Promise<string> {
    const result = await this.analyzeImage(imagePath, originalName, 'ocr');
    return result.ocrText || '';
  }
}

export const imageProcessingService = new ImageProcessingService();
