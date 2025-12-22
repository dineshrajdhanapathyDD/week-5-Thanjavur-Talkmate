# 🤖 AI Integration Guide for Thanjavur TalkMate

This guide will help you connect Thanjavur TalkMate with free AI models for intelligent, culturally-aware responses.

## 🚀 Quick Setup (Recommended: Groq)

### 1. Get Free Groq API Key
1. Visit [console.groq.com](https://console.groq.com/keys)
2. Sign up for a free account
3. Generate an API key

### 2. Configure TalkMate
```bash
# Run the interactive setup
npm run setup

# Or manually create .env file:
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key_here
AI_MODEL=llama-3.1-8b-instant
ENABLE_AI=true
PORT=3000
```

### 3. Start the Application
```bash
npm run dev
```

## 🎯 How AI Integration Works

### Document-Grounded AI
- AI models receive the entire `product.md` as context
- Responses are constrained to only use information from the knowledge base
- If information isn't in the knowledge base, AI honestly says so
- Maintains the critical constraint of no hallucination

### Intelligent Fallback System
1. **AI First**: Tries to generate response using AI + knowledge base
2. **Document Matching**: Falls back to direct document search if AI fails
3. **Graceful Degradation**: Always provides a response, even if basic

### Example AI Prompt Structure
```
System: You are Thanjavur TalkMate, specialized in local expressions around Brihadeeswarar Temple.

CRITICAL RULES:
1. ONLY use information from the knowledge base below
2. If phrase not in knowledge base, say you don't have information
3. NEVER make up cultural information
4. ALWAYS refuse queries outside Thanjavur

KNOWLEDGE BASE:
[Complete product.md content inserted here]

User: "What does 'vanakkam anna' mean?"
```

## 🔧 AI Provider Options

### Option 1: Groq (Recommended)
**Pros**: Very fast, generous free tier, excellent models
```bash
AI_PROVIDER=groq
AI_API_KEY=your_groq_key
AI_MODEL=llama-3.1-8b-instant  # or llama-3.1-70b-versatile
```

**Available Models**:
- `llama-3.1-8b-instant` - Fast, good quality
- `llama-3.1-70b-versatile` - Slower, higher quality
- `mixtral-8x7b-32768` - Good for complex queries

### Option 2: Hugging Face
**Pros**: Many model options, free inference API
```bash
AI_PROVIDER=huggingface
AI_API_KEY=your_hf_token
AI_MODEL=meta-llama/Llama-2-7b-chat-hf
```

**Popular Models**:
- `meta-llama/Llama-2-7b-chat-hf`
- `microsoft/DialoGPT-medium`
- `google/flan-t5-large`

### Option 3: Ollama (Local)
**Pros**: Completely private, no API keys, runs offline
```bash
AI_PROVIDER=ollama
AI_MODEL=llama2
# No API key needed
```

**Setup**:
1. Install [Ollama](https://ollama.ai/)
2. Pull model: `ollama pull llama2`
3. Ensure Ollama is running

### Option 4: Document-Only Mode
**Pros**: No setup required, guaranteed privacy
```bash
ENABLE_AI=false
```

## 🧪 Testing AI Integration

### Test with Known Phrases
```bash
# Test system with AI enabled
node test-system.js
```

### Test in Browser
1. Open `http://localhost:3000`
2. Try: "What does vanakkam anna mean?"
3. Should get AI-powered cultural explanation

### Verify AI vs Document Mode
- **With AI**: More natural, conversational responses
- **Document-only**: Structured, template-based responses
- **Both**: Maintain cultural accuracy and scope limitations

## 🔍 Monitoring AI Performance

### Check System Status
The server logs show:
```
🤖 AI Provider: groq
🔑 AI Enabled: true
🧠 AI Mode: Enabled
```

### Response Quality Indicators
- **High Confidence (85%)**: AI found good match in knowledge base
- **Low Confidence (10%)**: Fell back to document matching
- **Refusal**: Query outside Thanjavur scope (working correctly)

## 🛠️ Troubleshooting

### AI Not Working?
1. **Check API Key**: Ensure `AI_API_KEY` is set correctly
2. **Check Provider**: Verify `AI_PROVIDER` matches your service
3. **Check Logs**: Look for AI service errors in console
4. **Test Fallback**: System should work in document-only mode

### Common Issues
```bash
# API key issues
Error: Groq API error: 401 - Invalid API key

# Model not available
Error: Model not found: invalid-model-name

# Network issues
Error: Failed to connect to AI service
```

### Fallback Behavior
If AI fails, TalkMate automatically falls back to document matching:
```
AI service failed, falling back to document matching
```

## 🎯 Best Practices

### For Production
1. **Use Environment Variables**: Never commit API keys to code
2. **Monitor Usage**: Track API calls to stay within limits
3. **Implement Caching**: Cache common responses to reduce API calls
4. **Set Timeouts**: Prevent hanging requests

### For Development
1. **Start with Document-Only**: Verify core functionality first
2. **Test AI Integration**: Gradually enable AI features
3. **Compare Responses**: Ensure AI maintains cultural accuracy
4. **Monitor Costs**: Most providers have generous free tiers

## 📊 Performance Comparison

| Provider | Speed | Quality | Free Tier | Privacy |
|----------|-------|---------|-----------|---------|
| Groq | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Hugging Face | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Ollama | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Document-Only | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎉 Success!

Once configured, your TalkMate will provide intelligent, culturally-aware responses while maintaining strict adherence to the Thanjavur knowledge base. The AI enhances the user experience while preserving the critical constraint of document-grounded accuracy.

**Ready to help visitors understand Thanjavur culture with AI power! 🏛️✨**