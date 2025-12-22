/**
 * Document Knowledge Engine - Core component for product.md processing
 */

import * as path from 'path';
import { ProductDocument, SlangEntry, Context } from '../models';
import { DocumentParser } from '../services/DocumentParser';
import { ScopeValidator } from '../services/ScopeValidator';

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

export class DocumentKnowledgeEngineImpl implements DocumentKnowledgeEngine {
  private productDocument: ProductDocument | null = null;
  private initialized = false;
  private documentParser: DocumentParser;
  private scopeValidator: ScopeValidator;
  private phraseIndex: Map<string, SlangEntry[]> = new Map();

  constructor() {
    this.documentParser = new DocumentParser();
    this.scopeValidator = new ScopeValidator();
  }

  async loadProductDocument(filePath?: string): Promise<ProductDocument> {
    const defaultPath = path.join(process.cwd(), 'data', 'product.md');
    const documentPath = filePath || defaultPath;

    try {
      this.productDocument = await this.documentParser.parseProductDocument(documentPath);
      this.buildPhraseIndex();
      this.initialized = true;
      return this.productDocument;
    } catch (error) {
      this.initialized = false;
      throw error;
    }
  }

  validateScope(query: string): boolean {
    const validation = this.scopeValidator.validateThanjavurScope(query);
    return validation.isValid;
  }

  findRelevantContent(query: string, context: Context): ContentMatch[] {
    if (!this.productDocument) {
      return [];
    }

    const normalizedQuery = this.normalizeQuery(query);
    const matches: ContentMatch[] = [];

    // Find exact phrase matches
    const exactMatches = this.findExactMatches(normalizedQuery);
    matches.push(...exactMatches);

    // Find partial matches
    const partialMatches = this.findPartialMatches(normalizedQuery);
    matches.push(...partialMatches);

    // Find contextual matches based on speaker/location
    const contextualMatches = this.findContextualMatches(normalizedQuery, context);
    matches.push(...contextualMatches);

    // Remove duplicates and sort by relevance
    const uniqueMatches = this.deduplicateMatches(matches);
    return uniqueMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  getSlangTranslation(phrase: string): SlangEntry | null {
    if (!this.productDocument) {
      return null;
    }

    const normalizedPhrase = this.normalizeQuery(phrase);
    const entries = this.phraseIndex.get(normalizedPhrase);
    
    if (entries && entries.length > 0) {
      return entries[0] || null; // Return the first (most relevant) entry
    }

    // Try partial matching
    for (const [indexedPhrase, entries] of this.phraseIndex) {
      if (indexedPhrase.includes(normalizedPhrase) || normalizedPhrase.includes(indexedPhrase)) {
        return entries[0] || null;
      }
    }

    return null;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private buildPhraseIndex(): void {
    if (!this.productDocument) return;

    this.phraseIndex.clear();

    for (const entry of this.productDocument.slangEntries) {
      const normalizedPhrase = this.normalizeQuery(entry.phrase);
      
      if (!this.phraseIndex.has(normalizedPhrase)) {
        this.phraseIndex.set(normalizedPhrase, []);
      }
      this.phraseIndex.get(normalizedPhrase)!.push(entry);

      // Also index by Tamil script if available
      if (entry.tamilScript) {
        const normalizedTamil = this.normalizeQuery(entry.tamilScript);
        if (!this.phraseIndex.has(normalizedTamil)) {
          this.phraseIndex.set(normalizedTamil, []);
        }
        this.phraseIndex.get(normalizedTamil)!.push(entry);
      }
    }
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  private findExactMatches(normalizedQuery: string): ContentMatch[] {
    const matches: ContentMatch[] = [];
    
    for (const [phrase, entries] of this.phraseIndex) {
      if (phrase === normalizedQuery) {
        for (const entry of entries) {
          matches.push({
            entry,
            relevanceScore: 1.0,
            matchType: 'exact'
          });
        }
      }
    }

    return matches;
  }

  private findPartialMatches(normalizedQuery: string): ContentMatch[] {
    const matches: ContentMatch[] = [];
    const queryWords = normalizedQuery.split(' ');

    for (const [phrase, entries] of this.phraseIndex) {
      const phraseWords = phrase.split(' ');
      const commonWords = queryWords.filter(word => phraseWords.includes(word));
      
      if (commonWords.length > 0) {
        const relevanceScore = commonWords.length / Math.max(queryWords.length, phraseWords.length);
        
        // Only include if relevance is above threshold
        if (relevanceScore >= 0.3) {
          for (const entry of entries) {
            matches.push({
              entry,
              relevanceScore,
              matchType: 'partial'
            });
          }
        }
      }
    }

    return matches;
  }

  private findContextualMatches(normalizedQuery: string, context: Context): ContentMatch[] {
    if (!this.productDocument) return [];

    const matches: ContentMatch[] = [];

    // Find entries that match the context even if query doesn't match exactly
    for (const entry of this.productDocument.slangEntries) {
      let contextScore = 0;
      let contextFactors = 0;

      // Check speaker context
      if (context.speaker && entry.speakerTypes.includes(context.speaker)) {
        contextScore += 0.5;
        contextFactors++;
      }

      // Check location context
      if (context.location && entry.locations.includes(context.location)) {
        contextScore += 0.5;
        contextFactors++;
      }

      // Check if query relates to common contexts
      const queryInContexts = entry.commonContexts.some(ctx => 
        ctx.toLowerCase().includes(normalizedQuery) || 
        normalizedQuery.includes(ctx.toLowerCase())
      );

      if (queryInContexts) {
        contextScore += 0.3;
        contextFactors++;
      }

      // Only include if there's meaningful context match
      if (contextFactors > 0 && contextScore >= 0.3) {
        matches.push({
          entry,
          relevanceScore: contextScore / Math.max(contextFactors, 1),
          matchType: 'contextual'
        });
      }
    }

    return matches;
  }

  private deduplicateMatches(matches: ContentMatch[]): ContentMatch[] {
    const seen = new Set<string>();
    const unique: ContentMatch[] = [];

    for (const match of matches) {
      const key = match.entry.phrase;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(match);
      } else {
        // If we've seen this entry before, keep the one with higher relevance
        const existingIndex = unique.findIndex(m => m.entry.phrase === key);
        if (existingIndex >= 0 && unique[existingIndex] && match.relevanceScore > unique[existingIndex].relevanceScore) {
          unique[existingIndex] = match;
        }
      }
    }

    return unique;
  }
}