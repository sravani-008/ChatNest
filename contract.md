# ChatNest — Frontend & Backend Contract

**Version:** 1.0  
**Status:** Development Contract  
**Project:** ChatNest — Real-time Chat Application

---

## 1. Purpose

This document is the shared contract between the ChatNest frontend and backend.

The frontend and backend must follow the interfaces, data structures, authentication rules, API behavior, and real-time event definitions in this document.

### Core principle

> The frontend must not depend on backend implementation details. It communicates only through the API and real-time contracts defined here.

If an implementation needs to change, update this contract first when the change affects the frontend/backend boundary.

---

# 2. Product Scope

ChatNest is a real-time chat application with Google authentication.

### Version 1 features

- Google account authentication
- User profile
- User discovery/list
- One-to-one conversations
- Sending messages
- Receiving messages in real time
- Conversation/message history
- Online/offline presence
- Message timestamps
- Unread message count
- Logout
- Protected application routes

### Future features

These are **not part of Version 1** unless explicitly added later:

- Group chats
- Voice/video calls
- File/image sharing
- Message reactions
- Message editing
- Message deletion
- Push notifications
- End-to-end encryption
- Stories/status
- Advanced search

Do not implement future features unless the contract is updated.

---

# 3. Technology Boundary

The exact implementation may evolve, but the initial architecture is:

```text
Frontend
React + Vite
    |
    | HTTPS REST API
    | WebSocket / Socket.IO
    v
Backend
Node.js + Express
    |
    v
Database
MongoDB
```

Authentication:

```text
Google Account
      |
      v
Authentication Provider
      |
      v
Backend-issued authenticated session/token
```

The frontend must never directly access MongoDB.

The backend is responsible for authorization and database access.

---

# 4. Environment Configuration

The frontend must receive configuration through environment variables.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Backend:

```env
PORT=5000
MONGODB_URI=<database-connection-string>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
CLIENT_URL=http://localhost:5173
JWT_SECRET=<server-secret>
```

### Security rules

- Never commit `.env` files.
- Never expose `GOOGLE_CLIENT_SECRET`.
- Never expose `JWT_SECRET`.
- Never put database credentials in frontend code.
- Frontend environment variables must contain only values that are safe to expose to the browser.

---

# 5. API Conventions

Base URL:

```text
/api
```

All API responses use JSON.

### Success response

```json
{
  "success": true,
  "data": {}
}
```

### Error response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

The frontend must use the `code` field for programmatic handling and `message` for display/debugging.

---

# 6. Authentication Contract

## 6.1 Authentication provider

Users authenticate using their Google account.

The application must not implement its own password-based authentication for Version 1.

### Authentication flow

```text
User
 |
 | Click "Continue with Google"
 v
Google Authentication
 |
 | successful authentication
 v
Backend
 |
 | verify Google identity
 v
Create/find ChatNest user
 |
 v
Authenticated session/token
 |
 v
Frontend
```

---

## 6.2 Current User

### GET

```http
GET /api/auth/me
```

Authentication required.

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "googleId": "google_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://...",
      "status": "online",
      "createdAt": "2026-10-04T10:00:00.000Z"
    }
  }
}
```

If the user is not authenticated:

```http
401 Unauthorized
```

---

## 6.3 Logout

### POST

```http
POST /api/auth/logout
```

Authentication required.

### Response

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

# 7. User Contract

## User Object

The canonical user object is:

```json
{
  "id": "string",
  "googleId": "string",
  "name": "string",
  "email": "string",
  "avatarUrl": "string|null",
  "bio": "string|null",
  "status": "online|offline",
  "lastSeen": "ISO-8601 datetime|null",
  "createdAt": "ISO-8601 datetime",
  "updatedAt": "ISO-8601 datetime"
}
```

### Rules

- `id` is the ChatNest internal identifier.
- `googleId` uniquely identifies the Google account.
- `email` comes from the authenticated Google account.
- `avatarUrl` may be null.
- `bio` is optional.
- `status` must only be `online` or `offline`.
- `lastSeen` is updated when a user becomes offline.
- Passwords are not stored.

---

# 8. User APIs

## Get Users

### GET

```http
GET /api/users
```

Authentication required.

Optional query:

```text
/api/users?search=john
```

### Response

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "https://...",
        "status": "online",
        "lastSeen": null
      }
    ]
  }
}
```

