import { NextRequest, NextResponse } from "next/server";
import { getPendingReminders, markRemindersSent, PendingReminder } from "@/lib/reminders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.nextUrl.searchParams.get("secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret && auth !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await getPendingReminders();
  await markRemindersSent(pending);

  return NextResponse.json({
    sent: pending.length,
    reminders: pending.map((p: PendingReminder) => ({
      appointmentId: p.appointmentId,
      clientName: p.clientName,
      link: p.link,
    })),
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
