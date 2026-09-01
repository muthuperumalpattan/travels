# Travel Record & Invoice Management

Travel ledger for web, Netlify, and Android. Record trips, auto-calculate profit, print invoices, and store **all application data and invoice PDFs in Google Drive**. There is no SQL database.

## 1. Install Node.js

Install **Node.js 20 or later** from [https://nodejs.org](https://nodejs.org).

```bash
node -v
npm -v
```

## 2. Install dependencies

```bash
npm install
```

## 3. Save to Google Drive for free (no Google Cloud Console)

You do **not** need Google Cloud Console, a service account, or a credit card.

Use **Google Apps Script** with `tutimanicabs@gmail.com`. It writes into the folder you already created.

### A. Open the script editor

1. Sign in to Google as **tutimanicabs@gmail.com**.
2. Open [https://script.google.com](https://script.google.com) → **New project**.
3. Delete the sample code.
4. Paste everything from `scripts/google-apps-script/Code.gs`.
5. Confirm this line matches `.env`:

```javascript
const SCRIPT_SECRET = "tm-drive-7f3c9a2e";
```

6. Save (name it `Travel Drive Bridge`).

### B. Deploy as a web app (free)

1. Click **Deploy → New deployment**.
2. Type: **Web app**.
3. **Execute as:** Me (`tutimanicabs@gmail.com`).
4. **Who has access:** Anyone.
5. Click **Deploy** and allow permissions (Drive).
6. Copy the **Web app URL** (ends like `/exec`).

### C. Put the URL in `.env`

```env
GOOGLE_DRIVE_ROOT_FOLDER_ID=1SMAqhTsRt6Tw4Vl7fQO4g2MNTZ73fLf4
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
DRIVE_BRIDGE_SECRET=tm-drive-7f3c9a2e
GOOGLE_DRIVE_ENABLED=true
COOKIE_SECURE=false
```

Leave `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` empty.

Restart `npm run dev`. The app will create:

```text
Your folder
  Travel Management/
    Data/app-data.json
    Invoices/2026/September/*.pdf
```

On Netlify, add the same three variables (`GOOGLE_APPS_SCRIPT_URL`, `DRIVE_BRIDGE_SECRET`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`). Still free.

---

## 3–6. Google Drive API via Cloud Console (optional, also free)

Skip this if you used Apps Script above.

## 7. Configure `.env`

```powershell
Copy-Item .env.example .env
```

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=use-a-long-random-secret
COOKIE_SECURE=false

GOOGLE_PROJECT_ID=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_DRIVE_ENABLED=true
```

Paste `GOOGLE_PRIVATE_KEY` with `\n` for newlines.

Local development without Drive credentials: set `GOOGLE_DRIVE_ENABLED=false`. Data is then kept in `server/data/app-data.json` (JSON file, **not SQL**). Production/Netlify must use Drive.

## 8–9. Run locally

```bash
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:5000/api/health

### Demo logins

| Role    | Username | Password    |
| ------- | -------- | ----------- |
| Admin   | admin    | Admin@123   |
| Manager | manager  | Manager@123 |
| Staff   | staff    | Staff@123   |

Change these after first login in production.

## 10. Build

```bash
npm run build
npm run start
npm test
```

## 11. Host the full app on Netlify

The React UI is a static site. The Express API runs as a **Netlify Function** at `/api/*`. Both share the same URL.

1. Push this project to GitHub.
2. In [Netlify](https://app.netlify.com): **Add new site → Import from Git**.
3. Build settings (already in `netlify.toml`):
   - Build command: `npm run build:netlify`
   - Publish directory: `client/dist`
   - Functions directory: `netlify/functions`
4. **Site settings → Environment variables** — add:

```text
NODE_ENV=production
JWT_SECRET=<long random string>
COOKIE_SECURE=true
CLIENT_ORIGIN=https://YOUR-SITE.netlify.app
GOOGLE_PROJECT_ID=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_DRIVE_ENABLED=true
```

For `GOOGLE_PRIVATE_KEY` on Netlify, keep the `\n` characters in one line, or use a quoted value with real newlines.

5. Deploy. Open `https://YOUR-SITE.netlify.app`.

CLI option:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set JWT_SECRET "..."
netlify deploy --prod
```

## 12. How data and invoices are stored

1. Validate the trip and compute `Profit = Total − Driver − Petrol`.
2. Allocate `TRV-YYYY-000001` inside `app-data.json` on Drive.
3. Generate a PDF in memory.
4. Upload the PDF to `Travel Management/Invoices/<year>/<month>/`.
5. Save the Drive file ID and view URL on the travel record in `app-data.json`.
6. If the PDF upload fails, the record stays with `pending_drive` and the API does **not** report success. Use **Retry Drive upload**.

The frontend never receives Google keys.

## 13. Authentication

- `POST /api/auth/login` with email or username + password.
- Passwords hashed with bcrypt.
- JWT in an httpOnly cookie (web) and also returned for the Android app (Bearer token).

| Role    | Access |
| ------- | ------ |
| Admin   | Dashboard, trips, delete, users, invoices |
| Manager | Dashboard, record/edit trips, print |
| Staff   | Record trips, view, print |

## 14. Android APK

The same UI is packaged with **Capacitor**.

### After Netlify is live (recommended)

The APK opens your hosted site (API + Drive already work):

```powershell
$env:CAPACITOR_SERVER_URL="https://YOUR-SITE.netlify.app"
npm run cap:sync
```

Then in Android Studio: open the `android` folder → **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Or from a machine with the Android SDK + JDK:

```powershell
$env:CAPACITOR_SERVER_URL="https://YOUR-SITE.netlify.app"
npm run apk:debug
```

Debug APK path:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy that file to a phone and install it (enable **Install from unknown sources**).

### First-time Android project

```bash
npx cap add android
npx cap sync android
```

Install [Android Studio](https://developer.android.com/studio), accept SDK licenses, then build as above.

For a Play Store release, use a signing key and `./gradlew assembleRelease`.

## Architecture

```text
React (web + Android WebView)
    |
    | REST  /api  (Netlify Function or local Express)
    ↓
Google Drive
    ├── Data/app-data.json     (users + travel records)
    └── Invoices/year/month/*.pdf
```

## UI

A faded **Maruti Suzuki Ertiga** photo is used as the background (about 18% opacity on app pages). Login uses the same photo with a dark overlay.
