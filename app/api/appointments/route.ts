import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { listAppointments, createAppointment } from "@/lib/appointments";
import { getBillingState } from "@/lib/billing";

export async function GET(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });
  return NextResponse.json(await listAppointments(biz.id));
}

export async function POST(req: NextRequest) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const billing = await getBillingState(biz.id);
  if (!billing.canCreate) {
    const msg =
      billing.reason === "limit_reached"
        ? "Alcanzaste el límite de citas de tu plan. Mejora para continuar."
        : "Tu suscripción no está activa. Actívala para agendar citas.";
    return NextResponse.json(
      { error: msg, code: billing.reason },
      { status: 402 }
    );
  }

  const body = await req.json();
  const { client_name, client_phone, service_id, employee_id, start_time, end_time, notes, status } = body;

  if (!client_name || !start_time || !end_time) {
    return NextResponse.json(
      { error: "client_name, start_time y end_time son requeridos" },
      { status: 400 }
    );
  }

  const id = await createAppointment(biz.id, {
    client_name,
    client_phone: client_phone ?? null,
    service_id: service_id ?? null,
    employee_id: employee_id ?? null,
    start_time,
    end_time,
    notes: notes ?? null,
    status: status ?? "confirmed",
  });

  return NextResponse.json({ id }, { status: 201 });
}
