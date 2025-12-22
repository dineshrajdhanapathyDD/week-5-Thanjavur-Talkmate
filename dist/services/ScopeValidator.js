"use strict";
/**
 * Scope Validator - Ensures queries are within Thanjavur scope
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeValidator = void 0;
class ScopeValidator {
    constructor() {
        this.thanjavurKeywords = [
            'thanjavur', 'tanjore', 'brihadeeswarar', 'brihadeeswara', 'big temple',
            'periya kovil', 'rajaraja', 'chola', 'temple', 'kovil'
        ];
        this.nonThanjavurKeywords = [
            'chennai', 'madras', 'bangalore', 'mumbai', 'delhi', 'kolkata',
            'hyderabad', 'pune', 'coimbatore', 'salem', 'trichy', 'madurai',
            'kanyakumari', 'ooty', 'kodaikanal', 'pondicherry', 'puducherry'
        ];
        this.genericTamilKeywords = [
            'tamil nadu', 'south india', 'india', 'indian', 'tamil culture',
            'dravidian', 'south indian'
        ];
    }
    validateThanjavurScope(query) {
        const normalizedQuery = query.toLowerCase().trim();
        // Check for explicit non-Thanjavur locations
        for (const keyword of this.nonThanjavurKeywords) {
            if (normalizedQuery.includes(keyword)) {
                return {
                    isValid: false,
                    reason: `This query appears to be about ${keyword}, which is outside Thanjavur region.`
                };
            }
        }
        // Check for generic Tamil/Indian references without Thanjavur context
        const hasGenericReference = this.genericTamilKeywords.some(keyword => normalizedQuery.includes(keyword));
        const hasThanjavurReference = this.thanjavurKeywords.some(keyword => normalizedQuery.includes(keyword));
        if (hasGenericReference && !hasThanjavurReference) {
            return {
                isValid: false,
                reason: 'This query seems to be about general Tamil culture rather than specific to Thanjavur.'
            };
        }
        // If no location indicators, assume it's about local Thanjavur context
        // This allows for slang queries without explicit location mentions
        return { isValid: true };
    }
    generateRefusalMessage(query, reason) {
        const baseMessage = "I'm specialized in helping visitors understand local expressions and culture specifically in Thanjavur, particularly around the Brihadeeswarar Temple area.";
        if (reason) {
            return `${baseMessage} ${reason} I'd be happy to help with any questions about Thanjavur local culture and expressions instead!`;
        }
        return `${baseMessage} I'd be happy to help with any questions about Thanjavur local culture and expressions!`;
    }
    isLocalSlangQuery(query) {
        const slangIndicators = [
            'what does', 'what means', 'meaning of', 'translate', 'said',
            'told me', 'heard', 'expression', 'phrase', 'slang'
        ];
        const normalizedQuery = query.toLowerCase();
        return slangIndicators.some(indicator => normalizedQuery.includes(indicator));
    }
}
exports.ScopeValidator = ScopeValidator;
//# sourceMappingURL=ScopeValidator.js.map