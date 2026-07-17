# Salon Agenda — Micro SaaS

Agenda para salones, barberías y clínicas. Multi-negocio, reserva pública, suscripción PayPal y recordatorios por WhatsApp.

## Desarrollo local

```bash
cd salon-agenda
$env:NODE_OPTIONS="--experimental-sqlite"   # node:sqlite es experimental en Node 26
npm install
npm run dev
```

Usa SQLite local (`salon.db`) por defecto. No requiere base de datos externa.

## Variables de entorno (producción)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de Postgres (Neon/Supabase/Vercel). Si está ausente, usa SQLite local. |
| `PAYPAL_CLIENT_ID` | Credenciales de PayPal (opcional; si faltan, el flujo se simula). |
| `PAYPAL_CLIENT_SECRET` | Secreto de PayPal. |
| `PAYPAL_MODE` | `sandbox` o `live`. |
| `CRON_SECRET` | Token para proteger `/api/cron/reminders` (cualquier string). |

## Deploy en Vercel

1. Crea una base de Postgres (Neon recomendado, free tier).
2. Ejecuta `schema.sql` en esa base.
3. Importa el repo en Vercel y define `DATABASE_URL` (+ PayPal si aplica).
4. Deploy. El build corre `next build` automáticamente.

La app detecta `DATABASE_URL` y cambia de SQLite a Postgres sin tocar el código.

## Recordatorios automáticos

Un cron diario (08:00) llama a `/api/cron/reminders`, que busca citas del día siguiente sin recordar y genera los links de WhatsApp. En Vercel se configura vía `crons` en `vercel.json`. Para probar localmente:

```bash
# con el dev server corriendo:
node scripts/run-reminders.mjs
```

Protege el endpoint con `CRON_SECRET` (variable de entorno).

## Estructura

- `lib/db.ts` — wrapper de datos (pg en prod, sqlite en local)
- `lib/businesses.ts`, `lib/appointments.ts`, `lib/catalog.ts`, `lib/plans.ts`, `lib/billing.ts` — capa de datos
- `lib/auth.ts`, `lib/paypal.ts`, `lib/notifications.ts` — auth, pagos, WhatsApp
- `app/api/*` — API routes
- `app/dashboard`, `app/login`, `app/planes`, `app/b/[slug]` — UI
