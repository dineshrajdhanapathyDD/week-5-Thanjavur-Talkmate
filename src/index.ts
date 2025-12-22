/**
 * Main application entry point
 */

import 'dotenv/config';
import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs/promises';
import { DocumentKnowledgeEngineImpl } from './components/DocumentKnowledgeEngine';
import { ContextProcessorImpl } from './components/ContextProcessor';
import { AgentControllerImpl } from './components/AgentController';
import { GoogleMapsService } from './services/GoogleMapsService';

// Global TalkMate instance
let talkMateAgent: AgentControllerImpl | null = null;
let mapsService: GoogleMapsService | null = null;

export async function initializeTalkMate() {
  const knowledgeEngine = new DocumentKnowledgeEngineImpl();
  const contextProcessor = new ContextProcessorImpl();
  const agentController = new AgentControllerImpl(knowledgeEngine, contextProcessor);

  await agentController.initialize();
  talkMateAgent = agentController;

  // Initialize Google Maps service
  mapsService = new GoogleMapsService();

  return agentController;
}

// Simple HTTP server for the chat interface
async function createServer() {
  const server = http.createServer(async (req, res) => {
    try {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const url = req.url || '/';
      
      // API endpoint for processing queries
      if (url === '/api/query' && req.method === 'POST') {
        await handleQueryRequest(req, res);
        return;
      }

      // API endpoint for nearby attractions
      if (url === '/api/nearby-attractions' && req.method === 'GET') {
        await handleNearbyAttractionsRequest(req, res);
        return;
      }

      // API endpoint for nearby restaurants
      if (url === '/api/nearby-restaurants' && req.method === 'GET') {
        await handleNearbyRestaurantsRequest(req, res);
        return;
      }

      // API endpoint for traffic information
      if (url.startsWith('/api/traffic') && req.method === 'GET') {
        await handleTrafficRequest(req, res);
        return;
      }

      // Serve static files
      await serveStaticFile(url, res);

    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });

  return server;
}

async function handleQueryRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { query, context } = JSON.parse(body);

        if (!talkMateAgent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: true,
            message: 'TalkMate system not initialized',
            code: 'NOT_INITIALIZED'
          }));
          return;
        }

        const response = await talkMateAgent.processQuery(query, context);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));

      } catch (error) {
        console.error('Query processing error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: true,
          message: 'Invalid request format',
          code: 'INVALID_REQUEST'
        }));
      }
    });

  } catch (error) {
    console.error('Request handling error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: true,
      message: 'Server error',
      code: 'SERVER_ERROR'
    }));
  }
}

async function handleNearbyAttractionsRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    if (!mapsService) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Maps service not initialized' }));
      return;
    }

    const attractions = await mapsService.getNearbyTouristAttractions();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ attractions }));

  } catch (error) {
    console.error('Error fetching nearby attractions:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch nearby attractions' }));
  }
}

async function handleNearbyRestaurantsRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    if (!mapsService) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Maps service not initialized' }));
      return;
    }

    const restaurants = await mapsService.getNearbyRestaurants();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ restaurants }));

  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch nearby restaurants' }));
  }
}

async function handleTrafficRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    if (!mapsService) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Maps service not initialized' }));
      return;
    }

    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const fromLocation = url.searchParams.get('from') || 'Thanjavur Railway Station';

    const traffic = await mapsService.getTrafficToTemple(fromLocation);
    const directionsUrl = mapsService.getDirectionsUrl();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ traffic, directionsUrl }));

  } catch (error) {
    console.error('Error fetching traffic info:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch traffic information' }));
  }
}

async function serveStaticFile(url: string, res: http.ServerResponse) {
  // Default to index.html
  if (url === '/') {
    url = '/index.html';
  }

  // Map URLs to file paths
  const filePath = getFilePath(url);
  
  try {
    const content = await fs.readFile(filePath);
    const contentType = getContentType(filePath);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);

  } catch (error) {
    // File not found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

function getFilePath(url: string): string {
  const uiDir = path.join(__dirname, 'ui');
  
  // Security: prevent directory traversal
  const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
  
  return path.join(uiDir, safePath);
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  const contentTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  return contentTypes[ext] || 'text/plain';
}

// Export all public interfaces
export * from './models';
export * from './components';
export * from './services';

// Main execution for development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  console.log('🏛️ Thanjavur TalkMate - Starting...');
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'document-only'}`);
  console.log(`🔑 AI Enabled: ${!!(process.env.AI_API_KEY || process.env.ENABLE_AI === 'true')}`);
  
  initializeTalkMate()
    .then(async (agent) => {
      const status = agent.getSystemStatus();
      console.log('✅ TalkMate agent initialized successfully!');
      console.log(`🧠 AI Mode: ${status.aiEnabled ? 'Enabled' : 'Document-only fallback'}`);
      
      const server = await createServer();
      
      server.listen(PORT, () => {
        console.log(`🚀 TalkMate server running on http://localhost:${PORT}`);
        console.log('📱 Open your browser to start chatting with TalkMate!');
        console.log('🎯 Specialized for Thanjavur region around Brihadeeswarar Temple');
        
        if (!process.env.AI_API_KEY && process.env.ENABLE_AI !== 'false') {
          console.log('💡 Tip: Set AI_API_KEY environment variable to enable AI-powered responses');
          console.log('   Get free API key from: https://console.groq.com/keys');
        }
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down TalkMate server...');
        server.close(() => {
          console.log('👋 TalkMate server stopped. Vanakkam!');
          process.exit(0);
        });
      });

    })
    .catch((error) => {
      console.error('❌ Failed to initialize TalkMate:', error);
      process.exit(1);
    });
}