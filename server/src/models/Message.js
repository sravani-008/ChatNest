import mongoose from 'mongoose';
import { MemoryMessage } from '../config/memoryStore.js';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.conversationId = ret.conversationId.toString();
        ret.senderId = ret.senderId.toString();
        ret.receiverId = ret.receiverId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const MongooseMessage = mongoose.model('Message', messageSchema);

export const Message = new Proxy(MongooseMessage, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryMessage[prop] || target[prop];
  },
});
