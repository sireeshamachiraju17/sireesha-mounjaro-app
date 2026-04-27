# 🌸 Sireesha's Weight Loss Journey · 2026
## Mounjaro Tracker — Full Stack App

---

## 📁 Project Structure

```
sireesha-app/
├── server.js          ← Node.js backend (Express + Twilio + cron)
├── public/
│   └── index.html     ← Beautiful frontend (auto-served by server)
├── data.json          ← Your data (auto-created on first save)
├── .env               ← Your secrets (create from .env.example)
├── .env.example       ← Template
└── package.json
```

---

## 🚀 OPTION 1: Run Locally (on your computer)

```bash
# 1. Enter the project folder
cd sireesha-app

# 2. Create your .env file
cp .env.example .env
# Then open .env and fill in your Twilio credentials

# 3. Start the server
node server.js

# 4. Open in browser
# → http://localhost:3000
```

Your husband can access it on the same WiFi at: `http://YOUR_LAPTOP_IP:3000`
Find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 🌐 OPTION 2: Deploy to the Internet (share via web link)

### Recommended: Railway.app (FREE, easiest)

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Upload this folder to a GitHub repo (or use Railway's CLI)
4. Add environment variables in Railway dashboard:
   - `TWILIO_ACCOUNT_SID` = your SID
   - `TWILIO_AUTH_TOKEN` = your token
   - `TWILIO_WHATSAPP_FROM` = whatsapp:+14155238886
   - `RECIPIENT_PHONE` = +919945977880
5. Railway gives you a URL like: `https://sireesha-app.up.railway.app`
6. **Share this link with your husband!** He can view your progress in real time.

### Alternative: Render.com (also FREE)

1. Go to https://render.com
2. New → Web Service → Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add the same environment variables

---

## 📱 WhatsApp Notifications — Twilio Setup

### Step 1: Twilio Sandbox (immediate, free)
1. Log into https://console.twilio.com
2. Go to **Messaging → Try it out → Send a WhatsApp message**
3. Note the sandbox number: `+14155238886`
4. Note the join code (e.g. "join purple-elephant")
5. **On your phone**, send this WhatsApp message to +14155238886:
   ```
   join purple-elephant
   ```
   (use your actual code, not this one)
6. You'll get a confirmation. Now Twilio can send you messages!
7. Fill `.env` with your credentials and restart the server

### Step 2: Production WhatsApp (optional, for approved number)
- Apply for a WhatsApp Business number in Twilio console
- Update `TWILIO_WHATSAPP_FROM` with your approved number
- Now messages work without the sandbox join step

### When does it send?
- **Every Sunday at 8:00 AM IST automatically** (cron job in server.js)
- **Order alerts** on Weeks 3, 7, 11, 15, 19, 23
- **Manual trigger** via the Reminders tab in the app

---

## 💾 Data

All your logs, weights, photos, and settings are saved to `data.json` on the server.
This file is shared between you and your husband — any device accessing the URL sees the same data.

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| "Server offline" in app | Run `node server.js` in terminal |
| WhatsApp not sending | Check .env credentials, ensure you joined sandbox |
| Photos not showing | Photos save in data.json — may be large, check disk space |
| Husband can't access | Use the deployed URL (Railway/Render), not localhost |

---

Made with 💜 for Sireesha's health journey · 2026