The current authenticated user should not be included in the normal user list unless explicitly requested by a future contract update.

---

## Get User by ID

### GET

```http
GET /api/users/:userId
```

Authentication required.

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://...",
      "bio": "Hello!",
      "status": "offline",
      "lastSeen": "2026-10-04T09:30:00.000Z"
    }
  }
}
```

---

# 9. Profile Contract

## Get My Profile

### GET

```http
GET /api/profile
```

Authentication required.

---

## Update My Profile

### PATCH

```http
PATCH /api/profile
```

Authentication required.

### Request

```json
{
  "name": "John Doe",
  "bio": "Learning full-stack development"
}
```

### Rules

- `name` must not be empty.
- `bio` is optional.
- The frontend cannot modify `googleId`.
- The frontend cannot modify another user's profile through this endpoint.
- The frontend cannot modify authentication credentials.

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://...",
      "bio": "Learning full-stack development",
      "status": "online"
    }
  }
}
```

---

# 10. Conversation Contract

Version 1 supports one-to-one conversations.

## Conversation Object

```json
{
  "id": "conversation_123",
  "participant": {
    "id": "user_456",
    "name": "Jane Doe",
    "avatarUrl": "https://...",
    "status": "online",
    "lastSeen": null
  },
  "lastMessage": {
    "id": "message_789",
    "text": "Hello!",
    "senderId": "user_456",
    "createdAt": "2026-10-04T10:30:00.000Z"
  },
  "unreadCount": 2,
  "updatedAt": "2026-10-04T10:30:00.000Z"
}
```

---

# 11. Conversation APIs

## Get Conversations

### GET

```http
GET /api/conversations
```

Authentication required.

### Response

```json
{
  "success": true,
  "data": {
    "conversations": []
  }
}
```

Conversations should be ordered by most recently updated first.

---

## Create/Get One-to-One Conversation

### POST

```http
POST /api/conversations
```

Authentication required.

### Request

```json
{
  "participantId": "user_456"
}
```

### Behavior

If a conversation already exists between the authenticated user and `participantId`, return the existing conversation.

Otherwise create a new conversation.

A user cannot create a conversation with themselves.

---

## Get Conversation

### GET

```http
GET /api/conversations/:conversationId
```

Authentication required.

The authenticated user must be a participant in the conversation.

---

# 12. Message Contract

## Message Object

```json
{
  "id": "message_123",
  "conversationId": "conversation_123",
  "senderId": "user_123",
  "receiverId": "user_456",
  "text": "Hello!",
  "createdAt": "2026-10-04T10:30:00.000Z",
  "readAt": null
}
```

### Message rules

- `text` is required in Version 1.
- Empty messages are not allowed.
- Leading/trailing whitespace should be removed.
- Maximum text length: 5000 characters.
- `senderId` comes from the authenticated user, not the request body.
- `conversationId` must refer to a conversation the sender belongs to.
- The backend controls `createdAt`.
- The frontend must not manually set `senderId`.

---

# 13. Message APIs

## Get Messages

### GET

```http
GET /api/conversations/:conversationId/messages
```

Authentication required.

Optional pagination:

```text
/api/conversations/:conversationId/messages?limit=50&before=<messageId>
```

### Response

```json
{
  "success": true,
  "data": {
    "messages": [],
    "hasMore": false
  }
}
```

Messages should be returned in chronological order for display.

---

## Send Message

### POST

```http
POST /api/conversations/:conversationId/messages
```

Authentication required.

