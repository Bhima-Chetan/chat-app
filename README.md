# Chat App (React Native + Node.js + Socket.IO)

Monorepo with two packages:
- `/server`: Node.js (Express + Socket.IO) + MongoDB (Mongoose)
- `/mobile`: Expo React Native app

## Features (MVP)
- JWT auth: Register, Login
- User list with online/offline and last message
- 1:1 chat, real-time messaging via Socket.IO
- Messages persisted in MongoDB
- Typing indicator
- Online/offline presence
- Delivery and read receipts (single tick = sent, double tick = read)

## Quick Start (Windows PowerShell)

### Prereqs
- Node.js 18+
- MongoDB (local or Atlas) connection string
- Git (optional)

### 1) Server
1. Copy env file:
   - Duplicate `server/.env.example` to `server/.env` and set values.
2. Install deps and run dev server:
```
cd server
npm install
npm run dev
```
Server starts on http://localhost:4000

3. (Optional) Seed sample users:
```
cd server
npm run seed
```
Creates users: alice/alice123, bob/bob123

### 2) Mobile (Expo)
1. In another terminal:
```
cd mobile
npm install
npm start
```
2. Use Expo Go or emulator to run the app. Default server URL is `http://localhost:4000`.

If testing on a physical device, ensure the device can reach your machine (use your LAN IP) and update `MOBILE_SERVER_URL` in `mobile/.env`.

## API Endpoints
- POST `/auth/register` { username, password }
- POST `/auth/login` { username, password }
- GET `/users` (auth)
- GET `/conversations/:id/messages` (auth) — `:id` is the peer userId

## Socket Events
- `message:send` (client -> server): { to, text, tempId? }
- `message:new` (server -> clients): { message }
- `typing:start|stop` (client -> server): { to }
- `message:read` (client -> server): { conversationId, messageIds }
- `presence:update` (server -> clients): { userId, online, lastSeen }

## Env Vars
See `server/.env.example` and `mobile/.env.example` for all variables.

## Repo Structure
```
/server
  src/
  package.json
/mobile
  src/
  package.json
```

