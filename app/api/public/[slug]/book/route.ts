import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/businesses";
import { createAppointment } from "@/lib/appointments";
import { getBillingState } from "@/lib/billing";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const biz = await getBusinessBySlug(params.slug);
  if (!biz)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const billing = await getBillingState(biz.id);
  if (!billing.canCreate) {
    return NextResponse.json(
      { error: "El negocio no está disponible para agendar citas." },
      { status: 402 }
    );
  }

  const body = await req.json();
  const { client_name, client_phone, service_id, employee_id, start_time, end_time, notes } = body;

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
    status: "confirmed",
  });

  return NextResponse.json({ id }, { status: 201 });
}
