import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { listEmployees, createEmployee, deleteEmployee } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  return NextResponse.json(await listEmployees(biz.id));
}

export async function POST(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  const { name } = await req.json();
  if (!name)
    return NextResponse.json({ error: "name requerido" }, { status: 400 });
  const id = await createEmployee(biz.id, name);
  return NextResponse.json({ id }, { status: 201 });
}
