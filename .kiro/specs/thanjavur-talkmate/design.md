# Design Document

## Overview

Thanjavur TalkMate is a specialized AI agent that provides culturally-aware translation and interpretation of local Tamil slang and expressions for visitors to Thanjavur. The system operates as a document-grounded AI agent, using a custom product.md file as its single source of truth to ensure accurate, localized responses while avoiding generic or hallucinated cultural information.

The application follows an agent-based architecture where all reasoning and responses are constrained by the contents of the product.md file, demonstrating how specialized documentation can effectively steer AI behavior for domain-specific applications.

## Architecture

The system follows a layered architecture with strict document grounding:

```
┌─────────────────────────────────────┐
│           Chat Interface            │
├─────────────────────────────────────┤
│         Agent Controller            │
├─────────────────────────────────────┤
│      Context Processor              │
├─────────────────────────────────────┤
│    Document Knowledge Engine        │
├─────────────────────────────────────┤
│        Product.md Parser            │
└─────────────────────────────────────┘
```

### Core Components:

1. **Document Knowledge Engine**: Parses and indexes product.md content
2. **Context Processor**: Analyzes speaker type, location, and cultural context
3. **Agent Controller**: Orchestrates response generation with strict scope validation
4. **Chat Interface**: Simple web-based UI for visitor interaction

## Components and Interfaces

### DocumentKnowledgeEngine
```typescript
interface DocumentKnowledgeEngine {
  loadProductDocument(): Promise<ProductDocument>
  validateScope(query: string): boolean
  findRelevantContent(query: string, context: Context): ContentMatch[]
  getSlangTranslation(phrase: string): SlangEntry | null
}
```

### ContextProcessor
```typescript
interface ContextProcessor {
  parseSpeakerContext(input: string): SpeakerType | null
  parseLocationContext(input: string): LocationType | null
  enrichQuery(query: string, context: Context): EnrichedQuery
}

type SpeakerType = 'shopkeeper' | 'auto_driver' | 'temple_staff' | 'elderly_local'
type LocationType = 'temple_streets' | 'markets' | 'public_areas'
```

### AgentController
```typescript
interface AgentController {
  processQuery(query: string, context?: Context): Promise<TalkMateResponse>
  validateThanjavurScope(query: string): boolean
  generateCulturalResponse(content: ContentMatch[], context: Context): TalkMateResponse
}
```

### TalkMateResponse
```typescript
interface TalkMateResponse {
  simpleEnglishMeaning: string
  culturalExplanation: string
  visitorGuidance: string
  isWithinScope: boolean
  refusalMessage?: string
}
```

## Data Models

### ProductDocument
```typescript
interface ProductDocument {
  slangEntries: SlangEntry[]
  culturalContexts: CulturalContext[]
  speakerProfiles: SpeakerProfile[]
  locationGuides: LocationGuide[]
  generalGuidance: GeneralGuidance[]
}
```

### SlangEntry
```typescript
interface SlangEntry {
  phrase: string
  tamilScript?: string
  literalMeaning: string
  culturalMeaning: string
  commonContexts: string[]
  speakerTypes: SpeakerType[]
  locations: LocationType[]
  visitorAdvice: string
}
```

