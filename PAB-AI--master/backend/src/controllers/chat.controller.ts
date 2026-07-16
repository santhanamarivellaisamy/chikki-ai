import { Request, Response, NextFunction } from 'express';
import { chatRepository } from '../database/db';
import { bootstrapAIGateway } from '../ai';

const aiGateway = bootstrapAIGateway();

// Folders
export const createFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;
    const folder = await chatRepository.createFolder(userId, name);
    res.status(201).json({ success: true, folder });
  } catch (error) {
    next(error);
  }
};

export const getFolders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const folders = await chatRepository.getFolders(userId);
    res.status(200).json({ success: true, folders });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const folderId = req.params.folderId as string;
    await chatRepository.deleteFolder(userId, folderId);
    res.status(200).json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Conversations
export const createConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, folderId, metadata } = req.body;
    const convo = await chatRepository.createConversation(userId, title, folderId, metadata || {});
    res.status(201).json({ success: true, conversation: convo });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const folderId = req.query.folderId !== undefined ? (req.query.folderId === 'null' ? null : String(req.query.folderId)) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const pinnedOnly = req.query.pinnedOnly === 'true';

    const conversations = await chatRepository.getConversations(userId, { folderId, search, pinnedOnly });
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversationDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;
    const convo = await chatRepository.getConversationById(conversationId);
    if (!convo || convo.userId !== req.user!.id) {
      res.status(404).json({ error: { message: 'Conversation not found' } });
      return;
    }

    const messages = await chatRepository.getMessagesByConversationId(conversationId);
    res.status(200).json({ success: true, conversation: convo, messages });
  } catch (error) {
    next(error);
  }
};

export const renameConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;
    const { title } = req.body;

    const convo = await chatRepository.getConversationById(conversationId);
    if (!convo || convo.userId !== req.user!.id) {
      res.status(404).json({ error: { message: 'Conversation not found' } });
      return;
    }

    const updated = await chatRepository.updateConversation(conversationId, { title });
    res.status(200).json({ success: true, conversation: updated });
  } catch (error) {
    next(error);
  }
};

export const togglePinConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;

    const convo = await chatRepository.getConversationById(conversationId);
    if (!convo || convo.userId !== req.user!.id) {
      res.status(404).json({ error: { message: 'Conversation not found' } });
      return;
    }

    const updated = await chatRepository.updateConversation(conversationId, { isPinned: !convo.isPinned });
    res.status(200).json({ success: true, conversation: updated });
  } catch (error) {
    next(error);
  }
};

export const moveConversationToFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;
    const { folderId } = req.body; // Expect uuid or null

    const convo = await chatRepository.getConversationById(conversationId);
    if (!convo || convo.userId !== req.user!.id) {
      res.status(404).json({ error: { message: 'Conversation not found' } });
      return;
    }

    const updated = await chatRepository.updateConversation(conversationId, { folderId });
    res.status(200).json({ success: true, conversation: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;

    const convo = await chatRepository.getConversationById(conversationId);
    if (!convo || convo.userId !== req.user!.id) {
      res.status(404).json({ error: { message: 'Conversation not found' } });
      return;
    }

    await chatRepository.deleteConversation(conversationId);
    res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Messaging / AI Gateway Continuation
export const continueConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;
    const { message, provider, model, stream } = req.body;

    const convo = await chatRepository.getConversationById(conversationId);
    if (!convo || convo.userId !== req.user!.id) {
      res.status(404).json({ error: { message: 'Conversation not found' } });
      return;
    }

    // Save user message to database
    const userMsg = await chatRepository.createMessage(conversationId, 'user', message);

    // Call AI Gateway
    const chatRequest = { provider, model, message, conversationId, stream };

    if (stream) {
      // SSE Streaming setup
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send the user message details back so the frontend has confirmation
      res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMsg })}\n\n`);

      let fullAiResponse = '';
      const responseStream = aiGateway.chatStream(chatRequest);

      for await (const chunk of responseStream) {
        fullAiResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`);
      }

      // Save AI message to database
      const aiMsg = await chatRepository.createMessage(conversationId, 'ai', fullAiResponse);

      // Send end signal and payload details
      res.write(`data: ${JSON.stringify({ type: 'done', message: aiMsg })}\n\n`);
      res.end();
    } else {
      // Standard HTTP response
      const aiResponse = await aiGateway.chat(chatRequest);

      if (!aiResponse.success) {
        res.status(502).json({ error: { message: aiResponse.error || 'AI Gateway failed to respond' } });
        return;
      }

      // Save AI response to DB
      const aiMsg = await chatRepository.createMessage(conversationId, 'ai', aiResponse.response);

      res.status(200).json({
        success: true,
        userMessage: userMsg,
        aiMessage: aiMsg,
        usage: aiResponse.usage,
      });
    }
  } catch (error) {
    next(error);
  }
};
