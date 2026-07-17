import { NextRequest, NextResponse } from "next/server";
import { verifyBusiness } from "@/lib/businesses";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const biz = await verifyBusiness(email, password);
  if (!biz) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }
  const res = NextResponse.json({ id: biz.id, slug: biz.slug });
  setSessionCookie(res, biz.id);
  return res;
}
