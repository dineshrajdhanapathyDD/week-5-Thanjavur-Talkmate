/**
 * Response Formatter - Handles response formatting and validation
 */
import { TalkMateResponse, ErrorResponse, SystemResponse } from '../models';
import { ContentMatch } from '../components/DocumentKnowledgeEngine';
export declare class ResponseFormatter {
    formatSuccessResponse(matches: ContentMatch[], query: string, additionalContext?: string, additionalGuidance?: string): TalkMateResponse;
    formatNoMatchResponse(query: string): TalkMateResponse;
    formatScopeRefusalResponse(reason: string, refusalMessage: string): TalkMateResponse;
    formatErrorResponse(message: string, code: string, suggestions?: string[]): ErrorResponse;
    validateResponseStructure(response: TalkMateResponse): boolean;
    formatResponseForDisplay(response: SystemResponse): string;
}
//# sourceMappingURL=ResponseFormatter.d.ts.map