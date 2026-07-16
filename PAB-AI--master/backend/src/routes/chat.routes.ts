import { Router } from 'express';
import {
  createFolder,
  getFolders,
  deleteFolder,
  createConversation,
  getConversations,
  getConversationDetails,
  renameConversation,
  togglePinConversation,
  moveConversationToFolder,
  deleteConversation,
  continueConversation,
} from '../controllers/chat.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createFolderSchema,
  createConversationSchema,
  renameConversationSchema,
  updateConversationFolderSchema,
  continueConversationSchema,
} from '../validators/chat.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Apply requireAuth middleware to protect all chat management routes
router.use(requireAuth);

// Folders
router.post('/folders', validate(createFolderSchema), createFolder);
router.get('/folders', getFolders);
router.delete('/folders/:folderId', deleteFolder);

// Conversations
router.post('/conversations', validate(createConversationSchema), createConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getConversationDetails);
router.put('/conversations/:conversationId/rename', validate(renameConversationSchema), renameConversation);
router.put('/conversations/:conversationId/pin', togglePinConversation);
router.put('/conversations/:conversationId/folder', validate(updateConversationFolderSchema), moveConversationToFolder);
router.delete('/conversations/:conversationId', deleteConversation);

// Messaging continuation
router.post('/conversations/:conversationId/messages', validate(continueConversationSchema), continueConversation);

export default router;
