import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { listServices, createService, deleteService } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  return NextResponse.json(await listServices(biz.id));
}

export async function POST(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  const body = await req.json();
  if (!body.name)
    return NextResponse.json({ error: "name requerido" }, { status: 400 });
  const id = await createService(biz.id, body);
  return NextResponse.json({ id }, { status: 201 });
}