### Context
```typescript
interface Context {
  speaker?: SpeakerType
  location?: LocationType
  additionalInfo?: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, here are the correctness properties for Thanjavur TalkMate:

**Property 1: Input Processing Acceptance**
*For any* valid text input in Tamil or English, the system should accept and process it without throwing errors
**Validates: Requirements 1.1**

**Property 2: Document-Grounded Responses**
*For any* successful response, all content should be traceable to entries in the product document
**Validates: Requirements 1.2, 3.1**

**Property 3: Cultural Explanation Inclusion**
*For any* successful translation response, the output should contain a cultural explanation section
**Validates: Requirements 1.3**

**Property 4: Visitor Guidance Inclusion**
*For any* successful translation response, the output should contain visitor guidance information
**Validates: Requirements 1.4**

**Property 5: Context-Aware Response Variation**
*For any* query with different speaker contexts, the responses should differ in their interpretation
**Validates: Requirements 1.5, 2.1**

**Property 6: Location Context Integration**
*For any* query with location context, the response should incorporate location-specific cultural information
**Validates: Requirements 2.2**

**Property 7: Default Thanjavur Context**
*For any* query without explicit context, the response should still provide Thanjavur-specific cultural information
**Validates: Requirements 2.3**

**Property 8: Multi-Context Synthesis**
*For any* query with both speaker and location context, the response should incorporate both contextual elements
**Validates: Requirements 2.4**

**Property 9: Scope Validation and Refusal**
*For any* query about regions outside Thanjavur, the system should refuse and provide a polite explanation
**Validates: Requirements 3.2**

**Property 10: Graceful Information Gaps**
*For any* query not covered in the product document, the system should acknowledge the limitation honestly
**Validates: Requirements 3.3**

**Property 11: Document Structure Validation**
*For any* malformed product document, the system should handle parsing errors gracefully
**Validates: Requirements 3.4**

**Property 12: Response Format Consistency**
*For any* successful response, the output should contain all required sections (meaning, cultural explanation, visitor guidance)
**Validates: Requirements 5.3**

**Property 13: Interface Error Handling**
*For any* system error, helpful error messages should be displayed within the chat interface
**Validates: Requirements 5.5**

<function_calls>
<invoke name="prework">
<parameter name="featureName">thanjavur-talkmate

## Error Handling

The system implements comprehensive error handling at multiple levels:

### Document Loading Errors
- **Missing product.md**: Display clear error message and prevent system startup
- **Malformed JSON/YAML**: Parse errors with specific line numbers and validation messages
- **Empty document**: Warning message with graceful degradation to basic functionality

### Query Processing Errors
- **Out-of-scope queries**: Polite refusal with explanation of Thanjavur limitation
- **Unrecognized phrases**: Honest acknowledgment of knowledge gaps
- **Invalid input formats**: Clear guidance on expected input types

### Context Processing Errors
- **Invalid speaker types**: Default to general interpretation with warning
- **Invalid locations**: Use general Thanjavur context with notification
- **Conflicting contexts**: Prioritize most specific context with explanation

### System Errors
- **Network failures**: Offline mode with cached responses where possible
- **Processing timeouts**: Graceful degradation with simplified responses
- **Memory constraints**: Efficient document indexing with lazy loading

## Testing Strategy

The testing approach combines unit testing for specific functionality with property-based testing for universal behaviors:

### Unit Testing
- **Document parsing**: Test specific product.md formats and edge cases
- **Context extraction**: Verify speaker and location identification accuracy
- **Response formatting**: Ensure consistent output structure
- **Error scenarios**: Test specific error conditions and messages

### Property-Based Testing
The system uses **fast-check** (JavaScript/TypeScript) for property-based testing with a minimum of 100 iterations per property test.

Each property-based test will be tagged with comments referencing the design document:
- Format: `**Feature: thanjavur-talkmate, Property {number}: {property_text}**`
- Each correctness property maps to exactly one property-based test
- Tests validate universal behaviors across all valid inputs

**Key Property Test Areas:**
- **Input acceptance**: Any valid text should be processed without errors
- **Document grounding**: All responses must trace to product.md content
- **Context sensitivity**: Same queries with different contexts produce different responses
- **Scope validation**: Non-Thanjavur queries are consistently refused
- **Response completeness**: All successful responses contain required sections

### Integration Testing
- **End-to-end workflows**: Complete visitor interaction scenarios
- **Document updates**: System behavior when product.md changes
- **Performance validation**: Response times under various loads
- **Cross-browser compatibility**: UI functionality across different browsers

The dual testing approach ensures both concrete correctness (unit tests) and universal properties (property-based tests), providing comprehensive validation of the system's cultural accuracy and technical reliability.