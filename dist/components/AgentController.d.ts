/**
 * Agent Controller - Main orchestration layer for query processing
 */
import { Context, TalkMateResponse, SystemResponse } from '../models';
import { DocumentKnowledgeEngine } from './DocumentKnowledgeEngine';
import { ContextProcessor } from './ContextProcessor';
import { AIService } from '../services/AIService';
export interface AgentController {
    processQuery(query: string, context?: Context): Promise<SystemResponse>;
    validateThanjavurScope(query: string): boolean;
    generateCulturalResponse(query: string, context: Context): Promise<TalkMateResponse>;
    initialize(): Promise<void>;
}
export declare class AgentControllerImpl implements AgentController {
    private knowledgeEngine;
    private scopeValidator;
    private responseFormatter;
    private contextProcessor;
    private aiService;
    private useAI;
    constructor(knowledgeEngine: DocumentKnowledgeEngine, contextProcessor?: ContextProcessor, aiService?: AIService);
    initialize(): Promise<void>;
    processQuery(query: string, context?: Context): Promise<SystemResponse>;
    validateThanjavurScope(query: string): boolean;
    generateCulturalResponse(query: string, context: Context): Promise<TalkMateResponse>;
    private enrichContextFromQuery;
    private getAdditionalCulturalContext;
    private getAdditionalVisitorGuidance;
    getSystemStatus(): {
        initialized: boolean;
        contextDescription: string;
        aiEnabled: boolean;
    };
}
//# sourceMappingURL=AgentController.d.ts.map