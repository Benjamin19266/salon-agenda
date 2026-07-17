import { NextRequest } from "next/server";
import { getBusinessById, Business } from "./businesses";

const COOKIE = "biz_session";

export function getBusinessIdFromRequest(req: NextRequest): number | undefined {
  const id = req.cookies.get(COOKIE)?.value;
  return id ? Number(id) : undefined;
}

export async function getBusinessFromRequest(
  req: NextRequest
): Promise<Business | undefined> {
  const id = getBusinessIdFromRequest(req);
  if (!id) return undefined;
  return getBusinessById(id);
}

export function setSessionCookie(res: any, businessId: number): void {
  res.cookies.set(COOKIE, String(businessId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(res: any): void {
  res.cookies.delete(COOKIE);
}
