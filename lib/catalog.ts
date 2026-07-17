import { db } from "./db";

export async function listServices(businessId: number): Promise<any[]> {
  return db
    .prepare("SELECT * FROM services WHERE business_id = ? ORDER BY name")
    .all(businessId);
}

export async function createService(
  businessId: number,
  data: any
): Promise<number> {
  const res = await db
    .prepare(
      "INSERT INTO services (business_id, name, duration_minutes, price) VALUES (?, ?, ?, ?)"
    )
    .run(
      businessId,
      data.name,
      data.duration_minutes ?? 30,
      data.price ?? 0
    );
  return Number(res.lastInsertRowid);
}

export async function deleteService(businessId: number, id: number): Promise<void> {
  await db
    .prepare("DELETE FROM services WHERE id = ? AND business_id = ?")
    .run(id, businessId);
}

export async function listEmployees(businessId: number): Promise<any[]> {
  return db
    .prepare("SELECT * FROM employees WHERE business_id = ? ORDER BY name")
    .all(businessId);
}

export async function createEmployee(
  businessId: number,
  name: string
): Promise<number> {
  const res = await db
    .prepare("INSERT INTO employees (business_id, name) VALUES (?, ?)")
    .run(businessId, name);
  return Number(res.lastInsertRowid);
}

export async function deleteEmployee(businessId: number, id: number): Promise<void> {
  await db
    .prepare("DELETE FROM employees WHERE id = ? AND business_id = ?")
    .run(id, businessId);
}
