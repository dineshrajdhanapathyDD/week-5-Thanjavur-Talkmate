/**
 * AI Service - Integrates with free AI models for intelligent responses
 */
import { ProductDocument, Context } from '../models';
export interface AIServiceConfig {
    provider: 'groq' | 'huggingface' | 'ollama';
    apiKey?: string;
    model?: string;
    baseUrl?: string;
}
export declare class AIService {
    private config;
    private productDocument;
    constructor(config: AIServiceConfig);
    setProductDocument(document: ProductDocument): void;
    generateResponse(query: string, context: Context): Promise<string>;
    private buildSystemPrompt;
    private buildUserPrompt;
    private callGroqAPI;
    private callHuggingFaceAPI;
    private callOllamaAPI;
    private getDefaultModel;
    private getDefaultBaseUrl;
    parseAIResponse(aiResponse: string): {
        simpleEnglishMeaning: string;
        culturalExplanation: string;
        visitorGuidance: string;
    };
}
export declare function createAIService(config?: Partial<AIServiceConfig>): AIService;
//# sourceMappingURL=AIService.d.ts.map