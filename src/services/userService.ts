// services/userService.ts
// ─────────────────────────────────────────────────────────────────────────────
// The service layer is the ONLY place in the app that makes direct fetch()
// calls to our API routes.
//
// WHY A SERVICE LAYER?
//   If we called fetch("/api/users") directly inside page components:
//     - Every component would need to know the endpoint URL
//     - Error handling would be copy-pasted everywhere
//     - Switching from /api/users to an external API would require editing
//       every single component
//   The service layer is a single source of truth for "how do I talk to the API".
//   Components and hooks just call functions — they don't care about HTTP at all.
// ─────────────────────────────────────────────────────────────────────────────

// The shape of the data needed to create or update a user.
export interface UserPayload {
  nombre: string
  cc: string
  email: string
  password?: string
  role?: "user" | "admin"
}

// ── Shared helper ──────────────────────────────────────────────────────────────
// Throws a descriptive error if the response is not 2xx.
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed with status ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Service object ─────────────────────────────────────────────────────────────
// We export a plain object rather than individual functions so import is cleaner:
//   import { userService } from "@/services/userService"
//   userService.getUsers(authHeader)
export const userService = {
  // GET /api/users
  async getUsers(authHeader: Record<string, string>) {
    const res  = await fetch("/api/users", { headers: authHeader })
    const data = await handleResponse<{ users: unknown[] }>(res)
    return data.users as import("@/hooks/useUsers").User[]
  },

  // POST /api/users
  async createUser(payload: UserPayload, authHeader: Record<string, string>) {
    const res = await fetch("/api/users", {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body:    JSON.stringify(payload),
    })
    const data = await handleResponse<{ user: unknown }>(res)
    return data.user as import("@/hooks/useUsers").User
  },

  // PUT /api/users/:id
  async updateUser(id: string, payload: Partial<UserPayload>, authHeader: Record<string, string>) {
    const res = await fetch(`/api/users/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", ...authHeader },
      body:    JSON.stringify(payload),
    })
    const data = await handleResponse<{ user: unknown }>(res)
    return data.user as import("@/hooks/useUsers").User
  },

  // DELETE /api/users/:id — returns nothing (204 No Content)
  async deleteUser(id: string, authHeader: Record<string, string>) {
    const res = await fetch(`/api/users/${id}`, {
      method:  "DELETE",
      headers: authHeader,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? "No se pudo eliminar al usuario")
    }
  },

  // POST /api/users/:id/welcome — envia el correo de bienvenida
  async sendWelcomeEmail(id: string, authHeader: Record<string, string>) {
    const res = await fetch(`/api/users/${id}/welcome`, {
      method:  "POST",
      headers: authHeader,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? "No se pudo enviar el correo de bienvenida")
    }
    return res.json() as Promise<{ message: string }>
  },
}
