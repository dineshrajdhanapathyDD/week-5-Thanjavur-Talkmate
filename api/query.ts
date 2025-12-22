import { VercelRequest, VercelResponse } from '@vercel/node';
import { DocumentKnowledgeEngineImpl } from '../src/components/DocumentKnowledgeEngine';
import { ContextProcessorImpl } from '../src/components/ContextProcessor';
import { AgentControllerImpl } from '../src/components/AgentController';

let talkMateAgent: AgentControllerImpl | null = null;

async function initializeTalkMate() {
  if (!talkMateAgent) {
    const knowledgeEngine = new DocumentKnowledgeEngineImpl();
    const contextProcessor = new ContextProcessorImpl();
    const agentController = new AgentControllerImpl(knowledgeEngine, contextProcessor);
    
    await agentController.initialize();
    talkMateAgent = agentController;
  }
  return talkMateAgent;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
}