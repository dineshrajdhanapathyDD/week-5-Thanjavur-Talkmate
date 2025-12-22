/**
 * Document Knowledge Engine - Core component for product.md processing
 */
import { ProductDocument, SlangEntry, Context } from '../models';
export interface ContentMatch {
    entry: SlangEntry;
    relevanceScore: number;
    matchType: 'exact' | 'partial' | 'contextual';
}
export interface DocumentKnowledgeEngine {
    loadProductDocument(filePath?: string): Promise<ProductDocument>;
    validateScope(query: string): boolean;
    findRelevantContent(query: string, context: Context): ContentMatch[];
    getSlangTranslation(phrase: string): SlangEntry | null;
    isInitialized(): boolean;
}
export declare class DocumentKnowledgeEngineImpl implements DocumentKnowledgeEngine {
    private productDocument;
    private initialized;
    private documentParser;
    private scopeValidator;
    private phraseIndex;
    constructor();
    loadProductDocument(filePath?: string): Promise<ProductDocument>;
    validateScope(query: string): boolean;
    findRelevantContent(query: string, context: Context): ContentMatch[];
    getSlangTranslation(phrase: string): SlangEntry | null;
    isInitialized(): boolean;
    private buildPhraseIndex;
    private normalizeQuery;
    private findExactMatches;
    private findPartialMatches;
    private findContextualMatches;
    private deduplicateMatches;
}
//# sourceMappingURL=DocumentKnowledgeEngine.d.ts.map