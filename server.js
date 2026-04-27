require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── In-memory DB (persisted to data.json) ─────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {}
  return { currentWeek: 1, logs: [], photos: [], startDate: new Date().toISOString().split('T')[0] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let db = loadData();

// ─── Dose schedule ──────────────────────────────────────────────────────────
const doses = [
  {w:1,mg:'2.5'},{w:2,mg:'2.5'},{w:3,mg:'2.5',order:true},{w:4,mg:'2.5'},
  {w:5,mg:'5'},{w:6,mg:'5'},{w:7,mg:'5',order:true},{w:8,mg:'5'},
  {w:9,mg:'7.5'},{w:10,mg:'7.5'},{w:11,mg:'7.5',order:true},{w:12,mg:'7.5'},
  {w:13,mg:'10'},{w:14,mg:'10'},{w:15,mg:'10',order:true},{w:16,mg:'10'},
  {w:17,mg:'12.5'},{w:18,mg:'12.5'},{w:19,mg:'12.5',order:true},{w:20,mg:'12.5'},
  {w:21,mg:'15'},{w:22,mg:'15'},{w:23,mg:'15',order:true},{w:24,mg:'15'}
];

// ─── Twilio setup ───────────────────────────────────────────────────────────
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function sendWhatsApp(to, message) {
  if (!twilioClient) {
    console.log('[WhatsApp MOCK]', to, ':', message);
    return { success: true, mock: true };
  }
  try {
    const msg = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`,
      body: message
    });
    console.log('[WhatsApp sent]', msg.sid);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error('[WhatsApp error]', err.message);
    return { success: false, error: err.message };
  }
}

function buildReminderMessage(week, dose) {
  const orderNote = dose.order
    ? '\n\n⚠️ *ORDER YOUR NEXT PEN THIS WEEK* — you\'ll need it for next week!'
    : '';
  return `💜 *Mounjaro Reminder — Sireesha*\n\nTime for your Week ${week} injection!\nDose: *${dose.mg} mg*\n\nYou're ${week} of 24 weeks in. Every dose is a promise kept to yourself. You're doing amazing! 🌟${orderNote}\n\n_Track your progress: open your app to log today's weight._`;
}

// ─── Cron: Every Sunday at 8:00 AM IST (2:30 AM UTC) ──────────────────────
cron.schedule('30 2 * * 0', async () => {
  console.log('[CRON] Sunday reminder firing...');
  const week = db.currentWeek;
  const dose = doses[week - 1];
  if (!dose) return;
  const msg = buildReminderMessage(week, dose);
  await sendWhatsApp(process.env.RECIPIENT_PHONE || '+919945977880', msg);
}, { timezone: 'UTC' });

// ─── REST API ───────────────────────────────────────────────────────────────

// GET full db state
app.get('/api/data', (req, res) => {
  res.json({ ...db, doses });
});

// POST save a weekly log entry
app.post('/api/log', (req, res) => {
  const { week, weight, waist, energy, effects, notes, injected } = req.body;
  if (!week || !weight) return res.status(400).json({ error: 'week and weight required' });

  let log = db.logs.find(l => l.week === week);
  if (!log) { log = { week, date: new Date().toISOString() }; db.logs.push(log); }

  Object.assign(log, { weight, waist, energy, effects, notes, injected, updatedAt: new Date().toISOString() });

  if (week >= db.currentWeek) db.currentWeek = Math.min(week + 1, 24);
  saveData(db);
  res.json({ success: true, log, currentWeek: db.currentWeek });
});

// POST save a photo (base64)
app.post('/api/photo', (req, res) => {
  const { week, src } = req.body;
  if (!week || !src) return res.status(400).json({ error: 'week and src required' });
  db.photos.push({ week, src, date: new Date().toISOString() });
  saveData(db);
  res.json({ success: true, count: db.photos.length });
});

// POST manually trigger WhatsApp reminder
app.post('/api/remind', async (req, res) => {
  const week = db.currentWeek;
  const dose = doses[week - 1];
  const phone = req.body.phone || process.env.RECIPIENT_PHONE || '+919945977880';
  const msg = buildReminderMessage(week, dose);
  const result = await sendWhatsApp(phone, msg);
  res.json(result);
});

// POST update current week
app.post('/api/week', (req, res) => {
  const { week } = req.body;
  if (week >= 1 && week <= 24) { db.currentWeek = week; saveData(db); }
  res.json({ currentWeek: db.currentWeek });
});

// Serve frontend for all other routes
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ─── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🌸 Sireesha's Mounjaro Tracker running on http://localhost:${PORT}`);
  console.log(`   Twilio: ${twilioClient ? '✅ Connected' : '⚠️  Not configured (mock mode)'}`);
  console.log(`   Sunday reminders: ✅ Cron scheduled (8:00 AM IST)\n`);
});
