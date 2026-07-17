import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/businesses";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const biz = await getBusinessBySlug(params.slug);
  if (!biz)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const services = await db
    .prepare(
      "SELECT id, name, duration_minutes, price FROM services WHERE business_id = ? ORDER BY name"
    )
    .all(biz.id);
  const employees = await db
    .prepare("SELECT id, name FROM employees WHERE business_id = ? ORDER BY name")
    .all(biz.id);

  return NextResponse.json({
    business: { name: biz.name, slug: biz.slug },
    services,
    employees,
  });
}
