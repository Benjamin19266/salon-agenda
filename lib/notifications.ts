import { db } from "./db";

export function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 8) return null;
  return digits;
}

export function buildWhatsappLink(
  phone: string | null,
  message: string
): string | null {
  const num = formatPhone(phone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function buildReminderMessage(
  businessName: string,
  clientName: string,
  start: string,
  serviceName?: string | null
): string {
  const when = new Date(start).toLocaleString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  const svc = serviceName ? ` (${serviceName})` : "";
  return `Hola ${clientName}, te recordamos tu cita en ${businessName}${svc} el ${when}. ¡Te esperamos!`;
}

export async function markReminded(
  businessId: number,
  appointmentId: number
): Promise<void> {
  await db
    .prepare(
      "UPDATE appointments SET reminded = 1 WHERE id = ? AND business_id = ?"
    )
    .run(appointmentId, businessId);
}

export async function getServiceName(
  businessId: number,
  serviceId: number | null
): Promise<string | null> {
  if (!serviceId) return null;
  const row = await db
    .prepare("SELECT name FROM services WHERE id = ? AND business_id = ?")
    .get(serviceId, businessId);
  return row?.name ?? null;
}
