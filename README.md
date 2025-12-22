# Thanjavur TalkMate

A specialized AI application that helps visitors understand local Tamil slang and cultural expressions in Thanjavur, particularly around the Brihadeeswarar Temple area.

## Features

- **AI-Powered Responses**: Uses free AI models (Groq, Hugging Face, or Ollama) for intelligent cultural translations
- **Context-Aware Translation**: Interprets phrases based on speaker type and location
- **Cultural Guidance**: Provides cultural explanations beyond literal translations
- **Document-Grounded**: All responses based on curated local knowledge in `product.md`
- **Scope-Limited**: Focused exclusively on Thanjavur region for accuracy
- **Fallback System**: Falls back to document matching if AI is unavailable

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AI Service (Choose One)

#### Option A: Groq (Recommended - Fast & Free)
1. Get free API key from [Groq Console](https://console.groq.com/keys)
2. Copy `.env.example` to `.env`
3. Set your configuration:
```bash
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key_here
AI_MODEL=llama-3.1-8b-instant
ENABLE_AI=true
```

#### Option B: Hugging Face
1. Get free API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Configure:
```bash
AI_PROVIDER=huggingface
AI_API_KEY=your_hf_api_key_here
AI_MODEL=meta-llama/Llama-2-7b-chat-hf
ENABLE_AI=true
```

#### Option C: Ollama (Local)
1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull llama2`
3. Configure:
```bash
AI_PROVIDER=ollama
AI_MODEL=llama2
ENABLE_AI=true
```

#### Option D: Document-Only Mode
```bash
ENABLE_AI=false
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### 4. Open Your Browser
Visit `http://localhost:3000` and start chatting with TalkMate!

## How It Works

1. **AI-First Approach**: When AI is enabled, TalkMate uses the configured AI model with the `product.md` knowledge base as context
2. **Document Grounding**: The AI is instructed to only use information from the curated cultural knowledge base
3. **Intelligent Fallback**: If AI fails or isn't configured, the system falls back to direct document matching
4. **Scope Validation**: All queries are validated to ensure they're about Thanjavur region

## Project Structure

```
src/
├── components/     # Core system components
│   ├── AgentController.ts    # Main orchestration with AI integration
│   ├── DocumentKnowledgeEngine.ts
│   └── ContextProcessor.ts
├── services/       # Business logic utilities
│   ├── AIService.ts          # AI model integration
│   ├── DocumentParser.ts
│   ├── ScopeValidator.ts
│   └── ResponseFormatter.ts
├── models/         # TypeScript interfaces
├── ui/            # Chat interface
└── index.ts       # Main entry point

data/
└── product.md     # Cultural knowledge base

tests/
├── unit/          # Unit tests
├── properties/    # Property-based tests
└── integration/   # End-to-end tests
```

## Available AI Providers

### Groq (Recommended)
- **Pros**: Very fast, free tier, good models
- **Models**: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768
- **Setup**: Get API key from [console.groq.com](https://console.groq.com/keys)

### Hugging Face
- **Pros**: Many model options, free tier
- **Models**: meta-llama/Llama-2-7b-chat-hf, microsoft/DialoGPT-medium
- **Setup**: Get API key from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### Ollama
- **Pros**: Runs locally, private, no API keys needed
- **Models**: llama2, codellama, mistral, phi
- **Setup**: Install Ollama and pull desired model

## Testing

```bash
# Run all tests
npm test

# Run property-based tests
npm run test:properties

# Type checking
npm run type-check

# Test the system
node test-system.js
```

## Architecture

The system follows a document-grounded AI agent pattern where:

1. **AI Service** generates responses using the product.md as context
2. **Knowledge Engine** provides fallback document matching
3. **Scope Validator** ensures all queries stay within Thanjavur boundaries
4. **Context Processor** enriches queries with speaker/location information

This ensures cultural accuracy while preventing hallucination of incorrect information.

## Development

This project uses TypeScript with strict type checking and property-based testing with fast-check to ensure correctness across all inputs.

## License

MIT