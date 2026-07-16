import { bootstrapAIGateway } from '../ai';

const aiGateway = bootstrapAIGateway();

export interface CircuitAnalysisResult {
  components: CircuitComponent[];
  connections: string[];
  circuitType: string;
  description: string;
  pinDescriptions: string[];
  pcbGuidance: string[];
  warnings: string[];
  rawResponse: string;
}

export interface CircuitComponent {
  name: string;
  type: string;
  description: string;
  quantity?: number;
}

export class CircuitDiagramService {
  private async callAI(prompt: string): Promise<string> {
    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message: prompt,
    });
    return response.response || 'Unable to analyze circuit diagram.';
  }

  /**
   * Analyze an uploaded circuit diagram image.
   */
  async analyzeCircuit(imagePath: string, originalName: string): Promise<CircuitAnalysisResult> {
    const prompt = `You are an expert electronics engineer analyzing a circuit diagram.

Image file: ${originalName}

Please analyze this circuit diagram and provide:

1. **COMPONENTS** — List every electronic component with:
   - Name and type (resistor, capacitor, IC, transistor, etc.)
   - Value/specification if visible
   - Quantity

2. **CIRCUIT TYPE** — What type of circuit is this? (amplifier, power supply, filter, oscillator, etc.)

3. **CIRCUIT DESCRIPTION** — Explain how the circuit works, step by step

4. **CONNECTIONS** — Key signal paths and connections between major components

5. **PIN DESCRIPTIONS** — For any ICs, describe the pin functions visible

6. **PCB GUIDANCE** — Best practices for PCB layout of this circuit

7. **WARNINGS** — Any potential issues, safety concerns, or common mistakes to avoid

Format your response clearly with these numbered sections.`;

    const raw = await this.callAI(prompt);

    // Parse sections from the response
    const sections = this.parseSections(raw);

    return {
      components: this.parseComponents(sections.components || ''),
      connections: this.parseList(sections.connections || ''),
      circuitType: sections.circuitType || 'Unknown circuit type',
      description: sections.description || raw,
      pinDescriptions: this.parseList(sections.pinDescriptions || ''),
      pcbGuidance: this.parseList(sections.pcbGuidance || ''),
      warnings: this.parseList(sections.warnings || ''),
      rawResponse: raw,
    };
  }

  /**
   * Identify specific electronic components in an image.
   */
  async identifyComponents(imagePath: string, originalName: string): Promise<CircuitComponent[]> {
    const prompt = `Identify all electronic components visible in this image: ${originalName}

For each component, provide:
- Component name
- Type/category (passive, active, connector, etc.)
- Visual description
- Typical use case

Format as a numbered list.`;

    const raw = await this.callAI(prompt);
    return this.parseComponents(raw);
  }

  /**
   * Explain circuit connections and signal flow.
   */
  async explainConnections(imagePath: string, originalName: string): Promise<string> {
    const prompt = `Trace the signal flow and connections in this circuit diagram: ${originalName}

Explain:
1. Input signal path
2. Key intermediate stages
3. Output stage
4. Feedback paths (if any)
5. Power distribution

Be detailed and technical.`;

    return await this.callAI(prompt);
  }

  private parseSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionMap: Record<string, string> = {
      'COMPONENTS': 'components',
      'CIRCUIT TYPE': 'circuitType',
      'CIRCUIT DESCRIPTION': 'description',
      'CONNECTIONS': 'connections',
      'PIN DESCRIPTIONS': 'pinDescriptions',
      'PCB GUIDANCE': 'pcbGuidance',
      'WARNINGS': 'warnings',
    };

    let currentSection = '';
    const lines = text.split('\n');

    for (const line of lines) {
      const matchedSection = Object.keys(sectionMap).find((key) =>
        line.toUpperCase().includes(key)
      );
      if (matchedSection) {
        currentSection = sectionMap[matchedSection];
        sections[currentSection] = '';
      } else if (currentSection) {
        sections[currentSection] = (sections[currentSection] || '') + '\n' + line;
      }
    }

    return sections;
  }

  private parseComponents(text: string): CircuitComponent[] {
    const lines = text.split('\n').filter((l) => l.match(/^\d+\.|^-|^•/) && l.trim().length > 5);
    return lines.map((line) => {
      const clean = line.replace(/^\d+\.\s*|^-\s*|^•\s*/, '').trim();
      const parts = clean.split(/[-:,]/);
      return {
        name: parts[0]?.trim() || clean,
        type: parts[1]?.trim() || 'Electronic component',
        description: parts.slice(2).join('-').trim() || clean,
      };
    });
  }

  private parseList(text: string): string[] {
    return text
      .split('\n')
      .filter((l) => l.trim().length > 3)
      .map((l) => l.replace(/^\d+\.\s*|^-\s*|^•\s*/, '').trim())
      .filter(Boolean);
  }
}

export const circuitDiagramService = new CircuitDiagramService();
