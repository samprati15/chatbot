# AI Assistant (Flutter)

The Flutter counterpart to the React Native app in this repo, backed by the Node/Express API in
`../backend`. Same product, different stack: sign up, chat with Claude, manage tasks, and place
calls via the native dialer — now with real user accounts and server-side task/chat storage.

## Features

- **Accounts** — email/password signup and login (JWT via the backend).
- **Chat Q&A** — messages go to `/api/chat`, which asks Claude on the server (your Anthropic key
  stays server-side, never on-device).
- **Tasks** — add/list/complete/delete from the Tasks tab or via chat commands ("remind me to buy
  milk", "complete all tasks", "delete task milk", "clear completed tasks"). Applied immediately,
  no confirmation step.
- **Calling** — "call Mom" resolves the contact via the device's address book and opens the native
  dialer pre-filled. Neither iOS nor Android lets an app dial a number without the user tapping
  something, so this is the realistic, permitted version of "call for me" — same reasoning as the
  RN app.

## Setup

1. Start the backend first (see `../backend/README.md`) — this app has no offline/local mode.
2. Get the Flutter SDK (stable channel) if you don't have it: https://docs.flutter.dev/get-started/install
3. From this directory:

   ```bash
   flutter pub get
   flutter run
   ```

4. On first launch, sign up, then in **Settings** confirm the **Backend URL** matches where your
   server is reachable from the device:
   - Android emulator → `http://10.0.2.2:4000` (the default)
   - iOS simulator / desktop → `http://localhost:4000`
   - A physical device → your computer's LAN IP, e.g. `http://192.168.1.20:4000`

## Running the tests

```bash
flutter analyze
flutter test
```

## Project structure

```
lib/
  main.dart                  Entry point; routes to Login or Home based on stored auth token
  models/                    Task, Message
  services/
    api_client.dart          HTTP wrapper: base URL + JWT header, persisted via flutter_secure_storage
    auth_service.dart        signup/login/logout
    task_service.dart        Task CRUD against the backend
    chat_service.dart        Send/receive chat messages
    calling_service.dart     Contact lookup (flutter_contacts) + native dialer (url_launcher)
  screens/
    login_screen.dart, signup_screen.dart
    home_screen.dart          Bottom-nav shell (Chat / Tasks / Settings)
    chat_screen.dart, tasks_screen.dart, settings_screen.dart
  theme/                      Shared dark palette, matches the React Native app
```

## Permissions

- Android: `READ_CONTACTS` (only used when you say "call <name>"; saying a phone number directly
  skips it), `INTERNET`, plus `<queries>` entries so the app can detect/launch the dialer on
  Android 11+.
- iOS: `NSContactsUsageDescription` and `tel` in `LSApplicationQueriesSchemes`.

No `CALL_PHONE` permission is requested anywhere — the app never places a call without you tapping
the dialer's own Call button.
