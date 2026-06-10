// app/api/users/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Handles:
//   PUT    /api/users/:id  →  update a user
//   DELETE /api/users/:id  →  delete a user
//
// The [id] folder name tells Next.js this is a dynamic segment.
// The id value arrives in the second argument as params.id.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import User from "@/models/User"

// Context is the second argument for dynamic routes — it carries the URL params.
interface RouteContext {
  params: { id: string }
}

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const body = await req.json()
  const { nombre, cc, email, role, password } = body

  await connectDB()

  // Build the update object dynamically — we only update fields that were sent.
  // This way a PATCH-like update works even though we're using PUT.
  const updates: Record<string, string> = {}
  if (nombre) updates.nombre = nombre
  if (cc)     updates.cc     = cc
  if (email)  updates.email  = email
  if (role)   updates.role   = role

  // If a new password was provided, hash it before storing.
  // We call bcrypt directly here because we're using findByIdAndUpdate, which
  // bypasses Mongoose's pre-save hook (pre-save only runs on .save()).
  if (password) {
    const bcrypt = await import("bcryptjs")
    const salt = await bcrypt.genSalt(12)
    updates.password = await bcrypt.hash(password, salt)
  }

  const updated = await User.findByIdAndUpdate(
    params.id,
    { $set: updates },
    {
      new: true,            // return the document AFTER the update, not before
      runValidators: true,  // run Schema validators on the updated fields
    }
  ).select("-password")

  if (!updated) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ user: updated })
}

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  if (payload.userId === params.id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
  }

  await connectDB()

  const deleted = await User.findByIdAndDelete(params.id)

  if (!deleted) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  // 204 No Content — success, but there's nothing to return.
  return new NextResponse(null, { status: 204 })
}

