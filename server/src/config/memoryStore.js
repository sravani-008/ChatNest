import crypto from 'crypto';

const generateId = () => crypto.randomBytes(12).toString('hex');

class MemoryDocument {
  constructor(data, store) {
    this._id = data._id || generateId();
    this.id = this._id;
    this._store = store;
    Object.assign(this, data);
    this._id = this.id;
  }

  async save() {
    this.updatedAt = new Date();
    this._store.set(this.id, this);
    return this;
  }

  toJSON() {
    const copy = { ...this };
    delete copy._store;
    copy.id = this._id;
    if (copy.createdAt instanceof Date) copy.createdAt = copy.createdAt.toISOString();
    if (copy.updatedAt instanceof Date) copy.updatedAt = copy.updatedAt.toISOString();
    if (copy.lastSeen instanceof Date) copy.lastSeen = copy.lastSeen.toISOString();
    if (copy.readAt instanceof Date) copy.readAt = copy.readAt.toISOString();
    return copy;
  }
}

class UserDocument extends MemoryDocument {
  constructor(data, store) {
    super(
      {
        avatarUrl: null,
        bio: null,
        status: 'offline',
        lastSeen: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      },
      store
    );
  }
}

class ConversationDocument extends MemoryDocument {
  constructor(data, store) {
    super(
      {
        participants: [],
        lastMessageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      },
      store
    );
  }

  async populate(field) {
    if (field === 'participants') {
      this.participants = this.participants.map((p) => {
        if (typeof p === 'object' && p !== null) return p;
        const idStr = p.toString();
        const user = memoryDB.users.get(idStr);
        return user ? user : { _id: idStr, id: idStr, name: 'Unknown User' };
      });
    } else if (field === 'lastMessageId') {
      if (this.lastMessageId && typeof this.lastMessageId !== 'object') {
        const msg = memoryDB.messages.get(this.lastMessageId.toString());
        this.lastMessageId = msg || null;
      }
    }
    return this;
  }
}

class MessageDocument extends MemoryDocument {
  constructor(data, store) {
    super(
      {
        readAt: null,
        createdAt: new Date(),
        ...data,
      },
      store
    );
  }
}

// In-memory collections
export const memoryDB = {
  users: new Map(),
  conversations: new Map(),
  messages: new Map(),
};

