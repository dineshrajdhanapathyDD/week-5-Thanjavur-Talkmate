/**
 * Scope Validator - Ensures queries are within Thanjavur scope
 */
export declare class ScopeValidator {
    private thanjavurKeywords;
    private nonThanjavurKeywords;
    private genericTamilKeywords;
    validateThanjavurScope(query: string): {
        isValid: boolean;
        reason?: string;
    };
    generateRefusalMessage(query: string, reason?: string): string;
    isLocalSlangQuery(query: string): boolean;
}
//# sourceMappingURL=ScopeValidator.d.ts.map