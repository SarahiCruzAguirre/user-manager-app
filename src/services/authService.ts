// services/authService.ts
// Service layer for authentication endpoints.
// The useAuth hook calls these instead of fetching directly.

export const authService = {
  async login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Error al iniciar sesión")
    return data as { token: string; user: { id: string; nombre: string; email: string; role: "user" | "admin"; cc: string } }
  },

  async register(payload: { nombre: string; cc: string; email: string; password: string; role: "user" | "admin" }) {
    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Error al registrar la cuenta")
    return data as { token: string; user: { id: string; nombre: string; email: string; role: "user" | "admin"; cc: string } }
  },
}