export const MemoryUser = {
  async findOne(query) {
    const list = Array.from(memoryDB.users.values());
    return (
      list.find((u) => {
        if (query.$or) {
          return query.$or.some((subQuery) => {
            if (subQuery.googleId && u.googleId === subQuery.googleId) return true;
            if (subQuery.email && u.email?.toLowerCase() === subQuery.email?.toLowerCase()) return true;
            return false;
          });
        }
        if (query.googleId && u.googleId !== query.googleId) return false;
        if (query.email && u.email?.toLowerCase() !== query.email?.toLowerCase()) return false;
        return true;
      }) || null
    );
  },

  async findById(id) {
    if (!id) return null;
    const idStr = id.toString();
    return memoryDB.users.get(idStr) || null;
  },

  async findByIdAndUpdate(id, update) {
    const user = await this.findById(id);
    if (!user) return null;
    Object.assign(user, update);
    user.updatedAt = new Date();
    memoryDB.users.set(user.id, user);
    return user;
  },

  find(query = {}) {
    let list = Array.from(memoryDB.users.values());

    if (query._id && query._id.$ne) {
      const neId = query._id.$ne.toString();
      list = list.filter((u) => u.id !== neId);
    }

    if (query.$or) {
      list = list.filter((u) => {
        return query.$or.some((cond) => {
          if (cond.name && cond.name instanceof RegExp) {
            return cond.name.test(u.name);
          }
          if (cond.email && cond.email instanceof RegExp) {
            return cond.email.test(u.email);
          }
          return false;
        });
      });
    }

    const queryObj = {
      sort: (sortObj) => {
        if (sortObj?.name) {
          list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(list).then(resolve, reject);
      },
    };
    return queryObj;
  },

  async create(data) {
    if (Array.isArray(data)) {
      return Promise.all(data.map((item) => this.create(item)));
    }
    const doc = new UserDocument(data, memoryDB.users);
    memoryDB.users.set(doc.id, doc);
    return doc;
  },

  async countDocuments() {
    return memoryDB.users.size;
  },
};

export const MemoryConversation = {
  find(query = {}) {
    let list = Array.from(memoryDB.conversations.values());

    if (query.participants) {
      const pId = query.participants.toString();
      list = list.filter((c) =>
        c.participants.some((p) => (typeof p === 'object' ? p.id === pId : p.toString() === pId))
      );
    }

    const queryObj = {
      sort: (sortObj) => {
        if (sortObj?.updatedAt) {
          list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(list).then(resolve, reject);
      },
    };
    return queryObj;
  },

  async findOne(query = {}) {
    const list = Array.from(memoryDB.conversations.values());
    if (query.participants && query.participants.$all) {
      const reqIds = query.participants.$all.map((p) => p.toString());
      return (
        list.find((c) => {
          const currentIds = c.participants.map((p) => (typeof p === 'object' ? p.id : p.toString()));
          if (query.participants.$size && currentIds.length !== query.participants.$size) return false;
          return reqIds.every((r) => currentIds.includes(r));
        }) || null
      );
    }
    return null;
  },

  async findById(id) {
    if (!id) return null;
    return memoryDB.conversations.get(id.toString()) || null;
  },

  async create(data) {
    const doc = new ConversationDocument(data, memoryDB.conversations);
    memoryDB.conversations.set(doc.id, doc);
    return doc;
  },
};

export const MemoryMessage = {
  async countDocuments(query = {}) {
    let list = Array.from(memoryDB.messages.values());
    if (query.conversationId) {
      const cId = query.conversationId.toString();
      list = list.filter((m) => m.conversationId.toString() === cId);
    }
    if (query.receiverId) {
      const rId = query.receiverId.toString();
      list = list.filter((m) => m.receiverId.toString() === rId);
    }
    if (query.readAt === null) {
      list = list.filter((m) => m.readAt === null);
    }
    return list.length;
  },

  find(query = {}) {
    let list = Array.from(memoryDB.messages.values());

    if (query.conversationId) {
      const cId = query.conversationId.toString();
      list = list.filter((m) => m.conversationId.toString() === cId);
    }

    if (query.receiverId) {
      const rId = query.receiverId.toString();
      list = list.filter((m) => m.receiverId.toString() === rId);
    }

    if (query.readAt === null) {
      list = list.filter((m) => m.readAt === null);
    }

    if (query.createdAt && query.createdAt.$lt) {
      const ltDate = new Date(query.createdAt.$lt);
      list = list.filter((m) => new Date(m.createdAt) < ltDate);
    }

    const queryObj = {
      sort(sortObj) {
        if (sortObj?.createdAt) {
          const order = sortObj.createdAt;
          list.sort((a, b) =>
            order === -1
              ? new Date(b.createdAt) - new Date(a.createdAt)
              : new Date(a.createdAt) - new Date(b.createdAt)
          );
        }
        return queryObj;
      },
      limit(n) {
        list = list.slice(0, n);
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(list).then(resolve, reject);
      },
    };

    return queryObj;
  },

  async findById(id) {
    if (!id) return null;
    return memoryDB.messages.get(id.toString()) || null;
  },

  async create(data) {
    const doc = new MessageDocument(data, memoryDB.messages);
    memoryDB.messages.set(doc.id, doc);
    return doc;
  },

  async updateMany(filter, update) {
    let list = Array.from(memoryDB.messages.values());
    if (filter._id && filter._id.$in) {
      const ids = filter._id.$in.map((id) => id.toString());
      list = list.filter((m) => ids.includes(m.id));
    }

    for (const msg of list) {
      if (update.$set) {
        Object.assign(msg, update.$set);
      }
      memoryDB.messages.set(msg.id, msg);
    }

    return { modifiedCount: list.length };
  },
};
