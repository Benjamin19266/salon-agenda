# Deploy en Vercel

Guía para llevar Salon Agenda de GitHub a producción.

## 1. Base de datos Postgres

Crea una base Postgres (opciones gratuitas):
- **Neon** (neon.tech) — free tier, sin tarjeta.
- **Supabase** (supabase.com) — free tier.
- **Vercel Postgres** — desde el dashboard de Vercel.

Copia la **connection string** (ej. `postgresql://user:pass@host/db?sslmode=require`).

Ejecuta el esquema en esa base (pega y corre `schema.sql` en el SQL editor de tu proveedor):

```bash
# o copia el contenido de schema.sql en el editor SQL de Neon/Supabase
cat schema.sql
```

## 2. Importar en Vercel

1. Entra a [vercel.com](https://vercel.com) con GitHub.
2. **Add New → Project → Import** el repo `salon-agenda`.
3. Framework: se detecta solo (Next.js).
4. Click **Deploy** (el `vercel.json` ya define build y cron).

## 3. Variables de entorno

En el dashboard del proyecto → **Settings → Environment Variables**, agrega:

| Nombre | Valor | Requerido |
|--------|-------|-----------|
| `DATABASE_URL` | connection string de Postgres | Sí |
| `PAYPAL_CLIENT_ID` | credencial de PayPal | No* |
| `PAYPAL_CLIENT_SECRET` | credencial de PayPal | No* |
| `PAYPAL_MODE` | `sandbox` o `live` | No |
| `CRON_SECRET` | cualquier string secreto | No |

\* Si omites las de PayPal, el flujo de cobro se **simula** (el botón redirige a un link de confirmación local). Úsalo para probar sin credenciales reales.

Despliega de nuevo tras agregar las variables (botón **Redeploy**).

## 4. Verificar

- `/login` → registra un negocio.
- `/planes` → prueba la suscripción (simulada si no hay PayPal).
- `/b/[slug]` → reserva pública de prueba.
- El cron de recordatorios corre diario a las 08:00 (hora del servidor). Para probar manualmente:
  ```bash
  node scripts/run-reminders.mjs
  ```

## 5. Dominio propio (opcional)

En Vercel → **Domains** agrega tu dominio y configura los DNS que indique Vercel.

## Notas

- La app usa `DATABASE_URL` para Postgres en producción y cae a SQLite local si la variable no existe.
- El endpoint `/api/cron/reminders` requiere `?secret=CRON_SECRET` (o header `Authorization: Bearer ...`) cuando `CRON_SECRET` está definido.
