"use strict";
/**
 * Response structure for TalkMate system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalkMateResponseFormatter = exports.ErrorResponseValidator = exports.TalkMateResponseValidator = void 0;
class TalkMateResponseValidator {
    static validateResponse(response) {
        const errors = [];
        // Check confidence range
        if (response.confidence < 0 || response.confidence > 1) {
            errors.push('Confidence must be between 0 and 1');
        }
        // Check scope-specific requirements
        if (response.isWithinScope) {
            if (!response.simpleEnglishMeaning?.trim()) {
                errors.push('Simple English meaning is required for in-scope responses');
            }
            if (!response.culturalExplanation?.trim()) {
                errors.push('Cultural explanation is required for in-scope responses');
            }
            if (!response.visitorGuidance?.trim()) {
                errors.push('Visitor guidance is required for in-scope responses');
            }
            if (response.refusalMessage) {
                errors.push('Refusal message should not be present for in-scope responses');
            }
        }
        else {
            if (!response.refusalMessage?.trim()) {
                errors.push('Refusal message is required for out-of-scope responses');
            }
            if (response.simpleEnglishMeaning?.trim() ||
                response.culturalExplanation?.trim() ||
                response.visitorGuidance?.trim()) {
                errors.push('Content fields should be empty for out-of-scope responses');
            }
        }
        // Check source entries
        if (response.sourceEntries && !Array.isArray(response.sourceEntries)) {
            errors.push('Source entries must be an array');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static createValidResponse(meaning, explanation, guidance, confidence, sources) {
        const response = {
            simpleEnglishMeaning: meaning.trim(),
            culturalExplanation: explanation.trim(),
            visitorGuidance: guidance.trim(),
            isWithinScope: true,
            confidence: Math.max(0, Math.min(1, confidence))
        };
        if (sources && sources.length > 0) {
            response.sourceEntries = sources;
        }
        return response;
    }
    static createRefusalResponse(refusalMessage) {
        return {
            simpleEnglishMeaning: '',
            culturalExplanation: '',
            visitorGuidance: '',
            isWithinScope: false,
            refusalMessage: refusalMessage.trim(),
            confidence: 1.0,
            sourceEntries: []
        };
    }
    static isErrorResponse(response) {
        return 'error' in response && response.error === true;
    }
    static isTalkMateResponse(response) {
        return !this.isErrorResponse(response);
    }
}
exports.TalkMateResponseValidator = TalkMateResponseValidator;
class ErrorResponseValidator {
    static validateErrorResponse(response) {
        const errors = [];
        if (!response.error) {
            errors.push('Error flag must be true');
        }
        if (!response.message?.trim()) {
            errors.push('Error message is required');
        }
        if (!response.code?.trim()) {
            errors.push('Error code is required');
        }
        if (response.suggestions && !Array.isArray(response.suggestions)) {
            errors.push('Suggestions must be an array');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static createErrorResponse(message, code, suggestions) {
        const response = {
            error: true,
            message: message.trim(),
            code: code.toUpperCase()
        };
        if (suggestions && suggestions.length > 0) {
            const filteredSuggestions = suggestions.filter(s => s.trim().length > 0);
            if (filteredSuggestions.length > 0) {
                response.suggestions = filteredSuggestions;
            }
        }
        return response;
    }
}
exports.ErrorResponseValidator = ErrorResponseValidator;
class TalkMateResponseFormatter {
    static formatForDisplay(response) {
        if (!response.isWithinScope) {
            return response.refusalMessage || 'This query is outside my scope of knowledge.';
        }
        const sections = [];
        // Simple meaning section
        sections.push(`**Meaning:** ${response.simpleEnglishMeaning}`);
        // Cultural explanation section
        sections.push(`**Cultural Context:** ${response.culturalExplanation}`);
        // Visitor guidance section
        sections.push(`**Visitor Guidance:** ${response.visitorGuidance}`);
        // Confidence indicator (if low confidence)
        if (response.confidence < 0.7) {
            sections.push(`*Note: I'm ${Math.round(response.confidence * 100)}% confident about this interpretation.*`);
        }
        return sections.join('\n\n');
    }
    static formatErrorForDisplay(error) {
        let message = `**Error:** ${error.message}`;
        if (error.suggestions && error.suggestions.length > 0) {
            message += '\n\n**Suggestions:**\n';
            message += error.suggestions.map(suggestion => `• ${suggestion}`).join('\n');
        }
        return message;
    }
}
exports.TalkMateResponseFormatter = TalkMateResponseFormatter;
//# sourceMappingURL=TalkMateResponse.js.map