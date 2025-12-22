"use strict";
/**
 * AI Service - Integrates with free AI models for intelligent responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
exports.createAIService = createAIService;
class AIService {
    constructor(config) {
        this.productDocument = null;
        this.config = {
            provider: config.provider,
            apiKey: config.apiKey || process.env.AI_API_KEY || '',
            model: config.model || this.getDefaultModel(config.provider),
            baseUrl: config.baseUrl || this.getDefaultBaseUrl(config.provider)
        };
    }
    setProductDocument(document) {
        this.productDocument = document;
    }
    async generateResponse(query, context) {
        if (!this.productDocument) {
            throw new Error('Product document not loaded');
        }
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildUserPrompt(query, context);
        switch (this.config.provider) {
            case 'groq':
                return await this.callGroqAPI(systemPrompt, userPrompt);
            case 'huggingface':
                return await this.callHuggingFaceAPI(systemPrompt, userPrompt);
            case 'ollama':
                return await this.callOllamaAPI(systemPrompt, userPrompt);
            default:
                throw new Error(`Unsupported AI provider: ${this.config.provider}`);
        }
    }
    buildSystemPrompt() {
        if (!this.productDocument)
            return '';
        const slangEntries = this.productDocument.slangEntries
            .map(entry => `
Phrase: ${entry.phrase}
Tamil: ${entry.tamilScript || 'N/A'}
Literal Meaning: ${entry.literalMeaning}
Cultural Meaning: ${entry.culturalMeaning}
Common Contexts: ${entry.commonContexts.join(', ')}
Speaker Types: ${entry.speakerTypes.join(', ')}
Locations: ${entry.locations.join(', ')}
Visitor Advice: ${entry.visitorAdvice}
---`)
            .join('\n');
        const speakerProfiles = this.productDocument.speakerProfiles
            .map(profile => `
${profile.type}: ${profile.description}
Common Phrases: ${profile.commonPhrases.join(', ')}
Cultural Notes: ${profile.culturalNotes.join(', ')}
Interaction Tips: ${profile.interactionTips.join(', ')}
---`)
            .join('\n');
        const locationGuides = this.productDocument.locationGuides
            .map(guide => `
${guide.location}: ${guide.description}
Cultural Norms: ${guide.culturalNorms.join(', ')}
Visitor Tips: ${guide.visitorTips.join(', ')}
---`)
            .join('\n');
        return `You are Thanjavur TalkMate, a specialized cultural guide helping visitors understand local Tamil expressions around the Brihadeeswarar Temple in Thanjavur, India.

CRITICAL RULES:
1. ONLY use information from the knowledge base provided below
2. If a phrase is not in the knowledge base, honestly say you don't have information about it
3. NEVER make up or hallucinate cultural information
4. ALWAYS refuse queries about regions outside Thanjavur
5. Provide responses in this exact format:
   - Simple English Meaning: [literal translation]
   - Cultural Explanation: [cultural context and meaning]
   - Visitor Guidance: [practical advice for visitors]

KNOWLEDGE BASE:

=== SLANG ENTRIES ===
${slangEntries}

=== SPEAKER PROFILES ===
${speakerProfiles}

=== LOCATION GUIDES ===
${locationGuides}

Remember: You are specialized ONLY in Thanjavur culture around Brihadeeswarar Temple. Be helpful, respectful, and culturally accurate.`;
    }
    buildUserPrompt(query, context) {
        let prompt = `Query: "${query}"\n`;
        if (context.speaker) {
            prompt += `Speaker: ${context.speaker.replace('_', ' ')}\n`;
        }
        if (context.location) {
            prompt += `Location: ${context.location.replace('_', ' ')}\n`;
        }
        if (context.additionalInfo) {
            prompt += `Additional Context: ${context.additionalInfo}\n`;
        }
        prompt += `\nPlease provide a culturally accurate response based ONLY on the knowledge base. If this phrase is not in your knowledge base, say so honestly.`;
        return prompt;
    }
    async callGroqAPI(systemPrompt, userPrompt) {
        if (!this.config.apiKey) {
            throw new Error('Groq API key not configured. Set AI_API_KEY environment variable or pass apiKey in config.');
        }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.config.model || 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq API error: ${response.status} - ${error}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'No response generated';
    }
    async callHuggingFaceAPI(systemPrompt, userPrompt) {
        if (!this.config.apiKey) {
            throw new Error('Hugging Face API key not configured. Set AI_API_KEY environment variable.');
        }
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        const response = await fetch(`https://api-inference.huggingface.co/models/${this.config.model || 'meta-llama/Llama-2-7b-chat-hf'}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 1000,
                    temperature: 0.3,
                    return_full_text: false
                }
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
        }
        const data = await response.json();
        return data[0]?.generated_text || 'No response generated';
    }
    async callOllamaAPI(systemPrompt, userPrompt) {
        const baseUrl = this.config.baseUrl || 'http://localhost:11434';
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.config.model || 'llama2',
                prompt: `${systemPrompt}\n\n${userPrompt}`,
                stream: false,
                options: {
                    temperature: 0.3,
                    num_predict: 1000
                }
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Ollama API error: ${response.status} - ${error}`);
        }
        const data = await response.json();
        return data.response || 'No response generated';
    }
    getDefaultModel(provider) {
        switch (provider) {
            case 'groq':
                return 'llama-3.1-8b-instant';
            case 'huggingface':
                return 'meta-llama/Llama-2-7b-chat-hf';
            case 'ollama':
                return 'llama2';
            default:
                return 'llama2';
        }
    }
    getDefaultBaseUrl(provider) {
        switch (provider) {
            case 'groq':
                return 'https://api.groq.com/openai/v1';
            case 'huggingface':
                return 'https://api-inference.huggingface.co';
            case 'ollama':
                return 'http://localhost:11434';
            default:
                return '';
        }
    }
    parseAIResponse(aiResponse) {
        // Parse the AI response to extract the three required sections
        const meaningMatch = aiResponse.match(/Simple English Meaning:\s*(.+?)(?=\n|Cultural Explanation:|$)/is);
        const culturalMatch = aiResponse.match(/Cultural Explanation:\s*(.+?)(?=\n|Visitor Guidance:|$)/is);
        const guidanceMatch = aiResponse.match(/Visitor Guidance:\s*(.+?)$/is);
        return {
            simpleEnglishMeaning: meaningMatch?.[1]?.trim() || 'Unable to parse meaning from AI response',
            culturalExplanation: culturalMatch?.[1]?.trim() || 'Unable to parse cultural explanation from AI response',
            visitorGuidance: guidanceMatch?.[1]?.trim() || 'Unable to parse visitor guidance from AI response'
        };
    }
}
exports.AIService = AIService;
function createAIService(config) {
    const defaultConfig = {
        provider: process.env.AI_PROVIDER || 'groq'
    };
    if (process.env.AI_API_KEY) {
        defaultConfig.apiKey = process.env.AI_API_KEY;
    }
    if (process.env.AI_MODEL) {
        defaultConfig.model = process.env.AI_MODEL;
    }
    return new AIService({ ...defaultConfig, ...config });
}
//# sourceMappingURL=AIService.js.map