# Technology Stack

## Core Technologies

- **Language**: TypeScript for type safety and better development experience
- **Runtime**: Node.js for backend processing
- **Testing Framework**: Jest with fast-check for property-based testing
- **Frontend**: HTML/CSS/JavaScript for simple chat interface
- **Data Format**: JSON/YAML for product.md document structure

## Architecture Pattern

- **Document-Grounded AI Agent**: All responses must be traceable to product.md content
- **Layered Architecture**: Clear separation between UI, agent controller, context processing, and document engine
- **Property-Based Testing**: Minimum 100 iterations per property test to validate universal behaviors

## Key Dependencies

- **fast-check**: Property-based testing library for TypeScript
- **JSON Schema**: Document validation for product.md structure
- **TypeScript**: Static typing for all interfaces and data models

## Build Commands

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run all tests (unit + property-based)
npm test

# Run property-based tests only
npm run test:properties

# Build for production
npm run build

# Start development server
npm run dev

# Validate product.md document
npm run validate-doc
```

## Development Guidelines

- All responses must reference product.md content - no hallucination
- Property-based tests must be tagged with design document references
- TypeScript interfaces required for all data models
- Error handling at every layer with graceful degradation
- Scope validation to refuse non-Thanjavur queries

## Testing Requirements

- **Property-Based Testing**: Use fast-check with minimum 100 iterations per test
- **Test Tagging**: Format property tests as `**Feature: thanjavur-talkmate, Property {number}: {property_text}**`
- **Coverage**: Each correctness property from design.md must have corresponding property test
- **Unit Tests**: Mirror source structure in tests/ directory
- **Integration Tests**: End-to-end workflows for complete visitor scenarios

## Code Quality Standards

- **TypeScript Strict Mode**: Enable all strict type checking options
- **Interface Design**: All data models must have explicit TypeScript interfaces
- **Error Handling**: Graceful degradation with user-friendly error messages
- **Document Validation**: JSON Schema validation for product.md structure
- **Scope Enforcement**: Strict validation to refuse non-Thanjavur queries