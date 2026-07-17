import { NextRequest, NextResponse } from "next/server";
import {
  createBusiness,
  getBusinessByEmail,
  getBusinessBySlug,
} from "@/lib/businesses";
import { setSessionCookie } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email y password son requeridos" },
      { status: 400 }
    );
  }
  if (await getBusinessByEmail(email)) {
    return NextResponse.json(
      { error: "El email ya está registrado" },
      { status: 409 }
    );
  }

  let slug = slugify(name) || "negocio";
  let n = 1;
  while (await getBusinessBySlug(slug)) slug = `${slugify(name)}-${n++}`;

  const id = await createBusiness({ name, email, password, slug });
  const res = NextResponse.json({ id, slug }, { status: 201 });
  setSessionCookie(res, id);
  return res;
}
