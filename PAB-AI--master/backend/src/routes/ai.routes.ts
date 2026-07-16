import { Router, Request, Response } from 'express';
import { bootstrapAIGateway, AIChatRequest } from '../ai';

const router = Router();
const aiGateway = bootstrapAIGateway();

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const chatRequest: AIChatRequest = req.body;
    
    // Validate request...
    if (!chatRequest.provider || !chatRequest.message) {
      res.status(400).json({ success: false, error: 'Provider and message are required.' });
      return;
    }

    if (chatRequest.stream) {
      // Setup SSE for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = aiGateway.chatStream(chatRequest);
      
      for await (const chunk of stream) {
        // Here chunk is assumed to be string chunk directly from provider. 
        // In a real implementation you might format this as standard SSE: `data: ${chunk}\n\n`
        res.write(`data: ${chunk}\n\n`);
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Standard chat response
      const response = await aiGateway.chat(chatRequest);
      res.json(response);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await aiGateway.getConfig();
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
