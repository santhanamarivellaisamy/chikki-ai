import { bootstrapAIGateway } from '../ai';

const aiGateway = bootstrapAIGateway();

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export interface TTSResult {
  audioText: string; // Note: real TTS returns audio bytes; here we describe what to synthesize
  provider: string;
}

export class VoiceProcessingService {
  /**
   * Transcribe audio to text using the AI Gateway.
   * In production, this would send audio bytes to a Speech-to-Text API.
   * For now, we use the AI gateway with a structured prompt.
   */
  async transcribeAudio(
    audioPath: string,
    originalName: string,
    language = 'en'
  ): Promise<TranscriptionResult> {
    // In production with real STT APIs, you'd upload audio and call Whisper/Google STT here.
    // For the mock/AI gateway mode, we simulate this call.
    const message = `[Audio file: ${originalName}]

You are a speech-to-text system. The user uploaded an audio file for transcription.
Language hint: ${language}

Since this is a development/mock environment, respond with:
"[TRANSCRIPTION MOCK] Audio file '${originalName}' received. In production, this would be processed by a Speech-to-Text service (e.g., Google STT, OpenAI Whisper) and return the spoken words as text. Please configure a real STT API key to enable actual transcription."`;

    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message,
    });

    return {
      text: response.response || 'Audio transcription unavailable.',
      language,
    };
  }

  /**
   * Convert text to speech description (in production would return audio bytes).
   */
  async synthesizeSpeech(text: string, voice = 'default', language = 'en-US'): Promise<TTSResult> {
    // In production: call Google TTS, ElevenLabs, or OpenAI TTS
    return {
      audioText: text,
      provider: `TTS provider (voice: ${voice}, language: ${language}) - Configure a TTS API key for audio output`,
    };
  }

  /**
   * Detect language from text snippet.
   */
  async detectLanguage(text: string): Promise<string> {
    const message = `Detect the language of this text and respond ONLY with the ISO 639-1 language code (e.g., "en", "fr", "es", "de", "zh"). Text: "${text.substring(0, 200)}"`;

    const response = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      message,
    });

    const code = response.response?.trim().toLowerCase().replace(/[^a-z]/g, '').substring(0, 5);
    return code || 'en';
  }
}

export const voiceProcessingService = new VoiceProcessingService();
