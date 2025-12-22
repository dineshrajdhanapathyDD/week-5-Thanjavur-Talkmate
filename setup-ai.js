#!/usr/bin/env node

/**
 * Interactive setup script for Thanjavur TalkMate AI configuration
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAI() {
  console.log('🏛️ Welcome to Thanjavur TalkMate AI Setup!\n');

  console.log('Choose your AI provider:');
  console.log('1. Groq (Recommended - Fast & Free)');
  console.log('2. Hugging Face (Many models available)');
  console.log('3. Ollama (Local, private)');
  console.log('4. Document-only mode (No AI)\n');

  const choice = await question('Enter your choice (1-4): ');

  let config = {
    AI_PROVIDER: 'groq',
    AI_API_KEY: '',
    AI_MODEL: '',
    ENABLE_AI: 'true',
    PORT: '3000'
  };

  switch (choice.trim()) {
    case '1':
      config.AI_PROVIDER = 'groq';
      config.AI_MODEL = 'llama-3.1-8b-instant';
      console.log('\n🚀 Groq Setup:');
      console.log('1. Visit: https://console.groq.com/keys');
      console.log('2. Create a free account');
      console.log('3. Generate an API key\n');
      config.AI_API_KEY = await question('Enter your Groq API key: ');
      break;

    case '2':
      config.AI_PROVIDER = 'huggingface';
      config.AI_MODEL = 'meta-llama/Llama-2-7b-chat-hf';
      console.log('\n🤗 Hugging Face Setup:');
      console.log('1. Visit: https://huggingface.co/settings/tokens');
      console.log('2. Create a free account');
      console.log('3. Generate a read token\n');
      config.AI_API_KEY = await question('Enter your Hugging Face token: ');
      break;

    case '3':
      config.AI_PROVIDER = 'ollama';
      config.AI_MODEL = 'llama2';
      console.log('\n🦙 Ollama Setup:');
      console.log('1. Install Ollama from: https://ollama.ai/');
      console.log('2. Run: ollama pull llama2');
      console.log('3. Make sure Ollama is running\n');
      await question('Press Enter when Ollama is ready...');
      break;

    case '4':
      config.ENABLE_AI = 'false';
      console.log('\n📄 Document-only mode selected');
      break;

    default:
      console.log('Invalid choice, using Groq as default');
      config.AI_PROVIDER = 'groq';
      break;
  }

  // Write .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env', envContent);

  console.log('\n✅ Configuration saved to .env file!');
  console.log('\nNext steps:');
  console.log('1. npm install');
  console.log('2. npm run dev');
  console.log('3. Open http://localhost:3000\n');

  console.log('🎉 Happy chatting with TalkMate!');
  
  rl.close();
}

setupAI().catch(console.error);