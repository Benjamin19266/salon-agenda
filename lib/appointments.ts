import { db } from "./db";

export interface Appointment {
  id: number;
  business_id: number;
  client_name: string;
  client_phone: string | null;
  service_id: number | null;
  employee_id: number | null;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: string;
  reminded?: number;
}

export async function listAppointments(businessId: number): Promise<Appointment[]> {
  return (await db
    .prepare("SELECT * FROM appointments WHERE business_id = ? ORDER BY start_time ASC")
    .all(businessId)) as Appointment[];
}

export async function getAppointment(
  businessId: number,
  id: number
): Promise<Appointment | undefined> {
  return (await db
    .prepare("SELECT * FROM appointments WHERE id = ? AND business_id = ?")
    .get(id, businessId)) as Appointment | undefined;
}

export async function createAppointment(
  businessId: number,
  data: Omit<Appointment, "id" | "business_id">
): Promise<number> {
  const res = await db
    .prepare(`
    INSERT INTO appointments
      (business_id, client_name, client_phone, service_id, employee_id, start_time, end_time, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .run(
      businessId,
      data.client_name,
      data.client_phone,
      data.service_id,
      data.employee_id,
      data.start_time,
      data.end_time,
      data.notes,
      data.status
    );
  return Number(res.lastInsertRowid);
}

export async function updateAppointment(
  businessId: number,
  id: number,
  data: Partial<Omit<Appointment, "id" | "business_id">>
): Promise<void> {
  const keys = Object.keys(data);
  await db
    .prepare(
      `UPDATE appointments SET ${keys
        .map((k) => `${k} = ?`)
        .join(", ")} WHERE id = ? AND business_id = ?`
    )
    .run([...(keys.map((k) => (data as any)[k])), id, businessId]);
}

export async function deleteAppointment(
  businessId: number,
  id: number
): Promise<void> {
  await db
    .prepare("DELETE FROM appointments WHERE id = ? AND business_id = ?")
    .run(id, businessId);
}
