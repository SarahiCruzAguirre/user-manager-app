// app/api/users/[id]/welcome/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Endpoint para enviar/reenviar el correo de bienvenida de forma manual.
// POST /api/users/:id/welcome
//
// ¿CÓMO FUNCIONA?
//   1. Valida que el token JWT del remitente pertenezca a un administrador.
//   2. Genera una contraseña temporal segura (ej: Temp123456).
//   3. Modifica la contraseña del usuario en MongoDB usando .save() para que
//      el pre-save hook de Mongoose encripte la nueva contraseña con bcrypt.
//   4. Envía el correo de bienvenida usando Nodemailer con los nuevos datos.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import { sendMotivationalEmail } from "@/lib/mailer"
import User from "@/models/User"

interface RouteContext {
  params: { id: string }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  // Verificamos que el usuario que hace la solicitud sea administrador
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  await connectDB()

  // Buscamos al usuario por su ID
  const user = await User.findById(params.id)
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  try {
    // Enviamos el correo de bienvenida con mensaje de estudio
    await sendMotivationalEmail(user.email, user.nombre)
    return NextResponse.json({ message: "Correo de bienvenida enviado exitosamente" })
  } catch (err) {
    console.error("[mailer] Error al enviar correo de bienvenida manual:", err)
    return NextResponse.json(
      { error: "Error al enviar el correo. Verifique la configuración del servidor SMTP." },
      { status: 500 }
    )
  }
}
