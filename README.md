# mediflow-frontend

A vanilla-JS PWA for the MediFlow digital pharmacy platform.

## Configuration

There is no build step. Configuration is set via top-level constants in `app.js`:

```js
const API_BASE   = 'https://<your-backend-host>/api';
const SOCKET_URL = 'https://<your-backend-host>';
const VAPID_PUBLIC_KEY = '<your-vapid-public-key>';
```

See [`.env.example`](.env.example) for the full list of required **backend** environment variables.

## OTP Authentication

The login flow uses a phone-based OTP (one-time password):

1. User enters a **10-digit mobile number** (formatted as `XXXX-XXX-XXX` in the UI).
2. The frontend calls `POST /api/auth/send-otp` with `{ "phone": "<10 digits>" }`.
3. The backend sends a 6-digit OTP via SMS and returns `{ "success": true }`.
4. The user types the 6-digit code into the verification screen.
5. The frontend calls `POST /api/auth/verify` with `{ "phone": "...", "otp": "..." }`.
6. On success the backend returns `{ "success": true, "isNewUser": bool, "user": {...} }`.

### Error handling

| Scenario | Frontend behaviour |
|---|---|
| Network / server unreachable | Inline error on the phone field — no browser `alert()` |
| HTTP 429 (rate-limited) | Inline message: *"Too many requests. Please wait…"* |
| Other non-2xx response | Backend `message` shown inline on the relevant field |
| Wrong OTP | Error shown below the OTP boxes; boxes are cleared |
| Network failure during verify | Inline error below OTP boxes |

### Resend OTP

A **Resend OTP** button appears on the verification screen. It is disabled for 30 seconds after each send to avoid spamming the backend. The countdown is shown in the button label.

### Change number

A **Change number** link on the verification screen navigates back to the phone-entry screen so users can correct a typo without reloading the app.

### Required backend variables

```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
OTP_EXPIRY_SECONDS=300
ALLOWED_ORIGINS=https://your-frontend.com
```

Ensure your backend sets `Access-Control-Allow-Origin` for the frontend origin and returns JSON error bodies (`{ "success": false, "message": "..." }`) for all 4xx/5xx responses so the frontend can surface descriptive error messages.

## Push Notifications

See [`.env.example`](.env.example) for VAPID setup instructions.