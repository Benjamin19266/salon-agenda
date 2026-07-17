import { db } from "./db";

export interface Metrics {
  today: number;
  week: number;
  month: number;
  revenueMonth: number;
  topServices: { name: string; count: number }[];
}

function dayStart(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

export async function getMetrics(businessId: number): Promise<Metrics> {
  const now = new Date();
  const todayStart = dayStart(now);
  const weekStart = dayStart(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  );
  const monthStart = dayStart(new Date(now.getFullYear(), now.getMonth(), 1));

  const today = (
    (await db
      .prepare(
        "SELECT COUNT(*) AS c FROM appointments WHERE business_id = ? AND start_time >= ?"
      )
      .get(businessId, todayStart)) as { c: number }
  ).c;
  const week = (
    (await db
      .prepare(
        "SELECT COUNT(*) AS c FROM appointments WHERE business_id = ? AND start_time >= ?"
      )
      .get(businessId, weekStart)) as { c: number }
  ).c;
  const month = (
    (await db
      .prepare(
        "SELECT COUNT(*) AS c FROM appointments WHERE business_id = ? AND start_time >= ?"
      )
      .get(businessId, monthStart)) as { c: number }
  ).c;

  const revenueRows = (await db
    .prepare(
      `SELECT s.price AS price
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.business_id = ? AND a.start_time >= ?`
    )
    .all(businessId, monthStart)) as { price: number | null }[];
  const revenueMonth = revenueRows.reduce((sum, r) => sum + (r.price ?? 0), 0);

  const topRows = (await db
    .prepare(
      `SELECT s.name AS name, COUNT(*) AS count
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.business_id = ? AND a.start_time >= ?
       GROUP BY s.id ORDER BY count DESC LIMIT 3`
    )
    .all(businessId, monthStart)) as { name: string; count: number }[];

  return { today, week, month, revenueMonth, topServices: topRows };
}
