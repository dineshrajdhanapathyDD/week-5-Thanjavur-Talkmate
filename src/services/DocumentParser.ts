/**
 * Document Parser - Handles product.md parsing and validation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Ajv, { JSONSchemaType } from 'ajv';
import { ProductDocument, SlangEntry, CulturalContext, SpeakerProfile, LocationGuide, GeneralGuidance } from '../models';

export class DocumentParseError extends Error {
  constructor(message: string, public line?: number, public column?: number) {
    super(message);
    this.name = 'DocumentParseError';
  }
}

export class DocumentParser {
  private ajv: Ajv;
  private schema: JSONSchemaType<ProductDocument>;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    this.schema = this.createProductDocumentSchema();
  }

  async parseProductDocument(filePath: string): Promise<ProductDocument> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const document = this.parseMarkdownToJson(content);
      
      if (!this.validateDocument(document)) {
        const errors = this.ajv.errors?.map(err => `${err.instancePath}: ${err.message}`).join(', ');
        throw new DocumentParseError(`Document validation failed: ${errors}`);
      }

      return document;
    } catch (error) {
      if (error instanceof DocumentParseError) {
        throw error;
      }
      throw new DocumentParseError(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseMarkdownToJson(content: string): ProductDocument {
    const lines = content.split('\n');
    const document: ProductDocument = {
      slangEntries: [],
      culturalContexts: [],
      speakerProfiles: [],
      locationGuides: [],
      generalGuidance: [],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        region: 'Thanjavur',
        language: 'Tamil/English'
      }
    };

    let currentSection = '';
    let currentEntry: any = {};
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) continue;

      // Section headers
      if (line.startsWith('# ')) {
        currentSection = line.substring(2).toLowerCase().replace(/\s+/g, '_');
        continue;
      }

      // Subsection headers for entries
      if (line.startsWith('## ')) {
        if (currentEntry && Object.keys(currentEntry).length > 0) {
          this.addEntryToDocument(document, currentSection, currentEntry);
        }
        currentEntry = { title: line.substring(3) };
        continue;
      }

      // Field parsing
      if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        const cleanKey = key?.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (cleanKey && value) {
          if (value.startsWith('[') && value.endsWith(']')) {
            currentEntry[cleanKey] = JSON.parse(value);
          } else {
            currentEntry[cleanKey] = value;
          }
        }
      }
    }

    // Add final entry
    if (currentEntry && Object.keys(currentEntry).length > 0) {
      this.addEntryToDocument(document, currentSection, currentEntry);
    }

    return document;
  }

  private addEntryToDocument(document: ProductDocument, section: string, entry: any): void {
    switch (section) {
      case 'slang_entries':
        document.slangEntries.push(this.normalizeSlangEntry(entry));
        break;
      case 'cultural_contexts':
        document.culturalContexts.push(this.normalizeCulturalContext(entry));
        break;
      case 'speaker_profiles':
        document.speakerProfiles.push(this.normalizeSpeakerProfile(entry));
        break;
      case 'location_guides':
        document.locationGuides.push(this.normalizeLocationGuide(entry));
        break;
      case 'general_guidance':
        document.generalGuidance.push(this.normalizeGeneralGuidance(entry));
        break;
    }
  }

  private normalizeSlangEntry(entry: any): SlangEntry {
    return {
      phrase: entry.phrase || entry.title || '',
      tamilScript: entry.tamil_script,
      literalMeaning: entry.literal_meaning || '',
      culturalMeaning: entry.cultural_meaning || '',
      commonContexts: Array.isArray(entry.common_contexts) ? entry.common_contexts : [],
      speakerTypes: Array.isArray(entry.speaker_types) ? entry.speaker_types : [],
      locations: Array.isArray(entry.locations) ? entry.locations : [],
      visitorAdvice: entry.visitor_advice || ''
    };
  }

  private normalizeCulturalContext(entry: any): CulturalContext {
    return {
      id: entry.id || entry.title?.toLowerCase().replace(/\s+/g, '_') || '',
      description: entry.description || '',
      applicableLocations: Array.isArray(entry.applicable_locations) ? entry.applicable_locations : [],
      culturalNorms: Array.isArray(entry.cultural_norms) ? entry.cultural_norms : [],
      visitorGuidance: entry.visitor_guidance || ''
    };
  }

  private normalizeSpeakerProfile(entry: any): SpeakerProfile {
    return {
      type: entry.type || entry.title?.toLowerCase().replace(/\s+/g, '_') as any,
      description: entry.description || '',
      commonPhrases: Array.isArray(entry.common_phrases) ? entry.common_phrases : [],
      culturalNotes: Array.isArray(entry.cultural_notes) ? entry.cultural_notes : [],
      interactionTips: Array.isArray(entry.interaction_tips) ? entry.interaction_tips : []
    };
  }

  private normalizeLocationGuide(entry: any): LocationGuide {
    return {
      location: entry.location || entry.title?.toLowerCase().replace(/\s+/g, '_') as any,
      description: entry.description || '',
      culturalNorms: Array.isArray(entry.cultural_norms) ? entry.cultural_norms : [],
      commonSituations: Array.isArray(entry.common_situations) ? entry.common_situations : [],
      visitorTips: Array.isArray(entry.visitor_tips) ? entry.visitor_tips : []
    };
  }

  private normalizeGeneralGuidance(entry: any): GeneralGuidance {
    return {
      category: entry.category || 'general',
      title: entry.title || '',
      description: entry.description || '',
      applicableContexts: Array.isArray(entry.applicable_contexts) ? entry.applicable_contexts : []
    };
  }

  private validateDocument(document: any): document is ProductDocument {
    return this.ajv.validate(this.schema, document);
  }

  private createProductDocumentSchema(): JSONSchemaType<ProductDocument> {
    return {
      type: 'object',
      properties: {
        slangEntries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phrase: { type: 'string' },
              tamilScript: { type: 'string', nullable: true },
              literalMeaning: { type: 'string' },
              culturalMeaning: { type: 'string' },
              commonContexts: { type: 'array', items: { type: 'string' } },
              speakerTypes: { type: 'array', items: { type: 'string' } },
              locations: { type: 'array', items: { type: 'string' } },
              visitorAdvice: { type: 'string' }
            },
            required: ['phrase', 'literalMeaning', 'culturalMeaning', 'commonContexts', 'speakerTypes', 'locations', 'visitorAdvice'],
            additionalProperties: false
          }
        },
        culturalContexts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              description: { type: 'string' },
              applicableLocations: { type: 'array', items: { type: 'string' } },
              culturalNorms: { type: 'array', items: { type: 'string' } },
              visitorGuidance: { type: 'string' }
            },
            required: ['id', 'description', 'applicableLocations', 'culturalNorms', 'visitorGuidance'],
            additionalProperties: false
          }
        },
        speakerProfiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              commonPhrases: { type: 'array', items: { type: 'string' } },
              culturalNotes: { type: 'array', items: { type: 'string' } },
              interactionTips: { type: 'array', items: { type: 'string' } }
            },
            required: ['type', 'description', 'commonPhrases', 'culturalNotes', 'interactionTips'],
            additionalProperties: false
          }
        },
        locationGuides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              location: { type: 'string' },
              description: { type: 'string' },
              culturalNorms: { type: 'array', items: { type: 'string' } },
              commonSituations: { type: 'array', items: { type: 'string' } },
              visitorTips: { type: 'array', items: { type: 'string' } }
            },
            required: ['location', 'description', 'culturalNorms', 'commonSituations', 'visitorTips'],
            additionalProperties: false
          }
        },
        generalGuidance: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              applicableContexts: { type: 'array', items: { type: 'string' } }
            },
            required: ['category', 'title', 'description', 'applicableContexts'],
            additionalProperties: false
          }
        },
        metadata: {
          type: 'object',
          properties: {
            version: { type: 'string' },
            lastUpdated: { type: 'string' },
            region: { type: 'string' },
            language: { type: 'string' }
          },
          required: ['version', 'lastUpdated', 'region', 'language'],
          additionalProperties: false
        }
      },
      required: ['slangEntries', 'culturalContexts', 'speakerProfiles', 'locationGuides', 'generalGuidance', 'metadata'],
      additionalProperties: false
    };
  }
}