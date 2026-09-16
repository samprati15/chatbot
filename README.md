# AI Assistant

This repo has two client implementations of the same product, plus a backend for the second one:

- **`/` (this directory)** — the original React Native / Expo app. Client-only: it calls the
  Anthropic API directly with a key you enter in-app, and stores tasks/chat on-device.
- **[`flutter_app/`](flutter_app/README.md)** — a Flutter rewrite with real accounts (signup/login)
  and server-stored tasks/chat, backed by:
- **[`backend/`](backend/README.md)** — a Node/Express API (auth, tasks, chat/Claude proxy) that
  only the Flutter app talks to. The React Native app above needs no backend.

Both clients implement the same three features and the same stance on calling — see below.

## React Native / Expo app (this directory)

A mobile chatbot that:

- **Answers questions** — general Q&A powered by the Anthropic Claude API (bring your own API key).
- **Manages your tasks** — add, list, complete, and delete tasks from the Tasks tab or straight from
  chat (e.g. "remind me to buy milk", "list my tasks", "done with milk", "complete all tasks",
  "delete task milk", "clear completed tasks"). Task commands apply immediately, no confirmation
  step.
- **Calls people for you** — say "call Mom" or "call +1 555 123 4567" and the assistant looks up the
  contact and opens your phone's dialer with the number ready to go.

### Why calling opens the dialer instead of dialing silently

iOS and Android deliberately do not let third-party apps place a phone call without the user
tapping something — this stops apps from making calls (and running up charges) behind your back.
So "call for me" here means the realistic, permitted version: the assistant resolves the contact
name to a number and hands you a pre-filled dialer. You confirm with one tap.

### Getting started

```bash
npm install
npx expo start
```

Then open the app in Expo Go (scan the QR code) or an iOS/Android simulator.

### Running the tests

```bash
npm test        # jest — intent parsing + task CRUD
npm run typecheck
```

### Enable Q&A

1. Get an API key from https://console.anthropic.com.
2. In the app, go to **Settings**, paste the key, and hit **Save**.
3. The key is stored locally on-device via `expo-secure-store` — it is never bundled with the app
   or sent anywhere except directly to Anthropic's API.

### Enable calling

The first time you ask the assistant to call someone by name, it will request contacts permission
to look up their number. You can always say the phone number directly instead ("call 5551234567")
to skip that.

### Project structure

```
App.tsx                     App entry, wraps navigation
src/
  navigation/                Bottom-tab navigator (Chat / Tasks / Settings)
  screens/
    ChatScreen.tsx           Chat UI + routes each message to the right handler
    TasksScreen.tsx          Standalone task list UI
    SettingsScreen.tsx       API key + model configuration
  services/
    intent.ts                Parses chat text into task / call / chat intents
    llm.ts                   Anthropic Messages API client
    tasks.ts                 Task CRUD (AsyncStorage)
    calling.ts               Contact lookup + native dialer (expo-contacts, Linking)
    settings.ts              Load/save API key (SecureStore) + model choice
    storage.ts                Small AsyncStorage/SecureStore helpers
    __tests__/                Jest tests for intent parsing + task CRUD
  theme/colors.ts             Shared color palette
```

### Notes / next steps

- Chat commands are matched with simple patterns (see `src/services/intent.ts`); anything that
  doesn't match a task/call command falls through to the LLM.
- To place calls autonomously (no user tap) you'd need a telephony backend such as Twilio, plus
  explicit user consent per call — that's a separate, server-side integration and is intentionally
  out of scope for a client-only app.
- No backend is required for the current feature set; everything runs on-device except the Claude
  API calls.
