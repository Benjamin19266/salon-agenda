import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { PLANS, upsertSubscription } from "@/lib/plans";
import { createSubscription } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const { plan = "mensual" } = await req.json();
  const planDef = PLANS[plan as keyof typeof PLANS] ?? PLANS.mensual;

  const origin = new URL(req.url).origin;
  const { id, approveUrl } = await createSubscription(
    { ...planDef, interval: "MONTH" },
    `${origin}/planes?success=1`,
    `${origin}/planes?cancel=1`
  );

  await upsertSubscription(biz.id, {
    plan,
    status: "pending",
    paypal_subscription_id: id,
  });

  return NextResponse.json({ subscriptionId: id, approveUrl });
}
