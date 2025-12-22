/**
 * Agent Controller - Main orchestration layer for query processing
 */

import { Context, TalkMateResponse, SystemResponse } from '../models';
import { DocumentKnowledgeEngine } from './DocumentKnowledgeEngine';
import { ContextProcessor, ContextProcessorImpl } from './ContextProcessor';
import { ScopeValidator, ResponseFormatter } from '../services';
import { AIService, createAIService } from '../services/AIService';

export interface AgentController {
  processQuery(query: string, context?: Context): Promise<SystemResponse>;
  validateThanjavurScope(query: string): boolean;
  generateCulturalResponse(query: string, context: Context): Promise<TalkMateResponse>;
  initialize(): Promise<void>;
}

export class AgentControllerImpl implements AgentController {
  private scopeValidator: ScopeValidator;
  private responseFormatter: ResponseFormatter;
  private contextProcessor: ContextProcessorImpl;
  private aiService: AIService;
  private useAI: boolean;

  constructor(
    private knowledgeEngine: DocumentKnowledgeEngine,
    contextProcessor?: ContextProcessor,
    aiService?: AIService
  ) {
    this.scopeValidator = new ScopeValidator();
    this.responseFormatter = new ResponseFormatter();
    this.contextProcessor = (contextProcessor as ContextProcessorImpl) || new ContextProcessorImpl();
    this.aiService = aiService || createAIService();
    this.useAI = !!(process.env.AI_API_KEY || process.env.ENABLE_AI === 'true');
  }

  async initialize(): Promise<void> {
    try {
      if (!this.knowledgeEngine.isInitialized()) {
        const productDocument = await this.knowledgeEngine.loadProductDocument();
        
        // Initialize AI service with product document
        if (this.useAI) {
          this.aiService.setProductDocument(productDocument);
        }
      }
    } catch (error) {
      throw new Error(`Failed to initialize TalkMate: ${error}`);
    }
  }

  async processQuery(query: string, context?: Context): Promise<SystemResponse> {
    try {
      // Validate input
      if (!query || query.trim().length === 0) {
        return this.responseFormatter.formatErrorResponse(
          'Please provide a phrase or expression to translate.',
          'EMPTY_QUERY',
          ['Try asking about a specific Tamil phrase you heard', 'Include context about where you heard it']
        );
      }

      // Check if system is initialized
      if (!this.knowledgeEngine.isInitialized()) {
        return this.responseFormatter.formatErrorResponse(
          'TalkMate is not properly initialized. Please try again.',
          'NOT_INITIALIZED',
          ['Wait a moment and try again', 'Contact support if the problem persists']
        );
      }

      // Validate scope
      if (!this.validateThanjavurScope(query)) {
        const scopeValidation = this.scopeValidator.validateThanjavurScope(query);
        const refusalMessage = this.scopeValidator.generateRefusalMessage(query, scopeValidation.reason);
        return this.responseFormatter.formatScopeRefusalResponse(scopeValidation.reason || '', refusalMessage);
      }

      // Enrich context
      const enrichedContext = this.enrichContextFromQuery(query, context);

      // Generate cultural response
      return await this.generateCulturalResponse(query, enrichedContext);

    } catch (error) {
      console.error('Error processing query:', error);
      return this.responseFormatter.formatErrorResponse(
        'An error occurred while processing your query. Please try again.',
        'PROCESSING_ERROR',
        ['Try rephrasing your question', 'Check if your query is about Thanjavur']
      );
    }
  }

  validateThanjavurScope(query: string): boolean {
    const validation = this.scopeValidator.validateThanjavurScope(query);
    return validation.isValid;
  }

