"use client";

import { useState } from "react";

interface Appt {
  id: number;
  client_name: string;
  client_phone: string | null;
  service_id: number | null;
  start_time: string;
  end_time: string;
  status: string;
}
interface Service {
  id: number;
  name: string;
  price: number;
}

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_PX = 60;
const COLORS = ["#2563eb", "#067a3a", "#b45309", "#7c3aed", "#be123c", "#0e7490"];

export default function DayCalendar({
  appts,
  services,
  onCancel,
  onRemind,
}: {
  appts: Appt[];
  services: Service[];
  onCancel: (id: number) => void;
  onRemind?: (id: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const colorFor = (sid: number | null) => {
    if (sid == null) return "#64748b";
    const idx = services.findIndex((s) => s.id === sid);
    return COLORS[idx % COLORS.length];
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", border: "1px solid #e2e2e2", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <div style={{ borderRight: "1px solid #e2e2e2" }}>
        {hours.map((h) => (
          <div
            key={h}
            style={{ height: HOUR_PX, borderBottom: "1px solid #f0f0f0", fontSize: 12, color: "#888", padding: "4px 6px", textAlign: "right" }}
          >
            {String(h).padStart(2, "0")}:00
          </div>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        {hours.map((h) => (
          <div key={h} style={{ height: HOUR_PX, borderBottom: "1px solid #f0f0f0" }} />
        ))}
        {appts.map((a) => {
          const start = new Date(a.start_time);
          const end = new Date(a.end_time);
          const top = (start.getHours() - START_HOUR) * HOUR_PX + (start.getMinutes() / 60) * HOUR_PX;
          const height = Math.max(
            24,
            ((end.getTime() - start.getTime()) / 3600000) * HOUR_PX - 4
          );
          const color = colorFor(a.service_id);
          const isSel = selected === a.id;
          return (
            <div
              key={a.id}
              onClick={() => setSelected(isSel ? null : a.id)}
              style={{
                position: "absolute",
                top: top + 2,
                left: 6,
                right: 6,
                height,
                background: color,
                color: "#fff",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 13,
                cursor: "pointer",
                boxShadow: isSel ? "0 0 0 2px #111" : "none",
                overflow: "hidden",
              }}
            >
              <strong>{a.client_name}</strong>{" "}
              {new Date(a.start_time).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
              {isSel && (
                <span style={{ display: "flex", gap: 4, float: "right" }}>
                  {onRemind && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemind(a.id);
                      }}
                      title="Recordatorio WhatsApp"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        border: "none",
                        color: "#fff",
                        borderRadius: 4,
                        padding: "0 6px",
                      }}
                    >
                      💬
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(a.id);
                    }}
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      border: "none",
                      color: "#fff",
                      borderRadius: 4,
                      padding: "0 6px",
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
