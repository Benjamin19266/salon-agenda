import { db } from "./db";
import { getBusinessById } from "./businesses";
import { buildWhatsappLink, buildReminderMessage, markReminded, getServiceName } from "./notifications";

export interface PendingReminder {
  appointmentId: number;
  businessId: number;
  clientName: string;
  link: string;
}

export async function getPendingReminders(): Promise<PendingReminder[]> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const d = String(tomorrow.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;

  const rows = (await db
    .prepare(
      `SELECT a.id, a.business_id, a.client_name, a.client_phone, a.start_time, a.service_id
       FROM appointments a
       WHERE a.start_time LIKE ? AND a.reminded = 0 AND a.client_phone IS NOT NULL`
    )
    .all(`${day}%`)) as any[];

  const result: PendingReminder[] = [];
  for (const r of rows) {
    const biz = await getBusinessById(r.business_id);
    const serviceName = await getServiceName(r.business_id, r.service_id);
    const message = buildReminderMessage(
      biz?.name ?? "tu negocio",
      r.client_name,
      r.start_time,
      serviceName
    );
    const link = buildWhatsappLink(r.client_phone, message);
    if (link) {
      result.push({
        appointmentId: r.id,
        businessId: r.business_id,
        clientName: r.client_name,
        link,
      });
    }
  }
  return result;
}

export async function markRemindersSent(items: PendingReminder[]): Promise<void> {
  for (const it of items) {
    await markReminded(it.businessId, it.appointmentId);
  }
}
