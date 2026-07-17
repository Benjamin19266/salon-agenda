const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const MODE = process.env.PAYPAL_MODE || "sandbox";
const BASE =
  MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const paypalConfigured = Boolean(CLIENT_ID && CLIENT_SECRET);

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal auth failed");
  const json = await res.json();
  return json.access_token;
}

export async function createSubscription(
  plan: { name: string; price: number; currency: string; interval: string },
  returnUrl: string,
  cancelUrl: string
): Promise<{ id: string; approveUrl: string }> {
  if (!paypalConfigured) {
    return {
      id: `sim_${Date.now()}`,
      approveUrl: `${returnUrl}&sim=1&sub=sim_${Date.now()}`,
    };
  }

  const token = await getAccessToken();

  const res = await fetch(`${BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "PayPal-Request-Id": `req_${Date.now()}`,
    },
    body: JSON.stringify({
      plan: {
        name: plan.name,
        description: plan.name,
        type: "FIXED",
        payment_definitions: [
          {
            name: "Regular",
            type: "REGULAR",
            frequency: plan.interval,
            frequency_interval: "1",
            amount: { value: String(plan.price), currency: plan.currency },
            cycles: "0",
          },
        ],
        merchant_preferences: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          auto_bill_amount: "YES",
          initial_fail_amount_action: "CONTINUE",
        },
      },
      application_context: {
        brand_name: "Salon Agenda",
        locale: "es-CL",
        user_action: "SUBSCRIBE_NOW",
        payment_method: { payer_selected: "PAYPAL", payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED" },
      },
    }),
  });

  if (!res.ok) throw new Error("PayPal create subscription failed");
  const json = await res.json();
  const approveUrl = json.links?.find((l: any) => l.rel === "approve")?.href;
  return { id: json.id, approveUrl };
}

export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<string> {
  if (!paypalConfigured || subscriptionId.startsWith("sim_")) return "ACTIVE";
  const token = await getAccessToken();
  const res = await fetch(
    `${BASE}/v1/billing/subscriptions/${subscriptionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return "unknown";
  const json = await res.json();
  return json.status;
}
