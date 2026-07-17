import {
  getSubscription,
  getPlanLimits,
  isActive,
  countMonthAppointments,
  PlanId,
} from "./plans";

export interface BillingState {
  plan: PlanId;
  status: string;
  active: boolean;
  monthlyLimit: number | null;
  usedThisMonth: number;
  canCreate: boolean;
  reason?: string;
}

export async function getBillingState(businessId: number): Promise<BillingState> {
  const sub = await getSubscription(businessId);
  const plan = (sub?.plan ?? "gratis") as PlanId;
  const limits = getPlanLimits(plan);
  const active = isActive(sub?.status);

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const used = await countMonthAppointments(businessId, firstOfMonth);

  let canCreate = true;
  let reason: string | undefined;
  if (!active) {
    canCreate = false;
    reason = "subscription_inactive";
  } else if (limits.monthlyAppointmentLimit !== null && used >= limits.monthlyAppointmentLimit) {
    canCreate = false;
    reason = "limit_reached";
  }

  return {
    plan,
    status: sub?.status ?? "inactive",
    active,
    monthlyLimit: limits.monthlyAppointmentLimit,
    usedThisMonth: used,
    canCreate,
    reason,
  };
}
