import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    await connectDB(); // Nos aseguramos de estar conectados a la base de datos
    const { email, password } = await request.json();

    // Verificamos si el usuario existe mediante su correo
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    // Comparamos el hash guardado con la contraseña ingresada por el usuario
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    // Creamos un token JWT conteniendo la información de identidad mínima necesaria
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" } // El token expira automáticamente en un día completo
    );

    // Retornamos la respuesta exitosa junto al token e información de perfil requerida
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}