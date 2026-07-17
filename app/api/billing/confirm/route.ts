import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { getSubscription, upsertSubscription } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const sub = await getSubscription(biz.id);
  if (!sub) return NextResponse.json({ error: "No hay suscripción" }, { status: 404 });

  await upsertSubscription(biz.id, {
    plan: sub.plan,
    status: "active",
    paypal_subscription_id: sub.paypal_subscription_id,
  });

  return NextResponse.json({ ok: true, status: "active" });
}
