"use strict";
/**
 * Response Formatter - Handles response formatting and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
class ResponseFormatter {
    formatSuccessResponse(matches, query, additionalContext, additionalGuidance) {
        if (matches.length === 0) {
            return this.formatNoMatchResponse(query);
        }
        const bestMatch = matches[0];
        if (!bestMatch) {
            return this.formatNoMatchResponse(query);
        }
        const entry = bestMatch.entry;
        let culturalExplanation = entry.culturalMeaning;
        if (additionalContext) {
            culturalExplanation += ` ${additionalContext}`;
        }
        let visitorGuidance = entry.visitorAdvice;
        if (additionalGuidance) {
            visitorGuidance += ` ${additionalGuidance}`;
        }
        return {
            simpleEnglishMeaning: entry.literalMeaning,
            culturalExplanation,
            visitorGuidance,
            isWithinScope: true,
            confidence: bestMatch.relevanceScore,
            sourceEntries: matches.map(m => m.entry.phrase)
        };
    }
    formatNoMatchResponse(query) {
        return {
            simpleEnglishMeaning: 'I don\'t have specific information about this phrase in my Thanjavur knowledge base.',
            culturalExplanation: 'This might be a very local expression or a new phrase that hasn\'t been documented yet. Local expressions can vary even within Thanjavur.',
            visitorGuidance: 'Try asking a local person directly for clarification, or provide more context about where and when you heard this phrase.',
            isWithinScope: true,
            confidence: 0.1,
            sourceEntries: []
        };
    }
    formatScopeRefusalResponse(reason, refusalMessage) {
        return {
            simpleEnglishMeaning: '',
            culturalExplanation: '',
            visitorGuidance: '',
            isWithinScope: false,
            refusalMessage,
            confidence: 1.0,
            sourceEntries: []
        };
    }
    formatErrorResponse(message, code, suggestions) {
        const response = {
            error: true,
            message,
            code
        };
        if (suggestions && suggestions.length > 0) {
            response.suggestions = suggestions;
        }
        return response;
    }
    validateResponseStructure(response) {
        // Check required fields for successful responses
        if (response.isWithinScope && !response.refusalMessage) {
            return !!(response.simpleEnglishMeaning &&
                response.culturalExplanation &&
                response.visitorGuidance &&
                typeof response.confidence === 'number' &&
                Array.isArray(response.sourceEntries));
        }
        // Check required fields for refusal responses
        if (!response.isWithinScope) {
            return !!(response.refusalMessage && typeof response.confidence === 'number');
        }
        return false;
    }
    formatResponseForDisplay(response) {
        if ('error' in response) {
            let display = `❌ ${response.message}`;
            if (response.suggestions && response.suggestions.length > 0) {
                display += `\n\n💡 Suggestions:\n${response.suggestions.map(s => `• ${s}`).join('\n')}`;
            }
            return display;
        }
        if (!response.isWithinScope) {
            return `🚫 ${response.refusalMessage}`;
        }
        let display = `📝 **Meaning:** ${response.simpleEnglishMeaning}\n\n`;
        display += `🏛️ **Cultural Context:** ${response.culturalExplanation}\n\n`;
        display += `🧭 **Visitor Guidance:** ${response.visitorGuidance}`;
        if (response.confidence < 0.7) {
            display += `\n\n⚠️ *Note: This interpretation has moderate confidence (${Math.round(response.confidence * 100)}%). Consider asking for more context.*`;
        }
        return display;
    }
}
exports.ResponseFormatter = ResponseFormatter;
//# sourceMappingURL=ResponseFormatter.js.map