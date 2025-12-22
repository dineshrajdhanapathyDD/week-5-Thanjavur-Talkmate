/**
 * Context information for query processing
 */
import { SpeakerType, LocationType } from './ProductDocument';
export interface Context {
    speaker?: SpeakerType;
    location?: LocationType;
    additionalInfo?: string;
}
export interface EnrichedQuery {
    originalQuery: string;
    normalizedQuery: string;
    context: Context;
    detectedLanguage: 'tamil' | 'english' | 'mixed';
    confidence: number;
}
//# sourceMappingURL=Context.d.ts.map