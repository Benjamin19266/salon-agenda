"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PLAN = {
  id: "mensual",
  name: "Plan Mensual",
  price: 9990,
  currency: "CLP",
};

export default function Plans() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) {
          router.push("/login");
          return;
        }
        setConfigured(d.configured);
        setStatus(d.subscription?.status ?? null);
      });
  }, [router]);

  async function subscribe() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/billing/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: PLAN.id }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo iniciar la suscripción.");
      return;
    }
    const { approveUrl } = await res.json();
    window.location.href = approveUrl;
  }

  async function simulateConfirm() {
    await fetch("/api/billing/confirm", { method: "POST" });
    setStatus("active");
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: 24 }}>
      <h1>Planes</h1>
      <div
        style={{
          border: "1px solid #e2e2e2",
          borderRadius: 10,
          padding: 20,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{PLAN.name}</h2>
        <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0" }}>
          ${PLAN.price.toLocaleString("es-CL")} {PLAN.currency}
          <span style={{ fontSize: 14, color: "#888" }}> / mes</span>
        </p>
        <ul style={{ color: "#555", paddingLeft: 18 }}>
          <li>Agenda ilimitada</li>
          <li>Servicios y empleados ilimitados</li>
          <li>Reserva pública por link</li>
        </ul>

        <div style={{ marginTop: 16 }}>
          {status === "active" ? (
            <div
              style={{
                background: "#e7f7ee",
                color: "#067a3a",
                padding: "10px 14px",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              ✓ Suscripción activa
            </div>
          ) : status === "pending" ? (
            <button onClick={simulateConfirm} style={btn}>
              Completar pago (simulado)
            </button>
          ) : (
            <button onClick={subscribe} disabled={loading} style={btn}>
              {loading ? "Redirigiendo…" : "Suscribirme con PayPal"}
            </button>
          )}
        </div>

        {!configured && (
          <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
            Modo demo: PayPal no está configurado (faltan PAYPAL_CLIENT_ID /
            PAYPAL_CLIENT_SECRET). El flujo se simula.
          </p>
        )}
        {error && <p style={{ color: "#c00" }}>{error}</p>}
      </div>
    </main>
  );
}

const btn = {
  background: "#0070ba",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 6,
  width: "100%",
  fontSize: 15,
};
