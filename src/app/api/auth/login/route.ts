// app/api/auth/login/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
//
// Receives { email, password } and returns a signed JWT + safe user object
// if the credentials are valid.
//
// Security notes:
//   - We use user.comparePassword() which calls bcrypt.compare() under the hood.
//     bcrypt.compare is timing-safe — it takes the same amount of time whether
//     the hash matches or not, preventing timing-based attacks.
//   - We always return the same generic error message regardless of whether the
//     email doesn't exist or the password is wrong.  This prevents user
//     enumeration (an attacker finding out which emails are registered).
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "El correo electrónico y la contraseña son obligatorios" }, { status: 400 })
  }

  await connectDB()

  // We need the password field for comparison, so we DON'T use .select("-password") here.
  const user = await User.findOne({ email: email.toLowerCase() })

  // Always run comparePassword even when the user doesn't exist, to prevent
  // timing attacks.  bcrypt.compare against a dummy hash takes the same time
  // as a real comparison.
  const dummyHash = "$2a$12$invalidhashfortiminggapprotection"
  const isMatch = user
    ? await user.comparePassword(password)
    : await import("bcryptjs").then((b) => b.compare(password, dummyHash))

  if (!user || !isMatch) {
    return NextResponse.json(
      { error: "Email o contraseña incorrectos" },
      { status: 401 }
    )
  }

  // Sign the JWT with the minimal data needed on the frontend.
  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    nombre: user.nombre,
    cc: user.cc,
  })

  // The client-side useAuth hook will store this object in localStorage.
  return NextResponse.json({
    token,
    user: {
      id: user._id.toString(),
      nombre: user.nombre,
      email: user.email,
      role: user.role,
      cc: user.cc,
    },
  })
}
