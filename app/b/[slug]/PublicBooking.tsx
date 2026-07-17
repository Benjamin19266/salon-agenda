"use client";

import { useEffect, useState } from "react";

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

export default function PublicBooking({
  slug,
  businessName,
}: {
  slug: string;
  businessName: string;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceId, setServiceId] = useState<number | "">("");
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/public/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services || []);
        setEmployees(d.employees || []);
      });
  }, [slug]);

  const selected = services.find((s) => s.id === serviceId);
  const duration = selected?.duration_minutes ?? 30;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!clientName || serviceId === "") {
      setMsg("Completa nombre y servicio.");
      return;
    }
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + duration * 60000);
    const res = await fetch(`/api/public/${slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: clientName,
        client_phone: clientPhone,
        service_id: serviceId,
        employee_id: employeeId === "" ? null : employeeId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      }),
    });
    if (res.ok) {
      setMsg("¡Reserva confirmada! Te avisaremos si hay cambios.");
      setClientName("");
      setClientPhone("");
    } else {
      const d = await res.json();
      setMsg(d.error || "Error al reservar.");
    }
  }

  return (
    <main
      style={{
        maxWidth: 460,
        margin: "40px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e2e2e2",
      }}
    >
      <h1 style={{ marginTop: 0 }}>{businessName}</h1>
      <p style={{ color: "#666" }}>Reserva tu cita</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label>
          Nombre *
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </label>
        <label>
          Teléfono
          <input
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
        </label>
        <label>
          Servicio *
          <select
            value={serviceId}
            onChange={(e) =>
              setServiceId(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
          >
            <option value="">Selecciona…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration_minutes} min · ${s.price})
              </option>
            ))}
          </select>
        </label>
        <label>
          Profesional
          <select
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">Cualquiera</option>
            {employees.map((em) => (
              <option key={em.id} value={em.id}>
                {em.name}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1 }}>
            Fecha *
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label style={{ width: 120 }}>
            Hora *
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </label>
        </div>
        {msg && (
          <div
            style={{
              color: msg.startsWith("¡") ? "#067a3a" : "#c00",
              fontWeight: 600,
            }}
          >
            {msg}
          </div>
        )}
        <button
          type="submit"
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: 6,
          }}
        >
          Reservar
        </button>
      </form>
    </main>
  );
}
