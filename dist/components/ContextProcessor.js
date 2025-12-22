"use strict";
/**
 * Context Processor - Handles speaker and location context analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextProcessorImpl = void 0;
class ContextProcessorImpl {
    constructor() {
        this.speakerKeywords = new Map([
            ['shopkeeper', ['shop', 'store', 'vendor', 'seller', 'merchant', 'shopkeeper', 'stall owner']],
            ['auto_driver', ['auto', 'rickshaw', 'driver', 'auto driver', 'auto-rickshaw', 'three wheeler']],
            ['temple_staff', ['priest', 'temple', 'pujari', 'temple staff', 'temple worker', 'temple guide']],
            ['elderly_local', ['elderly', 'old', 'senior', 'elder', 'grandmother', 'grandfather', 'aunty', 'uncle']]
        ]);
        this.locationKeywords = new Map([
            ['temple_streets', ['temple street', 'temple road', 'near temple', 'temple area', 'around temple', 'temple vicinity']],
            ['markets', ['market', 'bazaar', 'shopping', 'commercial', 'market area', 'shopping street']],
            ['public_areas', ['public', 'street', 'road', 'park', 'square', 'public area', 'common area']]
        ]);
        this.tamilIndicators = [
            'அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ',
            'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன'
        ];
    }
    parseSpeakerContext(input) {
        const normalizedInput = input.toLowerCase().trim();
        for (const [speakerType, keywords] of this.speakerKeywords) {
            for (const keyword of keywords) {
                if (normalizedInput.includes(keyword)) {
                    return speakerType;
                }
            }
        }
        return null;
    }
    parseLocationContext(input) {
        const normalizedInput = input.toLowerCase().trim();
        for (const [locationType, keywords] of this.locationKeywords) {
            for (const keyword of keywords) {
                if (normalizedInput.includes(keyword)) {
                    return locationType;
                }
            }
        }
        return null;
    }
    enrichQuery(query, context) {
        const normalizedQuery = this.normalizeText(query);
        const detectedLanguage = this.detectLanguage(query);
        // Calculate confidence based on context completeness and language detection
        let confidence = 0.5; // Base confidence
        if (context.speaker)
            confidence += 0.2;
        if (context.location)
            confidence += 0.2;
        if (context.additionalInfo)
            confidence += 0.1;
        // Boost confidence for clear language detection
        if (detectedLanguage !== 'mixed')
            confidence += 0.1;
        return {
            originalQuery: query,
            normalizedQuery,
            context,
            detectedLanguage,
            confidence: Math.min(confidence, 1.0)
        };
    }
    detectLanguage(text) {
        const tamilCharCount = this.countTamilCharacters(text);
        const totalChars = text.replace(/\s/g, '').length;
        if (totalChars === 0)
            return 'english';
        const tamilRatio = tamilCharCount / totalChars;
        if (tamilRatio > 0.7)
            return 'tamil';
        if (tamilRatio > 0.1)
            return 'mixed';
        return 'english';
    }
    countTamilCharacters(text) {
        let count = 0;
        for (const char of text) {
            if (this.tamilIndicators.some(indicator => char.includes(indicator))) {
                count++;
            }
        }
        return count;
    }
    normalizeText(text) {
        return text.toLowerCase()
            .trim()
            .replace(/[^\w\s\u0B80-\u0BFF]/g, '') // Keep Tamil Unicode range
            .replace(/\s+/g, ' ');
    }
    // Additional helper methods for context analysis
    extractContextFromQuery(query) {
        const context = {};
        // Try to extract speaker context from the query itself
        const speakerFromQuery = this.parseSpeakerContext(query);
        if (speakerFromQuery) {
            context.speaker = speakerFromQuery;
        }
        // Try to extract location context from the query itself
        const locationFromQuery = this.parseLocationContext(query);
        if (locationFromQuery) {
            context.location = locationFromQuery;
        }
        return context;
    }
    combineContexts(primaryContext, secondaryContext) {
        const combined = {};
        const speaker = primaryContext.speaker || secondaryContext.speaker;
        if (speaker) {
            combined.speaker = speaker;
        }
        const location = primaryContext.location || secondaryContext.location;
        if (location) {
            combined.location = location;
        }
        const additionalInfo = [primaryContext.additionalInfo, secondaryContext.additionalInfo]
            .filter(Boolean)
            .join(' ')
            .trim();
        if (additionalInfo) {
            combined.additionalInfo = additionalInfo;
        }
        return combined;
    }
    getContextDescription(context) {
        const parts = [];
        if (context.speaker) {
            parts.push(`Speaker: ${context.speaker.replace('_', ' ')}`);
        }
        if (context.location) {
            parts.push(`Location: ${context.location.replace('_', ' ')}`);
        }
        if (context.additionalInfo) {
            parts.push(`Additional: ${context.additionalInfo}`);
        }
        return parts.join(', ') || 'No specific context';
    }
}
exports.ContextProcessorImpl = ContextProcessorImpl;
//# sourceMappingURL=ContextProcessor.js.map