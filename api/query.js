"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const DocumentKnowledgeEngine_1 = require("../src/components/DocumentKnowledgeEngine");
const ContextProcessor_1 = require("../src/components/ContextProcessor");
const AgentController_1 = require("../src/components/AgentController");
let talkMateAgent = null;
async function initializeTalkMate() {
    if (!talkMateAgent) {
        const knowledgeEngine = new DocumentKnowledgeEngine_1.DocumentKnowledgeEngineImpl();
        const contextProcessor = new ContextProcessor_1.ContextProcessorImpl();
        const agentController = new AgentController_1.AgentControllerImpl(knowledgeEngine, contextProcessor);
        await agentController.initialize();
        talkMateAgent = agentController;
    }
    return talkMateAgent;
}
async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { query, context } = req.body;
        const agent = await initializeTalkMate();
        const response = await agent.processQuery(query, context);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Query processing error:', error);
        res.status(500).json({
            error: true,
            message: 'Server error',
            code: 'SERVER_ERROR'
        });
    }
}
//# sourceMappingURL=query.js.map