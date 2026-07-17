import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { deleteEmployee } from "@/lib/catalog";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  await deleteEmployee(biz.id, Number(params.id));
  return NextResponse.json({ ok: true });
}
