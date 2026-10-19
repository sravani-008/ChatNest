# ChatNest — Real-Time Messenger

ChatNest is a modern, real-time messaging web application inspired by WhatsApp and built with **React + Vite** on the frontend, **Node.js + Express + Socket.IO** on the backend, and **MongoDB** (with automatic zero-dependency embedded store fallback for instantaneous local development).

Built strictly in accordance with [contract.md](file:///c:/Users/Testing/OneDrive/dri/OneDrive/Desktop/projects/myWhatsApp/contract.md).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```
*(Dependencies are already installed in this workspace)*

### 2. Start Both Server & Client
From the project root:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Socket.IO:** `http://localhost:5000`

---

## ⚡ Features & Architecture

### 1. Authentication
- **Google Sign-In:** Official Google Identity Services integration.
- **Dev Sandbox / Quick Sign-In:** One-click persona switcher (Sarah Connor, Marcus Reed, Elena Rostova, or custom profiles) to test multi-user real-time chats across multiple browser windows or incognito tabs without configuring Google Cloud keys immediately.
- **Session Persistence:** Secure JWT token stored in browser `localStorage`, verified via `GET /api/auth/me`.
- **Protected Routes:** Automatic redirects for `/chat`, `/chat/:conversationId`, `/profile`, and `/login`.

### 2. Real-Time Communication (Socket.IO)
- Authenticated WebSocket handshake via JWT.
- `message:new` — Instant delivery to recipient tab.
- `message:sent` — Confirmation event to sender tab.
- `message:read` — Blue/emerald double tick read receipts.
- `user:online` & `user:offline` — Live presence status and `lastSeen` timestamps.

### 3. Conversations & Messaging
- One-to-one messaging with conversation reuse.
- Dynamic unread count badges.
- Date separators ("Today", "Yesterday", specific dates).
- WhatsApp-style chat bubbles with read status indicators.
- Quick emoji bar and auto-scrolling message list.
- User discovery and real-time search.

### 4. User Profiles
- View Google identity details and membership timestamp.
- Edit display name and bio with real-time validation and persistence.

---

## 🔑 Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatnest
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLIENT_URL=http://localhost:5173
JWT_SECRET=chatnest_super_secret_jwt_key_2026_dev
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
```

---

## 🧪 Testing Multi-User Chat
1. Open [http://localhost:5173](http://localhost:5173) in your normal browser window and sign in as **Sarah Connor**.
2. Open an Incognito window or a second browser at [http://localhost:5173](http://localhost:5173) and sign in as **Marcus Reed**.
3. In Sarah's window, click **"+"** (New Chat), select **Marcus Reed**, and send a message.
4. Watch the message, unread badge, and read ticks appear in Marcus's window in real time!
