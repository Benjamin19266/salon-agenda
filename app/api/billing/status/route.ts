import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { getSubscription } from "@/lib/plans";
import { paypalConfigured } from "@/lib/paypal";

export async function GET(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const sub = await getSubscription(biz.id);
  return NextResponse.json({
    configured: paypalConfigured,
    subscription: sub
      ? { plan: sub.plan, status: sub.status, paypal_subscription_id: sub.paypal_subscription_id }
      : null,
  });
}