### Request

```json
{
  "text": "Hello!"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message_123",
      "conversationId": "conversation_123",
      "senderId": "user_123",
      "receiverId": "user_456",
      "text": "Hello!",
      "createdAt": "2026-10-04T10:30:00.000Z",
      "readAt": null
    }
  }
}
```

---

# 14. Read Messages

### PATCH

```http
PATCH /api/conversations/:conversationId/read
```

Authentication required.

### Behavior

Marks messages received by the authenticated user as read.

### Response

```json
{
  "success": true,
  "data": {
    "conversationId": "conversation_123",
    "unreadCount": 0
  }
}
```

---

# 15. Real-Time Communication Contract

REST APIs handle persistent data.

WebSockets/Socket.IO handle real-time events.

```text
REST API
→ Login
→ Load users
→ Load conversations
→ Load message history
→ Send message
→ Update profile

Socket
→ New messages
→ Online/offline status
→ Read status
```

---

# 16. Socket Authentication

The socket connection must be authenticated.

Unauthenticated sockets must not be allowed to access private chat events.

Example conceptual connection:

```text
Frontend
   |
   | authenticated socket connection
   v
Socket Server
   |
   | verify session/token
   v
Connected User
```

---

# 17. Real-Time Events

## `message:new`

Server → recipient

```json
{
  "event": "message:new",
  "data": {
    "message": {
      "id": "message_123",
      "conversationId": "conversation_123",
      "senderId": "user_123",
      "receiverId": "user_456",
      "text": "Hello!",
      "createdAt": "2026-10-04T10:30:00.000Z",
      "readAt": null
    }
  }
}
```

Frontend behavior:

- Add the message to the active conversation if open.
- Otherwise increment unread count.
- Update the conversation's last message.

---

## `message:sent`

Server → sender

Confirms that the message was persisted.

```json
{
  "event": "message:sent",
  "data": {
    "message": {}
  }
}
```

---

## `message:read`

Server → sender

```json
{
  "event": "message:read",
  "data": {
    "conversationId": "conversation_123",
    "messageIds": [
      "message_123"
    ],
    "readAt": "2026-10-04T10:35:00.000Z"
  }
}
```

---

## `user:online`

Server → connected clients who need the update

```json
{
  "event": "user:online",
  "data": {
    "userId": "user_456"
  }
}
```

---

## `user:offline`

Server → connected clients who need the update

```json
{
  "event": "user:offline",
  "data": {
    "userId": "user_456",
    "lastSeen": "2026-10-04T10:40:00.000Z"
  }
}
```

---

# 18. Database Contract

MongoDB is the planned database.

Collections:

```text
users
conversations
messages
```

---

## Users Collection

Example:

```json
{
  "_id": "ObjectId",
  "googleId": "google_123",
  "name": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "https://...",
  "bio": "Hello!",
  "status": "offline",
  "lastSeen": "2026-10-04T10:40:00.000Z",
  "createdAt": "2026-10-04T10:00:00.000Z",
  "updatedAt": "2026-10-04T10:40:00.000Z"
}
```

Required unique fields:

```text
googleId
email
```

---

## Conversations Collection

Example:

```json
{
  "_id": "ObjectId",
  "participants": [
    "user_123",
    "user_456"
  ],
  "lastMessageId": "message_789",
  "createdAt": "2026-10-04T10:00:00.000Z",
  "updatedAt": "2026-10-04T10:30:00.000Z"
}
```

For Version 1:

```text
participants.length === 2
```

---

## Messages Collection

Example:

```json
{
  "_id": "ObjectId",
  "conversationId": "conversation_123",
  "senderId": "user_123",
  "receiverId": "user_456",
  "text": "Hello!",
  "createdAt": "2026-10-04T10:30:00.000Z",
  "readAt": null
}
```

---

# 19. Authorization Rules

Authentication and authorization are different.

### Authentication

> Who are you?

### Authorization

