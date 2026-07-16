import { bootstrapAIGateway } from '../ai';

const aiGateway = bootstrapAIGateway();

export type ProgrammingLanguage =
  | 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'c' | 'go'
  | 'rust' | 'php' | 'ruby' | 'swift' | 'kotlin' | 'sql' | 'bash' | 'html' | 'css';

export interface CodeResult {
  code?: string;
  explanation?: string;
  language?: string;
  suggestions?: string[];
  rawResponse: string;
}

export class CodeGenerationService {
  private async callAI(prompt: string): Promise<string> {
    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message: prompt,
    });
    return response.response || response.error || 'Unable to process code request.';
  }

  /**
   * Generate code from a natural language description.
   */
  async generateCode(description: string, language: ProgrammingLanguage = 'python', context?: string): Promise<CodeResult> {
    const prompt = `Generate clean, production-ready ${language} code for the following requirement:

**Requirement:** ${description}
${context ? `**Additional Context:** ${context}` : ''}

Requirements:
- Write clean, well-commented code following best practices
- Include error handling where appropriate
- Add brief inline comments for complex logic
- Format the code properly

Return ONLY the code with comments. Do not include explanations outside the code block.`;

    const raw = await this.callAI(prompt);
    return { code: raw, language, rawResponse: raw };
  }

  /**
   * Explain what a piece of code does.
   */
  async explainCode(code: string, language?: string): Promise<CodeResult> {
    const prompt = `Explain the following ${language || 'code'} clearly and concisely:

\`\`\`${language || ''}
${code}
\`\`\`

Provide:
1. **Purpose** — What does this code do overall?
2. **Key Logic** — Walk through the main steps
3. **Edge Cases** — Any potential issues or limitations
4. **Usage Example** — How would you call/use this?

Be clear and structured.`;

    const raw = await this.callAI(prompt);
    return { explanation: raw, language, rawResponse: raw };
  }

  /**
   * Debug code and find issues.
   */
  async debugCode(code: string, errorMessage?: string, language?: string): Promise<CodeResult> {
    const prompt = `Debug the following ${language || 'code'} and fix all issues:

\`\`\`${language || ''}
${code}
\`\`\`
${errorMessage ? `\n**Error Message:** ${errorMessage}` : ''}

Provide:
1. **Issue Found** — What is wrong?
2. **Fixed Code** — The corrected version
3. **Explanation** — Why this fix works`;

    const raw = await this.callAI(prompt);
    return { code: raw, language, rawResponse: raw };
  }

  /**
   * Optimize code for performance or readability.
   */
  async optimizeCode(code: string, language?: string, optimizationTarget: 'performance' | 'readability' | 'both' = 'both'): Promise<CodeResult> {
    const prompt = `Optimize the following ${language || 'code'} for ${optimizationTarget}:

\`\`\`${language || ''}
${code}
\`\`\`

Provide:
1. **Optimized Code** — The improved version
2. **Changes Made** — What was changed and why
3. **Performance Impact** — Expected improvement`;

    const raw = await this.callAI(prompt);
    return { code: raw, language, rawResponse: raw };
  }

  /**
   * Convert code from one language to another.
   */
  async convertCode(code: string, fromLanguage: ProgrammingLanguage, toLanguage: ProgrammingLanguage): Promise<CodeResult> {
    const prompt = `Convert the following ${fromLanguage} code to ${toLanguage}:

\`\`\`${fromLanguage}
${code}
\`\`\`

Requirements:
- Preserve all functionality and logic exactly
- Use idiomatic ${toLanguage} patterns and conventions
- Add comments where the conversion differs significantly
- Include any necessary imports or dependencies

Return ONLY the converted ${toLanguage} code.`;

    const raw = await this.callAI(prompt);
    return { code: raw, language: toLanguage, rawResponse: raw };
  }

  /**
   * Review code and provide quality suggestions.
   */
  async reviewCode(code: string, language?: string): Promise<CodeResult> {
    const prompt = `Perform a thorough code review of this ${language || 'code'}:

\`\`\`${language || ''}
${code}
\`\`\`

Review for:
1. **Security Issues** — Any vulnerabilities?
2. **Performance** — Bottlenecks or inefficiencies?
3. **Code Quality** — Naming, structure, readability
4. **Best Practices** — Does it follow ${language || 'coding'} conventions?
5. **Suggestions** — Specific improvements with examples

Format as a structured review report.`;

    const raw = await this.callAI(prompt);
    const suggestions = raw.split('\n').filter((l) => l.match(/^\d+\.|^-|^•/)).map((l) => l.trim());
    return { explanation: raw, suggestions, language, rawResponse: raw };
  }
}

export const codeGenerationService = new CodeGenerationService();
