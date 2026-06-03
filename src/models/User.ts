import { Schema, models, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Definimos la interfaz limpia del Usuario que hereda de Document para Mongoose
export interface IUser extends Document {
  nombre: string;
  cc: string;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Definición estricta del esquema de usuario
const UserSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    cc: {
      type: String,
      required: [true, "La cédula/documento es obligatoria"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio"],
      unique: true,
      lowercase: true, // Evita duplicados por mayúsculas en el Login
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Solo acepta estos roles estrictamente
      default: "user",
    },
  },
  {
    timestamps: true, // Crea automáticamente 'createdAt' y 'updatedAt'
  }
);

/**
 * MIDDLEWARE PRE-SAVE: Se ejecuta automáticamente antes de guardar en la BD.
 * Al usar una función asíncrona (async), Mongoose resuelve la promesa automáticamente.
 * ¡NO se debe usar next() aquí!
 */
UserSchema.pre<IUser>("save", async function () {
  // Si la contraseña no ha sido modificada, salimos de inmediato
  if (!this.isModified("password")) return;

  try {
    if (this.password) {
      // Generamos los salts (rondas de aleatoriedad) para el hash
      const salt = await bcrypt.genSalt(10);
      // Hasheamos la contraseña original reemplazando el texto plano
      this.password = await bcrypt.hash(this.password, salt);
    }
  } catch (error) {
    // Lanzamos el error para que Mongoose aborte el guardado de forma segura
    throw error;
  }
});

// 3. Exportamos el modelo reutilizando la caché para evitar errores de recompilación en Next.js
export const User = models.User || model<IUser>("User", UserSchema);