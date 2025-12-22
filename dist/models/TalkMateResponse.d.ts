/**
 * Response structure for TalkMate system
 */
export interface TalkMateResponse {
    simpleEnglishMeaning: string;
    culturalExplanation: string;
    visitorGuidance: string;
    isWithinScope: boolean;
    refusalMessage?: string;
    confidence: number;
    sourceEntries?: string[];
}
export interface ErrorResponse {
    error: true;
    message: string;
    code: string;
    suggestions?: string[];
}
export type SystemResponse = TalkMateResponse | ErrorResponse;
export declare class TalkMateResponseValidator {
    static validateResponse(response: TalkMateResponse): {
        isValid: boolean;
        errors: string[];
    };
    static createValidResponse(meaning: string, explanation: string, guidance: string, confidence: number, sources?: string[]): TalkMateResponse;
    static createRefusalResponse(refusalMessage: string): TalkMateResponse;
    static isErrorResponse(response: SystemResponse): response is ErrorResponse;
    static isTalkMateResponse(response: SystemResponse): response is TalkMateResponse;
}
export declare class ErrorResponseValidator {
    static validateErrorResponse(response: ErrorResponse): {
        isValid: boolean;
        errors: string[];
    };
    static createErrorResponse(message: string, code: string, suggestions?: string[]): ErrorResponse;
}
export declare class TalkMateResponseFormatter {
    static formatForDisplay(response: TalkMateResponse): string;
    static formatErrorForDisplay(error: ErrorResponse): string;
}
//# sourceMappingURL=TalkMateResponse.d.ts.map