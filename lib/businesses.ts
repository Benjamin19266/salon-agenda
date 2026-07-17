import { db, hashPassword } from "./db";

export interface Business {
  id: number;
  name: string;
  slug: string;
  email: string;
  created_at: string;
}

export async function createBusiness(data: {
  name: string;
  email: string;
  password: string;
  slug: string;
}): Promise<number> {
  const res = await db
    .prepare(
      "INSERT INTO businesses (name, slug, email, password_hash) VALUES (?, ?, ?, ?)"
    )
    .run(data.name, data.slug, data.email, hashPassword(data.password));
  return Number(res.lastInsertRowid);
}

export async function getBusinessByEmail(email: string): Promise<any | undefined> {
  return db.prepare("SELECT * FROM businesses WHERE email = ?").get(email);
}

export async function getBusinessById(id: number): Promise<Business | undefined> {
  const row = await db
    .prepare("SELECT id, name, slug, email, created_at FROM businesses WHERE id = ?")
    .get(id);
  if (!row) return undefined;
  const { password_hash, ...safe } = row;
  return safe as Business;
}

export async function getBusinessBySlug(slug: string): Promise<Business | undefined> {
  const row = await db
    .prepare("SELECT id, name, slug, email, created_at FROM businesses WHERE slug = ?")
    .get(slug);
  if (!row) return undefined;
  const { password_hash, ...safe } = row;
  return safe as Business;
}

export async function verifyBusiness(
  email: string,
  password: string
): Promise<Business | undefined> {
  const row = await getBusinessByEmail(email);
  if (!row) return undefined;
  if (row.password_hash !== hashPassword(password)) return undefined;
  const { password_hash, ...safe } = row;
  return safe as Business;
}
