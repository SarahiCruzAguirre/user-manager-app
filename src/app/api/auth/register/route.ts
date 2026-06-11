// app/api/auth/register/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
//
// Public endpoint — lets anyone create a new account with the "user" role.
// The admin can create users with any role via POST /api/users.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const { nombre, cc, email, password, role } = await req.json()

    if (!nombre || !cc || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({ $or: [{ email }, { cc }] })
    if (existing) {
      const field = existing.email === email ? "correo electrónico" : "número de cédula"
      return NextResponse.json({ error: `Este ${field} ya está registrado` }, { status: 409 })
    }

    // Se permite el registro con el rol elegido ("user" o "admin"), por defecto "user"
    const user = await User.create({ nombre, cc, email, password, role: role || "user" })

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      cc: user.cc,
    })

    return NextResponse.json(
      {
        token,
        user: {
          id: user._id.toString(),
          nombre: user.nombre,
          email: user.email,
          role: user.role,
          cc: user.cc,
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Error en registro:", err)
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 })
  }
}
