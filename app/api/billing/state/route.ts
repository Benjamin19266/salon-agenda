import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { getBillingState } from "@/lib/billing";

export async function GET(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  return NextResponse.json(await getBillingState(biz.id));
}
