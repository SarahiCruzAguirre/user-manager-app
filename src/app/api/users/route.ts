// app/api/users/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Handles:
//   GET  /api/users  →  list all users (admin only)
//   POST /api/users  →  create a new user + send welcome email (admin only)
//
// Next.js App Router convention:
//   Export a named async function for each HTTP verb you want to handle.
//   The function receives a NextRequest and must return a NextResponse.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/mailer"
import User from "@/models/User"

// ─── GET /api/users ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Verify the JWT on every request — we never trust the client implicitly.
  const token = getTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  await connectDB()

  // .select("-password") excludes the hashed password from the response.
  // We never send password hashes to the frontend — not even hashed ones.
  const users = await User.find({}).select("-password").sort({ createdAt: -1 })

  return NextResponse.json({ users })
}

// ─── POST /api/users ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  // req.json() parses the request body — Next.js does this automatically from
  // the Content-Type: application/json header.
  const body = await req.json()
  const { nombre, cc, email, password, role } = body

  if (!nombre || !cc || !email || !password) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
  }

  await connectDB()

  // Check uniqueness ourselves before hitting the DB so we can return a nicer
  // error message than Mongoose's duplicate-key error (code 11000).
  const existing = await User.findOne({ $or: [{ email }, { cc }] })
  if (existing) {
    const field = existing.email === email ? "correo electrónico" : "número de cédula"
    return NextResponse.json({ error: `Este ${field} ya está registrado` }, { status: 409 })
  }

  // Mongoose's pre-save hook in models/User.ts will hash the password before
  // it reaches MongoDB, so we pass the plain-text value here intentionally.
  const user = await User.create({ nombre, cc, email, password, role })

  // Fire the welcome email — we don't await it in a way that blocks the response.
  // If the email fails the user was still created, so we just log the error.
  sendWelcomeEmail(email, nombre, password).catch((err) =>
    console.error("[mailer] Failed to send welcome email:", err)
  )

  // Return the new user without the password hash.
  const { password: _pw, ...safeUser } = user.toObject()
  return NextResponse.json({ user: safeUser }, { status: 201 })
}