> Are you allowed to access this resource?

The backend must enforce both.

Examples:

- A logged-out user cannot access `/api/conversations`.
- User A cannot read User B's private conversation with User C.
- User A cannot send a message using User B's `senderId`.
- User A cannot modify User B's profile.
- User A cannot mark User B's unrelated conversation as read.

The frontend must never be considered a security boundary.

---

# 20. HTTP Status Codes

Use these consistently:

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Validation error |
| 429 | Too many requests |
| 500 | Internal server error |

---

# 21. Standard Error Codes

Examples:

```text
AUTH_REQUIRED
AUTH_INVALID
USER_NOT_FOUND
CONVERSATION_NOT_FOUND
NOT_CONVERSATION_MEMBER
MESSAGE_NOT_FOUND
INVALID_MESSAGE
MESSAGE_TOO_LONG
INVALID_USER
PROFILE_UPDATE_FAILED
INTERNAL_ERROR
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "NOT_CONVERSATION_MEMBER",
    "message": "You are not a member of this conversation."
  }
}
```

---

# 22. Frontend Pages

The frontend should contain these primary routes:

```text
/
├── /login
├── /chat
├── /chat/:conversationId
└── /profile
```

### Route behavior

Unauthenticated:

```text
/chat → redirect to /login
/profile → redirect to /login
```

Authenticated:

```text
/login → redirect to /chat
```

---

# 23. Frontend Component Structure

Suggested structure:

```text
src/
│
├── components/
│   ├── auth/
│   ├── chat/
│   ├── profile/
│   ├── layout/
│   └── common/
│
├── pages/
│   ├── LoginPage.jsx
│   ├── ChatPage.jsx
│   └── ProfilePage.jsx
│
├── services/
│   ├── api.js
│   ├── authService.js
│   └── socketService.js
│
├── hooks/
│   ├── useAuth.js
│   └── useSocket.js
│
├── context/
│   └── AuthContext.jsx
│
├── utils/
│
└── App.jsx
```

This is a suggested structure, not a strict implementation requirement.

---

# 24. Frontend State

The frontend should maintain at least:

```text
Authentication state
Current user
Users
Conversations
Active conversation
Messages
Unread counts
Socket connection state
Loading states
Error states
```

Avoid duplicating the same data unnecessarily in multiple state locations.

---

# 25. Loading and Error Behavior

Every API-dependent UI must have appropriate states:

```text
Loading
   ↓
Success
   ↓
Data displayed
```

or

```text
Loading
   ↓
Error
   ↓
Retry / useful error message
```

The UI must not silently fail.

Examples:

- Login failure → show authentication error.
- Users fail to load → show retry option.
- Messages fail to load → show error state.
- Message sending fails → do not permanently display it as successfully sent.

---

# 26. Message Sending Flow

Expected flow:

```text
User types message
       ↓
Frontend validates message
       ↓
Frontend sends POST request
       ↓
Backend authenticates user
       ↓
Backend verifies conversation membership
       ↓
Backend validates message
       ↓
Backend saves message
       ↓
Backend updates conversation
       ↓
Backend emits real-time event
       ↓
Frontend updates UI
```

The backend is the source of truth.

---

# 27. Conversation Loading Flow

```text
Open Chat
    ↓
Load conversation
    ↓
Load message history
    ↓
Connect/verify socket
    ↓
Listen for new messages
    ↓
Mark relevant messages as read
```

---

# 28. Google Authentication Rules

The application must:

- Use Google's official authentication mechanism/provider.
- Verify authentication on the backend where applicable.
- Create a ChatNest user after successful authentication.
- Reuse the existing user when the Google account already exists.
- Never store the user's Google password.
- Never ask the user to enter their Google password inside ChatNest.
- Never trust user identity information supplied directly by the browser.

---

# 29. Security Requirements

Minimum requirements:

