import express from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getConversationById,
  markAsRead,
} from '../controllers/conversationController.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/:conversationId', getConversationById);
router.patch('/:conversationId/read', markAsRead);

// Nested message routes under conversation
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);

export default router;
