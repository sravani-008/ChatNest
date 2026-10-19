import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { getSocketIO } from '../socket/socketHandler.js';

const getParticipantIdStr = (p) => {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (p._id) return p._id.toString();
  if (p.id) return p.id.toString();
  return p.toString();
};

export const formatConversation = async (convDoc, currentUserId) => {
  const currentUserIdStr = currentUserId.toString();
  await convDoc.populate('participants');
  await convDoc.populate('lastMessageId');

  const otherParticipant = convDoc.participants.find(
    (p) => p && getParticipantIdStr(p) !== currentUserIdStr
  );

  const convIdStr = (convDoc._id || convDoc.id).toString();

  const unreadCount = await Message.countDocuments({
    conversationId: convIdStr,
    receiverId: currentUserIdStr,
    readAt: null,
  });

  let lastMsg = null;
  if (convDoc.lastMessageId) {
    const lm = convDoc.lastMessageId;
    lastMsg = {
      id: (lm._id || lm.id).toString(),
      text: lm.text,
      senderId: lm.senderId.toString(),
      createdAt: lm.createdAt instanceof Date ? lm.createdAt.toISOString() : new Date(lm.createdAt).toISOString(),
    };
  }

  const updatedAtIso =
    convDoc.updatedAt instanceof Date
      ? convDoc.updatedAt.toISOString()
      : new Date(convDoc.updatedAt || convDoc.createdAt).toISOString();

  return {
    id: convIdStr,
    participant: otherParticipant
      ? {
          id: getParticipantIdStr(otherParticipant),
          name: otherParticipant.name,
          avatarUrl: otherParticipant.avatarUrl,
          status: otherParticipant.status,
          lastSeen: otherParticipant.lastSeen
            ? (otherParticipant.lastSeen instanceof Date
                ? otherParticipant.lastSeen.toISOString()
                : new Date(otherParticipant.lastSeen).toISOString())
            : null,
        }
      : null,
    lastMessage: lastMsg,
    unreadCount,
    updatedAt: updatedAtIso,
  };
};

export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.userId.toString();

    const conversations = await Conversation.find({
      participants: currentUserId,
    }).sort({ updatedAt: -1 });

    const formatted = await Promise.all(
      conversations.map((conv) => formatConversation(conv, currentUserId))
    );

    return res.status(200).json({
      success: true,
      data: {
        conversations: formatted.filter((c) => c.participant !== null),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const currentUserId = req.userId.toString();
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER',
          message: 'participantId is required.',
        },
      });
    }

    if (participantId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER',
          message: 'Cannot create a conversation with yourself.',
        },
      });
    }

    const participantUser = await User.findById(participantId);
    if (!participantUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Participant user not found.',
        },
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, participantId],
      });
    }

    const formatted = await formatConversation(conversation, currentUserId);

    return res.status(200).json({
      success: true,
      data: {
        conversation: formatted,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const currentUserId = req.userId.toString();
    const { conversationId } = req.params;

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

    const formatted = await formatConversation(conversation, currentUserId);

    return res.status(200).json({
      success: true,
      data: {
        conversation: formatted,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const currentUserId = req.userId.toString();
    const { conversationId } = req.params;

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

    const unreadMessages = await Message.find({
      conversationId,
      receiverId: currentUserId,
      readAt: null,
    });

    const now = new Date();
    const messageIds = unreadMessages.map((m) => (m._id || m.id).toString());

    if (messageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessages.map((m) => m._id || m.id) } },
        { $set: { readAt: now } }
      );

      // Notify the sender(s) in real time via socket
      try {
        const io = getSocketIO();
        if (io) {
          const otherParticipant = conversation.participants.find(
            (p) => getParticipantIdStr(p) !== currentUserId
          );
          if (otherParticipant) {
            io.to(getParticipantIdStr(otherParticipant)).emit('message:read', {
              conversationId,
              messageIds,
              readAt: now.toISOString(),
            });
          }
        }
      } catch (socketErr) {
        console.error('Socket emit error on markAsRead:', socketErr);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        conversationId,
        unreadCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
