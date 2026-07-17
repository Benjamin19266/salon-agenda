import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromRequest } from "@/lib/auth";
import { getAppointment } from "@/lib/appointments";
import { getBusinessById } from "@/lib/businesses";
import {
  buildWhatsappLink,
  buildReminderMessage,
  markReminded,
  getServiceName,
} from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const biz = await getBusinessFromRequest(req);
  if (!biz) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const appt = await getAppointment(biz.id, Number(params.id));
  if (!appt)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const full = await getBusinessById(biz.id);
  const serviceName = await getServiceName(biz.id, appt.service_id);
  const message = buildReminderMessage(
    full?.name ?? "tu negocio",
    appt.client_name,
    appt.start_time,
    serviceName
  );
  const link = buildWhatsappLink(appt.client_phone, message);

  if (!link) {
    return NextResponse.json(
      { error: "El cliente no tiene teléfono válido" },
      { status: 400 }
    );
  }

  await markReminded(biz.id, Number(params.id));
  return NextResponse.json({ link });
}
