import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendWelcomeEmail } from "@/lib/mailer";

// GET: Retornar todos los usuarios del sistema
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}, "-password"); // Traemos todos, pero EXCLUIMOS el campo password por seguridad
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Fallo al obtener los usuarios" }, { status: 500 });
  }
}

// POST: Crear un nuevo usuario en la base de datos y despachar correo electrónico
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { nombre, cc, email, password, role } = body;

    // Controlamos si el correo ya se encuentra en uso por otra persona
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
    }

    // Instanciamos el nuevo usuario (Mongoose activará el hasheo pre-save aquí)
    const newUser = new User({ nombre, cc, email, password, role });
    await newUser.save();

    // Intentamos despachar el correo electrónico de bienvenida con las credenciales limpias originales
    try {
      await sendWelcomeEmail(email, nombre, password);
    } catch (mailError) {
      console.error("Error al despachar el correo de bienvenida:", mailError);
      // No bloqueamos la creación del usuario si el proveedor de correos falla temporalmente
    }

    return NextResponse.json({ message: "Usuario creado con éxito", userId: newUser._id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || "Error al procesar la creación" }, { status: 400 });
  }
}