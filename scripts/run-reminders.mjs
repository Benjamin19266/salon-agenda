// Dispara el recordatorio automático contra el server local.
// Uso: node scripts/run-reminders.mjs  (con el dev server corriendo)
const BASE = process.env.BASE_URL || "http://localhost:3000";
const SECRET = process.env.CRON_SECRET || "";

const url = new URL(`${BASE}/api/cron/reminders`);
if (SECRET) url.searchParams.set("secret", SECRET);

const res = await fetch(url.toString());
const json = await res.json();
console.log(`Status: ${res.status}`);
console.log(`Recordatorios enviados: ${json.sent ?? 0}`);
for (const r of json.reminders ?? []) {
  console.log(`- ${r.clientName}: ${r.link}`);
}
