"use strict";
/**
 * Main application entry point
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTalkMate = initializeTalkMate;
require("dotenv/config");
const path = __importStar(require("path"));
const http = __importStar(require("http"));
const fs = __importStar(require("fs/promises"));
const DocumentKnowledgeEngine_1 = require("./components/DocumentKnowledgeEngine");
const ContextProcessor_1 = require("./components/ContextProcessor");
const AgentController_1 = require("./components/AgentController");
const GoogleMapsService_1 = require("./services/GoogleMapsService");
// Global TalkMate instance
let talkMateAgent = null;
let mapsService = null;
async function initializeTalkMate() {
    const knowledgeEngine = new DocumentKnowledgeEngine_1.DocumentKnowledgeEngineImpl();
    const contextProcessor = new ContextProcessor_1.ContextProcessorImpl();
    const agentController = new AgentController_1.AgentControllerImpl(knowledgeEngine, contextProcessor);
    await agentController.initialize();
    talkMateAgent = agentController;
    // Initialize Google Maps service
    mapsService = new GoogleMapsService_1.GoogleMapsService();
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
        }
        catch (error) {
            console.error('Server error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    });
    return server;
}
async function handleQueryRequest(req, res) {
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
            }
            catch (error) {
                console.error('Query processing error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: true,
                    message: 'Invalid request format',
                    code: 'INVALID_REQUEST'
                }));
            }
        });
    }
    catch (error) {
        console.error('Request handling error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: true,
            message: 'Server error',
            code: 'SERVER_ERROR'
        }));
    }
}
async function handleNearbyAttractionsRequest(req, res) {
    try {
        if (!mapsService) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Maps service not initialized' }));
            return;
        }
        const attractions = await mapsService.getNearbyTouristAttractions();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ attractions }));
    }
    catch (error) {
        console.error('Error fetching nearby attractions:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch nearby attractions' }));
    }
}
async function handleNearbyRestaurantsRequest(req, res) {
    try {
        if (!mapsService) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Maps service not initialized' }));
            return;
        }
        const restaurants = await mapsService.getNearbyRestaurants();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ restaurants }));
    }
    catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch nearby restaurants' }));
    }
}
async function handleTrafficRequest(req, res) {
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
    }
    catch (error) {
        console.error('Error fetching traffic info:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch traffic information' }));
    }
}
async function serveStaticFile(url, res) {
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
    }
    catch (error) {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
    }
}
function getFilePath(url) {
    const uiDir = path.join(__dirname, 'ui');
    // Security: prevent directory traversal
    const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
    return path.join(uiDir, safePath);
}
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
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
__exportStar(require("./models"), exports);
__exportStar(require("./components"), exports);
__exportStar(require("./services"), exports);
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
//# sourceMappingURL=index.js.map