import { db } from "./db";

export const PLANS = {
  gratis: {
    id: "gratis",
    name: "Gratis",
    price: 0,
    currency: "CLP",
    monthlyAppointmentLimit: 20,
  },
  mensual: {
    id: "mensual",
    name: "Plan Mensual",
    price: 9990,
    currency: "CLP",
    monthlyAppointmentLimit: null,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export async function getSubscription(
  businessId: number
): Promise<any | undefined> {
  return db
    .prepare(
      "SELECT * FROM subscriptions WHERE business_id = ? ORDER BY id DESC LIMIT 1"
    )
    .get(businessId);
}

export async function upsertSubscription(
  businessId: number,
  data: { plan: string; status: string; paypal_subscription_id?: string | null }
): Promise<void> {
  const existing = await getSubscription(businessId);
  if (existing) {
    await db
      .prepare(
        "UPDATE subscriptions SET status = ?, paypal_subscription_id = ?, plan = ? WHERE id = ?"
      )
      .run(data.status, data.paypal_subscription_id ?? null, data.plan, existing.id);
    return;
  }
  await db
    .prepare(
      "INSERT INTO subscriptions (business_id, plan, status, paypal_subscription_id) VALUES (?, ?, ?, ?)"
    )
    .run(
      businessId,
      data.plan,
      data.status,
      data.paypal_subscription_id ?? null
    );
}

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanId] ?? PLANS.gratis;
}

export function isActive(status: string | undefined): boolean {
  return status === "active";
}

export async function countMonthAppointments(
  businessId: number,
  sinceISO: string
): Promise<number> {
  const row = (await db
    .prepare(
      "SELECT COUNT(*) AS c FROM appointments WHERE business_id = ? AND start_time >= ?"
    )
    .get(businessId, sinceISO)) as { c: number };
  return row.c;
}