- HTTPS in production.
- Secure authentication/session handling.
- Environment secrets excluded from Git.
- Input validation on backend.
- Authorization checks on protected resources.
- Rate limiting for sensitive APIs where appropriate.
- CORS configured for the known frontend origin.
- MongoDB credentials never exposed to frontend.
- Do not log authentication secrets or tokens.
- Sanitize/validate user-generated content.

---

# 30. API Versioning

Initial API:

```text
/api
```

If breaking changes become necessary, use:

```text
/api/v2
```

Do not silently change the meaning or structure of an existing endpoint.

---

# 31. Contract Change Rules

If a change affects communication between frontend and backend:

1. Update `contract.md`.
2. Identify whether the change is breaking or non-breaking.
3. Update backend.
4. Update frontend.
5. Test the affected flow.

Examples of contract changes:

- Renaming an API field.
- Changing an endpoint.
- Changing authentication behavior.
- Adding required request fields.
- Changing response structure.
- Adding/removing real-time events.

---

# 32. Definition of Done — Version 1

Version 1 is complete when:

### Authentication

- [ ] User can sign in with Google.
- [ ] User remains authenticated after refresh.
- [ ] User can log out.
- [ ] Protected routes work.
- [ ] Unauthorized API requests are rejected.

### Profile

- [ ] User profile displays Google information.
- [ ] User can update allowed profile fields.
- [ ] Profile changes persist.

### Users

- [ ] Authenticated user can see other users.
- [ ] User search works if implemented.
- [ ] Online/offline status is displayed.

### Conversations

- [ ] User can start a one-to-one conversation.
- [ ] Existing conversation is reused.
- [ ] Conversations are listed.
- [ ] Most recent conversation appears first.

### Messaging

- [ ] User can send a text message.
- [ ] Messages are persisted.
- [ ] Message history loads.
- [ ] New messages appear in real time.
- [ ] Unread count works.
- [ ] Read status works.

### Quality

- [ ] Loading states exist.
- [ ] Error states exist.
- [ ] Responsive UI works.
- [ ] No secrets are committed.
- [ ] Backend authorization is enforced.

---

# 33. Development Order

Do not implement everything simultaneously.

Recommended order:

```text
1. Project setup
       ↓
2. Frontend layout
       ↓
3. Google authentication
       ↓
4. User/profile system
       ↓
5. Backend setup
       ↓
6. MongoDB connection
       ↓
7. User APIs
       ↓
8. Conversation APIs
       ↓
9. Message APIs
       ↓
10. Socket/real-time messaging
       ↓
11. Read/unread status
       ↓
12. Error handling + security
       ↓
13. Testing
       ↓
14. Deployment
```

---

# 34. Important Rule for AI-Assisted Development

Antigravity and other AI tools may generate implementation code, but generated code must conform to this contract.

Do not change the API/data contract simply because generated code uses a different structure.

If generated code conflicts with this document:

```text
contract.md
      ↓
takes priority
      ↓
implementation must be adjusted
```

AI-generated code must be reviewed before accepting it.

---

# 35. Final Architecture

The intended Version 1 architecture is:

```text
                         ┌─────────────────┐
                         │   Google Auth   │
                         └────────┬────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────┐
│                    React Frontend                   │
│                                                     │
│  Login │ Chat │ Conversations │ Messages │ Profile │
└───────────────────────┬─────────────────────────────┘
                        │
              HTTPS REST + Socket
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                 Node.js + Express                   │
│                                                     │
│ Auth │ Users │ Profile │ Conversations │ Messages  │
│                                                     │
│                 Socket.IO Server                    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   MongoDB    │
                 │              │
                 │ Users        │
                 │ Conversations│
                 │ Messages     │
                 └──────────────┘
```

---

# 36. Contract Ownership

This document is the shared agreement between:

- Frontend implementation
- Backend implementation
- Database design
- Real-time communication
- AI-assisted development

The contract should remain understandable to a beginner and strict enough to prevent frontend/backend mismatches.

**End of Contract**
