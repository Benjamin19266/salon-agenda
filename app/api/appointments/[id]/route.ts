import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { getAppointment, updateAppointment, deleteAppointment } from "@/lib/appointments";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  const appt = await getAppointment(biz.id, Number(params.id));
  if (!appt)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(appt);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  const body = await req.json();
  await updateAppointment(biz.id, Number(params.id), body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  await deleteAppointment(biz.id, Number(params.id));
  return NextResponse.json({ ok: true });
}