  async generateCulturalResponse(query: string, context: Context): Promise<TalkMateResponse> {
    try {
      // Try AI-powered response first if enabled
      if (this.useAI) {
        try {
          const aiResponse = await this.aiService.generateResponse(query, context);
          const parsedResponse = this.aiService.parseAIResponse(aiResponse);
          
          // Check if AI found the information
          const hasValidResponse = !parsedResponse.simpleEnglishMeaning.toLowerCase().includes('don\'t have information') &&
                                 !parsedResponse.simpleEnglishMeaning.toLowerCase().includes('not in');

          if (hasValidResponse) {
            return {
              simpleEnglishMeaning: parsedResponse.simpleEnglishMeaning,
              culturalExplanation: parsedResponse.culturalExplanation,
              visitorGuidance: parsedResponse.visitorGuidance,
              isWithinScope: true,
              confidence: 0.85, // High confidence for AI responses
              sourceEntries: ['AI-generated from knowledge base']
            };
          }
        } catch (aiError) {
          console.warn('AI service failed, falling back to document matching:', aiError);
        }
      }

      // Fallback to document-based matching
      const matches = this.knowledgeEngine.findRelevantContent(query, context);

      if (matches.length > 0) {
        // Get additional cultural context based on speaker/location
        const additionalContext = this.getAdditionalCulturalContext(context);
        const additionalGuidance = this.getAdditionalVisitorGuidance(context);

        // Format the response
        const response = this.responseFormatter.formatSuccessResponse(
          matches,
          query,
          additionalContext,
          additionalGuidance
        );

        // Validate response structure
        if (!this.responseFormatter.validateResponseStructure(response)) {
          throw new Error('Generated response does not meet structure requirements');
        }

        return response;
      }

      // No matches found - return fallback response
      return this.responseFormatter.formatNoMatchResponse(query);

    } catch (error) {
      console.error('Error generating cultural response:', error);
      
      // Return a fallback response
      return this.responseFormatter.formatNoMatchResponse(query);
    }
  }

  private enrichContextFromQuery(query: string, providedContext?: Context): Context {
    // Extract context from the query itself
    const queryContext = this.contextProcessor.extractContextFromQuery(query);
    
    // Combine with provided context (provided context takes precedence)
    const enrichedContext = this.contextProcessor.combineContexts(queryContext, providedContext || {});

    return enrichedContext;
  }

  private getAdditionalCulturalContext(context: Context): string | undefined {
    const contextParts: string[] = [];

    if (context.speaker) {
      switch (context.speaker) {
        case 'shopkeeper':
          contextParts.push('Shopkeepers in Thanjavur often use friendly, business-oriented expressions to build rapport with customers.');
          break;
        case 'auto_driver':
          contextParts.push('Auto drivers are known for their direct, practical communication style and local knowledge.');
          break;
        case 'temple_staff':
          contextParts.push('Temple staff use respectful, traditional language that reflects the sacred nature of their work.');
          break;
        case 'elderly_local':
          contextParts.push('Elderly locals often use traditional expressions that carry deep cultural significance.');
          break;
      }
    }

    if (context.location) {
      switch (context.location) {
        case 'temple_streets':
          contextParts.push('Around the temple area, conversations often have a more respectful and traditional tone.');
          break;
        case 'markets':
          contextParts.push('In market areas, language tends to be more commercial and negotiation-focused.');
          break;
        case 'public_areas':
          contextParts.push('In public spaces, people use more general, widely understood expressions.');
          break;
      }
    }

    return contextParts.length > 0 ? contextParts.join(' ') : undefined;
  }

  private getAdditionalVisitorGuidance(context: Context): string | undefined {
    const guidanceParts: string[] = [];

    if (context.speaker) {
      switch (context.speaker) {
        case 'shopkeeper':
          guidanceParts.push('When dealing with shopkeepers, a friendly response and some basic bargaining is expected.');
          break;
        case 'auto_driver':
          guidanceParts.push('Auto drivers appreciate direct communication and knowing your destination clearly.');
          break;
        case 'temple_staff':
          guidanceParts.push('Show respect and follow temple customs when interacting with temple staff.');
          break;
        case 'elderly_local':
          guidanceParts.push('Use respectful language and show patience when speaking with elderly locals.');
          break;
      }
    }

    if (context.location) {
      switch (context.location) {
        case 'temple_streets':
          guidanceParts.push('Dress modestly and speak quietly in temple areas out of respect.');
          break;
        case 'markets':
          guidanceParts.push('Bargaining is common in markets, but be respectful and fair.');
          break;
        case 'public_areas':
          guidanceParts.push('Be aware of local customs and maintain appropriate behavior in public spaces.');
          break;
      }
    }

    return guidanceParts.length > 0 ? guidanceParts.join(' ') : undefined;
  }

  // Helper method for debugging and monitoring
  getSystemStatus(): { initialized: boolean; contextDescription: string; aiEnabled: boolean } {
    return {
      initialized: this.knowledgeEngine.isInitialized(),
      contextDescription: 'TalkMate Agent Controller ready for cultural translation',
      aiEnabled: this.useAI
    };
  }
}