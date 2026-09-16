# AI Assistant — Backend

Node.js/Express API for the Flutter app: user accounts, a task store, chat history, and the
Claude API integration (your Anthropic key lives here, never on-device).

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET to a long random string, and ANTHROPIC_API_KEY to your key
npm start
```

Server listens on `http://localhost:4000` by default (`PORT` in `.env`).

Storage is a local JSON file (`src/data/db.json`, created on first run, gitignored) via `lowdb` —
no database server to install. Swap `src/db.js` for a real database later without touching routes
or services, since they only go through `src/services/*`.

## API

All endpoints except `/health` and `/api/auth/*` require `Authorization: Bearer <token>`.

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/health` | — | liveness check |
| POST | `/api/auth/signup` | `{ email, password }` | password ≥ 8 chars |
| POST | `/api/auth/login` | `{ email, password }` | |
| GET | `/api/tasks` | — | list tasks, newest first |
| POST | `/api/tasks` | `{ title }` | |
| PATCH | `/api/tasks/:id/toggle` | — | flips done |
| DELETE | `/api/tasks/:id` | — | |
| POST | `/api/tasks/complete-all` | — | marks every open task done |
| POST | `/api/tasks/clear-completed` | — | removes every done task |
| GET | `/api/messages` | — | chat history |
| DELETE | `/api/messages` | — | clears chat history |
| POST | `/api/chat` | `{ text }` | routes through the same intent grammar as the mobile app; task commands mutate the DB directly, "call X" returns `{ intent: "call", target }` for the client to resolve locally (contacts + dialer live on-device), anything else goes to Claude |

## Why "call" doesn't happen here

The server has no access to a phone's contacts or dialer. `/api/chat` recognizes "call X" and hands
`target` back to the client; the Flutter app resolves the contact and opens the native dialer —
same reasoning as the React Native app: neither iOS nor Android lets an app place a call without
the user tapping something.
