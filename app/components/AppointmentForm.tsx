"use client";

import { useState } from "react";

export interface ApptFormState {
  client_name: string;
  client_phone: string;
  start_time: string;
  end_time: string;
  notes: string;
}

export default function AppointmentForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ApptFormState;
  onSubmit: (data: ApptFormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ApptFormState>(
    initial ?? {
      client_name: "",
      client_phone: "",
      start_time: "",
      end_time: "",
      notes: "",
    }
  );

  const set = (k: keyof ApptFormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      style={{
        display: "grid",
        gap: 8,
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        border: "1px solid #e2e2e2",
      }}
    >
      <label>
        Cliente *
        <input
          required
          value={form.client_name}
          onChange={(e) => set("client_name", e.target.value)}
        />
      </label>
      <label>
        Teléfono
        <input
          value={form.client_phone}
          onChange={(e) => set("client_phone", e.target.value)}
        />
      </label>
      <label>
        Inicio *
        <input
          type="datetime-local"
          required
          value={form.start_time}
          onChange={(e) => set("start_time", e.target.value)}
        />
      </label>
      <label>
        Fin *
        <input
          type="datetime-local"
          required
          value={form.end_time}
          onChange={(e) => set("end_time", e.target.value)}
        />
      </label>
      <label>
        Notas
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" style={btnPrimary}>
          Guardar
        </button>
        <button type="button" onClick={onCancel} style={btnGhost}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

const btnPrimary = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
};
const btnGhost = {
  background: "#eee",
  color: "#333",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
};
