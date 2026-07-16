import { bootstrapAIGateway } from '../ai';
import fs from 'fs';
import path from 'path';

const aiGateway = bootstrapAIGateway();

export type DocumentType = 'pdf' | 'docx' | 'pptx' | 'txt' | 'csv' | 'unknown';

export interface DocumentProcessingResult {
  text?: string;
  summary?: string;
  answer?: string;
  keyPoints?: string[];
  documentType: DocumentType;
  rawResponse: string;
}

export class DocumentProcessingService {
  /**
   * Detect document type from mime type or extension.
   */
  getDocumentType(mimetype: string, filename: string): DocumentType {
    if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) return 'pdf';
    if (mimetype.includes('wordprocessingml') || filename.endsWith('.docx')) return 'docx';
    if (mimetype.includes('presentationml') || filename.endsWith('.pptx')) return 'pptx';
    if (mimetype === 'text/plain' || filename.endsWith('.txt')) return 'txt';
    if (mimetype === 'text/csv' || filename.endsWith('.csv')) return 'csv';
    return 'unknown';
  }

  /**
   * Extract text from a text file directly. For PDF/DOCX we simulate with AI.
   */
  async extractText(filePath: string, originalName: string, mimetype: string): Promise<string> {
    const docType = this.getDocumentType(mimetype, originalName);

    // For plain text files we can read directly
    if (docType === 'txt' && fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }

    // For other formats, use AI to describe extraction
    const prompt = `The user uploaded a ${docType.toUpperCase()} document named "${originalName}".

In a production environment, this would be processed using:
- PDF: pdfjs-dist or pdf-parse library
- DOCX: mammoth.js library  
- PPTX: pptx2json or similar

For this development environment, simulate the extraction response:
"[DOCUMENT EXTRACTION] The ${docType} file '${originalName}' would be processed and its text content extracted. In production, the actual document content would appear here. Please ensure the appropriate document parsing library is installed."

Respond with the above simulation text.`;

    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message: prompt,
    });

    return response.response || 'Unable to extract document text.';
  }

  /**
   * Summarize a document based on its content or filename.
   */
  async summarizeDocument(
    content: string,
    originalName: string,
    summaryLength: 'brief' | 'detailed' = 'detailed'
  ): Promise<DocumentProcessingResult> {
    const lengthInstruction =
      summaryLength === 'brief'
        ? 'Provide a brief 2-3 sentence summary.'
        : 'Provide a comprehensive summary covering all key points, conclusions, and important details.';

    const prompt = `Summarize the following document content from "${originalName}":

---
${content.substring(0, 8000)} ${content.length > 8000 ? '\n[... truncated for length ...]' : ''}
---

${lengthInstruction}

Also provide:
- **Key Points** (bullet list of 5-10 most important items)
- **Main Topic** (1 sentence)`;

    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message: prompt,
    });

    const raw = response.response || '';
    const keyPoints = raw
      .split('\n')
      .filter((l) => l.match(/^[-•*]\s+/) || l.match(/^\d+\.\s+/))
      .map((l) => l.replace(/^[-•*\d.]\s+/, '').trim())
      .filter((l) => l.length > 5)
      .slice(0, 10);

    return {
      summary: raw,
      keyPoints,
      documentType: this.getDocumentType('', originalName),
      rawResponse: raw,
    };
  }

  /**
   * Answer a question based on the document content.
   */
  async answerQuestion(
    content: string,
    question: string,
    originalName: string
  ): Promise<DocumentProcessingResult> {
    const prompt = `Based on the following document "${originalName}", answer this question:

**Question:** ${question}

**Document Content:**
---
${content.substring(0, 8000)} ${content.length > 8000 ? '\n[... truncated ...]' : ''}
---

Provide a clear, accurate answer based strictly on the document content. If the answer is not in the document, say so clearly. Format your response with:
1. **Direct Answer** — The answer to the question
2. **Supporting Evidence** — Quote or reference from the document
3. **Confidence** — How confident are you this is accurate?`;

    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message: prompt,
    });

    return {
      answer: response.response || 'Unable to answer question.',
      documentType: this.getDocumentType('', originalName),
      rawResponse: response.response || '',
    };
  }
}

export const documentProcessingService = new DocumentProcessingService();
