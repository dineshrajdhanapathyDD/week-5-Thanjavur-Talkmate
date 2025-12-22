/**
 * Context Processor - Handles speaker and location context analysis
 */
import { SpeakerType, LocationType, Context, EnrichedQuery } from '../models';
export interface ContextProcessor {
    parseSpeakerContext(input: string): SpeakerType | null;
    parseLocationContext(input: string): LocationType | null;
    enrichQuery(query: string, context: Context): EnrichedQuery;
    detectLanguage(text: string): 'tamil' | 'english' | 'mixed';
}
export declare class ContextProcessorImpl implements ContextProcessor {
    private speakerKeywords;
    private locationKeywords;
    private tamilIndicators;
    parseSpeakerContext(input: string): SpeakerType | null;
    parseLocationContext(input: string): LocationType | null;
    enrichQuery(query: string, context: Context): EnrichedQuery;
    detectLanguage(text: string): 'tamil' | 'english' | 'mixed';
    private countTamilCharacters;
    private normalizeText;
    extractContextFromQuery(query: string): Context;
    combineContexts(primaryContext: Context, secondaryContext: Context): Context;
    getContextDescription(context: Context): string;
}
//# sourceMappingURL=ContextProcessor.d.ts.map