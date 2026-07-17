"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url =
      mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload =
      mode === "register" ? { name, email, password } : { email, password };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main
      style={{
        maxWidth: 380,
        margin: "60px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e2e2e2",
      }}
    >
      <h1 style={{ marginTop: 0 }}>
        {mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
      </h1>
      <p style={{ color: "#666" }}>
        Gestiona la agenda de tu {mode === "register" ? "negocio" : "negocio"}.
      </p>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        {mode === "register" && (
          <input
            placeholder="Nombre del negocio"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: "#c00" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: 6,
          }}
        >
          {loading ? "..." : mode === "register" ? "Registrarse" : "Entrar"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "register" ? "login" : "register")}
        style={{
          marginTop: 12,
          background: "transparent",
          border: "none",
          color: "#2563eb",
        }}
      >
        {mode === "register"
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Regístrate"}
      </button>
    </main>
  );
}
