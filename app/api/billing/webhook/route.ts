import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSubscription, upsertSubscription } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const event = await req.json().catch(() => null);
  const eventType = event?.event_type;

  async function apply(subId: string, status: string) {
    if (!subId) return;
    const row = await db
      .prepare("SELECT * FROM subscriptions WHERE paypal_subscription_id = ?")
      .get(subId);
    if (row) {
      await upsertSubscription(row.business_id, {
        plan: row.plan,
        status,
        paypal_subscription_id: subId,
      });
    }
  }

  if (
    eventType === "BILLING.SUBSCRIPTION.ACTIVATED" ||
    eventType === "PAYMENT.SALE.COMPLETED"
  ) {
    await apply(event?.resource?.id, "active");
  }

  if (
    eventType === "BILLING.SUBSCRIPTION.CANCELLED" ||
    eventType === "BILLING.SUBSCRIPTION.SUSPENDED"
  ) {
    await apply(event?.resource?.id, "inactive");
  }

  return NextResponse.json({ ok: true });
}
