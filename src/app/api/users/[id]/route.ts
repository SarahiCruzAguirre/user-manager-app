import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

interface Params {
  params: { id: string };
}

// PUT: Modificar los datos de un usuario existente
export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    // Buscamos al usuario existente en la base de datos
    const user = await User.findById(id);
    if (!user) {
        return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
        );
    }

    // Si la actualización incluye una contraseña nueva, la hasheamos manualmente aquí antes de guardar
    if (body.password && body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    } else {
      // Si viene vacía, removemos el campo para no sobreescribir la contraseña actual con texto vacío
      delete body.password;
    }

    // Actualizamos el documento con los nuevos datos recibidos
    const updatedUser = await User.findByIdAndUpdate(id, body, {
      new: true,
    }).select("-password");

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Error al actualizar la información" },
      { status: 400 },
    );
  }
}

// DELETE: Remover permanentemente un usuario por su ID
export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json(
        { error: "El usuario a eliminar no existe" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al ejecutar la eliminación" },
      { status: 400 },
    );
  }
}
