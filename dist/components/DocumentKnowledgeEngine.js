"use strict";
/**
 * Document Knowledge Engine - Core component for product.md processing
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentKnowledgeEngineImpl = void 0;
const path = __importStar(require("path"));
const DocumentParser_1 = require("../services/DocumentParser");
const ScopeValidator_1 = require("../services/ScopeValidator");
class DocumentKnowledgeEngineImpl {
    constructor() {
        this.productDocument = null;
        this.initialized = false;
        this.phraseIndex = new Map();
        this.documentParser = new DocumentParser_1.DocumentParser();
        this.scopeValidator = new ScopeValidator_1.ScopeValidator();
    }
    async loadProductDocument(filePath) {
        const defaultPath = path.join(process.cwd(), 'data', 'product.md');
        const documentPath = filePath || defaultPath;
        try {
            this.productDocument = await this.documentParser.parseProductDocument(documentPath);
            this.buildPhraseIndex();
            this.initialized = true;
            return this.productDocument;
        }
        catch (error) {
            this.initialized = false;
            throw error;
        }
    }
    validateScope(query) {
        const validation = this.scopeValidator.validateThanjavurScope(query);
        return validation.isValid;
    }
    findRelevantContent(query, context) {
        if (!this.productDocument) {
            return [];
        }
        const normalizedQuery = this.normalizeQuery(query);
        const matches = [];
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
    getSlangTranslation(phrase) {
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
    isInitialized() {
        return this.initialized;
    }
    buildPhraseIndex() {
        if (!this.productDocument)
            return;
        this.phraseIndex.clear();
        for (const entry of this.productDocument.slangEntries) {
            const normalizedPhrase = this.normalizeQuery(entry.phrase);
            if (!this.phraseIndex.has(normalizedPhrase)) {
                this.phraseIndex.set(normalizedPhrase, []);
            }
            this.phraseIndex.get(normalizedPhrase).push(entry);
            // Also index by Tamil script if available
            if (entry.tamilScript) {
                const normalizedTamil = this.normalizeQuery(entry.tamilScript);
                if (!this.phraseIndex.has(normalizedTamil)) {
                    this.phraseIndex.set(normalizedTamil, []);
                }
                this.phraseIndex.get(normalizedTamil).push(entry);
            }
        }
    }
    normalizeQuery(query) {
        return query.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' '); // Normalize whitespace
    }
    findExactMatches(normalizedQuery) {
        const matches = [];
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
    findPartialMatches(normalizedQuery) {
        const matches = [];
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
    findContextualMatches(normalizedQuery, context) {
        if (!this.productDocument)
            return [];
        const matches = [];
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
            const queryInContexts = entry.commonContexts.some(ctx => ctx.toLowerCase().includes(normalizedQuery) ||
                normalizedQuery.includes(ctx.toLowerCase()));
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
    deduplicateMatches(matches) {
        const seen = new Set();
        const unique = [];
        for (const match of matches) {
            const key = match.entry.phrase;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(match);
            }
            else {
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
exports.DocumentKnowledgeEngineImpl = DocumentKnowledgeEngineImpl;
//# sourceMappingURL=DocumentKnowledgeEngine.js.map