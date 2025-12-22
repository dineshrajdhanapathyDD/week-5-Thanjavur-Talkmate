# Project Structure

## Directory Organization

```text
thanjavur-talkmate/
├── src/
│   ├── components/           # Core system components
│   │   ├── DocumentKnowledgeEngine.ts
│   │   ├── ContextProcessor.ts
│   │   └── AgentController.ts
│   ├── models/              # TypeScript interfaces and data models
│   │   ├── ProductDocument.ts
│   │   ├── SlangEntry.ts
│   │   ├── Context.ts
│   │   └── TalkMateResponse.ts
│   ├── services/            # Business logic and utilities
│   │   ├── DocumentParser.ts
│   │   ├── ScopeValidator.ts
│   │   └── ResponseFormatter.ts
│   ├── ui/                  # Frontend chat interface
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── chat.js
│   └── index.ts             # Main application entry point
├── tests/
│   ├── unit/                # Unit tests for specific functionality
│   ├── properties/          # Property-based tests (fast-check)
│   └── integration/         # End-to-end integration tests
├── data/
│   └── product.md           # Single source of truth for cultural knowledge
├── .kiro/
│   ├── specs/               # Project specifications
│   └── steering/            # AI assistant guidance documents
└── package.json
```

## Key Files and Responsibilities

### Core Components (`src/components/`)

- **DocumentKnowledgeEngine**: Parses product.md, indexes content, validates scope
- **ContextProcessor**: Analyzes speaker type and location context
- **AgentController**: Main orchestration layer, generates responses

### Data Models (`src/models/`)

- **ProductDocument**: Structure for the cultural knowledge base
- **SlangEntry**: Individual phrase translations with context
- **Context**: Speaker and location information
- **TalkMateResponse**: Standardized response format

### Critical Files

- **data/product.md**: The authoritative source for all cultural knowledge
- **tests/properties/**: Property-based tests validating universal system behaviors
- **src/ui/**: Simple chat interface for visitor interaction

## Naming Conventions

- **Files**: PascalCase for TypeScript classes, camelCase for utilities
- **Interfaces**: Descriptive names matching domain concepts
- **Tests**: Property tests tagged with design document references
- **Constants**: UPPER_SNAKE_CASE for configuration values

## Import Guidelines

- Relative imports within same directory level
- Absolute imports from src/ root for cross-component dependencies
- Models imported before services, services before components
- Test files mirror source structure for easy navigation

## Implementation Priorities

1. **Document-Grounded Architecture**: All functionality must trace back to product.md content
2. **Context-Aware Processing**: Speaker type and location context drive response variations
3. **Scope Validation**: Strict enforcement of Thanjavur-only queries
4. **Property-Based Testing**: Universal behavior validation with fast-check
5. **Cultural Accuracy**: Prioritize cultural context over literal translations

## File Organization Rules

- **Components**: Core system logic in `src/components/`
- **Models**: TypeScript interfaces in `src/models/`
- **Services**: Utility functions in `src/services/`
- **Tests**: Mirror source structure with property tests in `tests/properties/`
- **Data**: Single source of truth in `data/product.md`