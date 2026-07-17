"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppointmentForm, { ApptFormState } from "../components/AppointmentForm";
import DayCalendar from "./DayCalendar";

interface Appt {
  id: number;
  client_name: string;
  client_phone: string | null;
  service_id: number | null;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: string;
  reminded: number;
}
interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
}
interface Employee {
  id: number;
  name: string;
}
interface Catalog {
  services: Service[];
  employees: Employee[];
}
interface Metrics {
  today: number;
  week: number;
  month: number;
  revenueMonth: number;
  topServices: { name: string; count: number }[];
}

export default function Dashboard() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [appts, setAppts] = useState<Appt[]>([]);
  const [catalog, setCatalog] = useState<Catalog>({
    services: [],
    employees: [],
  });
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [editing, setEditing] = useState<ApptFormState | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [billing, setBilling] = useState<{
    plan: string;
    active: boolean;
    monthlyLimit: number | null;
    usedThisMonth: number;
    canCreate: boolean;
    reason?: string;
  } | null>(null);

  const [tab, setTab] = useState<"agenda" | "catalog">("agenda");
  const [svc, setSvc] = useState({ name: "", duration_minutes: 30, price: 0 });
  const [emp, setEmp] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me) {
          router.push("/login");
          return;
        }
        setBusinessName(me.name);
        setSlug(me.slug);
      });
  }, [router]);

  async function loadBilling() {
    const d = await fetch("/api/billing/state").then((r) => r.json());
    setBilling(d);
  }

  useEffect(() => {
    loadBilling();
  }, []);

  async function load() {
    const [a, c, m] = await Promise.all([
      fetch("/api/appointments").then((r) => r.json()),
      fetch("/api/services")
        .then((r) => r.json())
        .then(async (services) => ({
          services,
          employees: await fetch("/api/employees").then((r) => r.json()),
        })),
      fetch("/api/metrics").then((r) => r.json()),
    ]);
    setAppts(a);
    setCatalog(c);
    setMetrics(m);
    loadBilling();
  }
  useEffect(() => {
    load();
  }, []);

  const dayAppts = appts.filter((a) => a.start_time.startsWith(date));

  async function addAppt(data: ApptFormState) {
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
      }),
    });
    setEditing(null);
    load();
  }
  async function cancelAppt(id: number) {
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    load();
  }
  async function remindAppt(id: number) {
    const res = await fetch(`/api/appointments/${id}/remind`, {
      method: "POST",
    });
    if (res.ok) {
      const { link } = await res.json();
      window.open(link, "_blank");
      load();
    } else {
      const d = await res.json();
      alert(d.error || "No se pudo enviar el recordatorio");
    }
  }
  async function addService() {
    if (!svc.name) return;
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(svc),
    });
    setSvc({ name: "", duration_minutes: 30, price: 0 });
    load();
  }
  async function delService(id: number) {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    load();
  }
  async function addEmployee() {
    if (!emp) return;
    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: emp }),
    });
    setEmp("");
    load();
  }
  async function delEmployee(id: number) {
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    load();
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>📅 {businessName}</h1>
          <small style={{ color: "#666" }}>Reserva pública: /b/{slug}</small>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/planes"
            style={{ color: "#2563eb", textDecoration: "none", alignSelf: "center" }}
          >
            Planes
          </a>
          <button
            onClick={logout}
            style={{ background: "#eee", border: "none", padding: "8px 12px", borderRadius: 6 }}
          >
            Salir
          </button>
        </div>
      </header>

      {billing && (
        <div
          style={{
            margin: "16px 0",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: billing.active ? "#e7f7ee" : "#fff4e5",
            border: `1px solid ${billing.active ? "#b7e4c7" : "#ffd8a8"}`,
            color: billing.active ? "#067a3a" : "#a05a00",
          }}
        >
          <span>
            Plan: <strong>{billing.plan}</strong>
            {billing.monthlyLimit !== null && (
              <> · {billing.usedThisMonth}/{billing.monthlyLimit} citas este mes</>
            )}
            {!billing.active && " · Suscripción inactiva"}
          </span>
          {!billing.active && (
            <a href="/planes" style={{ color: "#a05a00", fontWeight: 700 }}>
              Activar plan →
            </a>
          )}
        </div>
      )}

      <nav style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <TabBtn active={tab === "agenda"} onClick={() => setTab("agenda")}>
          Agenda
        </TabBtn>
        <TabBtn active={tab === "catalog"} onClick={() => setTab("catalog")}>
          Servicios y empleados
        </TabBtn>
      </nav>

      {tab === "agenda" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button
              onClick={() => setEditing({} as ApptFormState)}
              disabled={billing ? !billing.canCreate : false}
              title={
                billing && !billing.canCreate
                  ? "Activa tu plan para agendar citas"
                  : ""
              }
              style={{
                ...primaryBtn,
                opacity: billing && !billing.canCreate ? 0.5 : 1,
                cursor:
                  billing && !billing.canCreate ? "not-allowed" : "pointer",
              }}
            >
              + Nueva cita
            </button>
          </div>

          {billing && !billing.canCreate && (
            <div
              style={{
                background: "#fff4e5",
                color: "#a05a00",
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              {billing.reason === "limit_reached"
                ? "Alcanzaste el límite de citas de tu plan."
                : "Tu suscripción no está activa."}{" "}
              <a href="/planes" style={{ fontWeight: 700 }}>
                Ver planes →
              </a>
            </div>
          )}

          {editing && (
            <AppointmentForm
              initial={editing.client_name === "" ? undefined : editing}
              onSubmit={addAppt}
              onCancel={() => setEditing(null)}
            />
          )}

          {metrics && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                margin: "16px 0",
              }}
            >
              <Metric label="Hoy" value={metrics.today} />
              <Metric label="Esta semana" value={metrics.week} />
              <Metric label="Este mes" value={metrics.month} />
              <Metric
                label="Ingresos (mes)"
                value={`$${metrics.revenueMonth.toLocaleString("es-CL")}`}
              />
            </div>
          )}

          <DayCalendar
            appts={dayAppts}
            services={catalog.services}
            onCancel={cancelAppt}
            onRemind={remindAppt}
          />

          {metrics && metrics.topServices.length > 0 && (
            <div style={{ marginTop: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e2e2e2" }}>
              <h3 style={{ marginTop: 0 }}>Servicios más reservados (mes)</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {metrics.topServices.map((s) => (
                  <li key={s.name} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <span>{s.name}</span>
                    <span style={{ color: "#666" }}>{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "catalog" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <section style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e2e2e2" }}>
            <h3>Servicios</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {catalog.services.map((s) => (
                <li key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span>
                    {s.name} ({s.duration_minutes}min · ${s.price})
                  </span>
                  <button onClick={() => delService(s.id)} style={miniBtn}>✕</button>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input placeholder="Nombre" value={svc.name} onChange={(e) => setSvc({ ...svc, name: e.target.value })} />
              <input type="number" placeholder="min" style={{ width: 60 }} value={svc.duration_minutes} onChange={(e) => setSvc({ ...svc, duration_minutes: Number(e.target.value) })} />
              <input type="number" placeholder="$" style={{ width: 60 }} value={svc.price} onChange={(e) => setSvc({ ...svc, price: Number(e.target.value) })} />
              <button onClick={addService} style={primaryBtn}>+ </button>
            </div>
          </section>

          <section style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e2e2e2" }}>
            <h3>Empleados</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {catalog.employees.map((e) => (
                <li key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span>{e.name}</span>
                  <button onClick={() => delEmployee(e.id)} style={miniBtn}>✕</button>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input placeholder="Nombre" value={emp} onChange={(e) => setEmp(e.target.value)} />
              <button onClick={addEmployee} style={primaryBtn}>+ </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
};
const miniBtn = {
  background: "transparent",
  border: "none",
  color: "#c00",
};
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#2563eb" : "#eee",
        color: active ? "#fff" : "#333",
        border: "none",
        padding: "8px 16px",
        borderRadius: 6,
      }}
    >
      {children}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e2e2",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
