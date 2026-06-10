// models/User.ts
// ─────────────────────────────────────────────────────────────────────────────
// Definición del esquema y modelo del Usuario en MongoDB usando Mongoose.
//
// ¿CÓMO FUNCIONA MONGOOSE EN ESTE ARCHIVO?
//   - Schema: Describe la estructura de datos, tipos, validaciones y valores por defecto.
//   - Model: Clase constructora que nos da métodos de base de datos como .find(), .create().
//   - Document / IUser: Interfaz de TypeScript que describe las propiedades del registro.
//
// NOTA SOBRE HOT-RELOAD EN NEXT.JS:
//   En Next.js (en desarrollo), los archivos se vuelven a evaluar al guardar cambios.
//   Si solo usáramos 'mongoose.model("User", UserSchema)', Mongoose lanzaría un error
//   diciendo que el modelo ya existe. Para solucionarlo, comprobamos si ya está registrado
//   en la memoria global cacheada `mongoose.models.User` antes de compilarlo de nuevo.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model } from "mongoose"
import bcrypt from "bcryptjs"

// Interfaz de TypeScript que describe el documento de Usuario.
// Heredamos de 'Document' de Mongoose para obtener métodos nativos de base de datos.
export interface IUser extends Document {
  nombre: string
  cc: string
  email: string
  password: string
  role: "user" | "admin"
  createdAt: Date
  // Método de instancia para verificar contraseñas de forma segura
  comparePassword(candidate: string): Promise<boolean>
}

// Creación del esquema con validaciones básicas y optimizaciones de bases de datos
const UserSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true, // Remueve espacios en blanco al principio y final
    },
    cc: {
      type: String,
      required: [true, "La cédula o identificación es obligatoria"],
      unique: true, // Mapea a un índice único en MongoDB para evitar duplicidad de cédula
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio"],
      unique: true, // Mapea a un índice único de email en MongoDB
      lowercase: true, // Guarda siempre en minúsculas para comparaciones consistentes
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un correo electrónico válido"], // Expresión regular de validación
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Restringe el rol únicamente a estos dos valores
      default: "user",
    },
  },
  {
    // timestamps: true crea y actualiza automáticamente los campos 'createdAt' y 'updatedAt'
    timestamps: true,
  }
)

// ─── Pre-save hook (Middleware de Mongoose) ──────────────────────────────────
// Esta función se ejecuta automáticamente ANTES de guardar cualquier documento con .save().
// Solo hasheamos la contraseña si ha sido modificada o es nueva, evitando hashear
// un hash ya existente cuando el usuario edita otros campos (como su nombre o email).
UserSchema.pre("save", async function () {
  // Si la contraseña no ha sido modificada, salimos temprano sin hacer nada
  if (!this.isModified("password")) return

  // Generamos un 'salt' con 12 rondas de complejidad (seguridad balanceada para hardware moderno)
  const salt = await bcrypt.genSalt(12)
  
  // Hasheamos la contraseña ingresada en texto plano y la guardamos encriptada
  this.password = await bcrypt.hash(this.password, salt)
})

// ─── Método de Instancia ──────────────────────────────────────────────────────
// comparePassword recibe la contraseña ingresada por el usuario (texto plano)
// y la compara de forma segura contra el hash guardado usando bcrypt.compare.
// bcrypt.compare es inmune a ataques de temporización (timing attacks).
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

// ─── Exportación del Modelo ───────────────────────────────────────────────────
// Usamos cortocircuito para reutilizar el modelo si ya existe en Next.js, evitando errores de duplicidad.
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema)

export default User
