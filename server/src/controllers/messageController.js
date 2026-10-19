import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { getSocketIO } from '../socket/socketHandler.js';

const getParticipantIdStr = (p) => {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (p._id) return p._id.toString();
  if (p.id) return p.id.toString();
  return p.toString();
};

export const getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.userId.toString();
    const { conversationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const { before } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversation not found.',
        },
      });
    }

    const isMember = conversation.participants.some(
      (p) => getParticipantIdStr(p) === currentUserId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_CONVERSATION_MEMBER',
          message: 'You are not a member of this conversation.',
        },
      });
    }

    const query = { conversationId };

    if (before) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Fetch the most recent `limit + 1` messages before the cursor
    const rawMessages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = rawMessages.length > limit;
    const messagesToReturn = hasMore ? rawMessages.slice(0, limit) : rawMessages;

    // Messages must be returned in chronological order for display
    messagesToReturn.reverse();

    const formattedMessages = messagesToReturn.map((m) => ({
      id: m._id ? m._id.toString() : m.id.toString(),
      conversationId: m.conversationId.toString(),
      senderId: m.senderId.toString(),
      receiverId: m.receiverId.toString(),
      text: m.text,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date(m.createdAt).toISOString(),
      readAt: m.readAt ? (m.readAt instanceof Date ? m.readAt.toISOString() : new Date(m.readAt).toISOString()) : null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        messages: formattedMessages,
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const currentUserId = req.userId.toString();
    const { conversationId } = req.params;
    let { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message text cannot be empty.',
        },
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 5000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MESSAGE_TOO_LONG',
          message: 'Message cannot exceed 5000 characters.',
        },
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversation not found.',
        },
      });
    }

    const isMember = conversation.participants.some(
      (p) => getParticipantIdStr(p) === currentUserId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_CONVERSATION_MEMBER',
          message: 'You are not a member of this conversation.',
        },
      });
    }

    const otherParticipant = conversation.participants.find(
      (p) => getParticipantIdStr(p) !== currentUserId
    );

    if (!otherParticipant) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Cannot determine recipient for this conversation.',
        },
      });
    }

    const receiverId = getParticipantIdStr(otherParticipant);

    const message = await Message.create({
      conversationId,
      senderId: currentUserId,
      receiverId,
      text: trimmedText,
    });

    conversation.lastMessageId = message._id || message.id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const formattedMessage = {
      id: (message._id || message.id).toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      text: message.text,
      createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : new Date(message.createdAt).toISOString(),
      readAt: null,
    };

    // Emit real-time socket events
    try {
      const io = getSocketIO();
      if (io) {
        // Server -> recipient
        io.to(receiverId).emit('message:new', {
          message: formattedMessage,
        });

        // Server -> sender (confirmation)
        io.to(currentUserId).emit('message:sent', {
          message: formattedMessage,
        });
      }
    } catch (socketErr) {
      console.error('Socket emission error in sendMessage:', socketErr);
    }

    return res.status(201).json({
      success: true,
      data: {
        message: formattedMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};
