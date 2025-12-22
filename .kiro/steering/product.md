# Product Overview

Thanjavur TalkMate is a specialized AI application that helps visitors understand local Tamil slang and cultural expressions in Thanjavur, particularly around the Brihadeeswarar Temple area. The application serves as a cultural bridge, providing contextual interpretations based on speaker type, location, and local cultural norms.

## Core Purpose

- Translate Tamil/English phrases with cultural context, not just literal meaning
- Provide visitor guidance on appropriate responses and expectations
- Maintain accuracy through document-grounded responses (product.md file)
- Offer location and speaker-specific cultural interpretations

## Key Features

- Context-aware translations based on speaker type (shopkeeper, auto driver, temple staff, elderly local)
- Location-specific cultural guidance (temple streets, markets, public areas)
- Visitor-friendly explanations with practical advice
- Strict scope limitation to Thanjavur region for accuracy
- Chat-based interface for easy interaction

## Target Users

Primary users are visitors to Thanjavur who need help understanding local expressions and cultural nuances during their visit to the temple and surrounding areas.

## Design Principles

- **Document-Grounded Responses**: All content must be traceable to product.md
- **Cultural Context Over Literal Translation**: Prioritize cultural meaning and visitor guidance
- **Scope Limitation**: Strict focus on Thanjavur region for accuracy
- **Visitor-Centric Design**: Responses tailored for tourists and visitors
- **Context-Aware Interpretation**: Speaker type and location influence responses

## Response Requirements

Every successful response must include:
- Simple English meaning
- Cultural explanation
- Visitor guidance
- Scope validation (Thanjavur-only)

## Error Handling Philosophy

- Graceful degradation when information is missing
- Honest acknowledgment of knowledge gaps
- Polite refusal for out-of-scope queries
- User-friendly error messages in chat interface