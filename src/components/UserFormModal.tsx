// components/UserFormModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal con formulario reactivo para la creación y edición de usuarios.
//
// ¿CÓMO SE INTEGRA EN EL PROYECTO?
//   - Es llamado desde la vista de administración (/admin/users).
//   - Recibe opcionalmente un prop `user`.
//     - Si `user` existe, se ejecuta en modo "edición" (pre-poblando los campos).
//     - Si no se provee `user`, se ejecuta en modo "creación" (campos vacíos).
//   - Al enviar el formulario (onSubmit), dispara la callback del padre pasando el payload.
//   - Muestra un medidor de fortaleza de contraseña (`PasswordStrengthBar`) en tiempo real.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Habilita comportamiento reactivo en el cliente (navegador)

import { useState, useEffect } from "react"
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Select, SelectItem,
} from "@heroui/react" // Importamos los componentes de formulario oficiales de HeroUI
import { Eye, EyeOff } from "lucide-react" // Iconos limpios para alternar visibilidad de contraseña
import { PasswordStrengthBar } from "./PasswordStrengthBar" // Componente de medidor de contraseña
import type { User } from "@/hooks/useUsers" // Tipado del usuario de frontend
import type { UserPayload } from "@/services/userService" // Tipado del payload para la API

// Propiedades recibidas del componente administrador padre
interface Props {
  isOpen:   boolean
  onClose:  () => void
  onSubmit: (data: UserPayload) => Promise<void>
  user?:    User | null   // null o undefined indica que es modo "crear"
}

export function UserFormModal({ isOpen, onClose, onSubmit, user }: Props) {
  const isEdit = !!user // Determina si estamos editando o creando un usuario nuevo

  // ── Estados locales para cada campo del formulario ─────────────────────────
  const [nombre,   setNombre]   = useState("")
  const [cc,       setCc]       = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [role,     setRole]     = useState<"user" | "admin">("user")
  const [showPw,   setShowPw]   = useState(false) // Alterna la visibilidad de la contraseña
  const [loading,  setLoading]  = useState(false) // Muestra estado de carga en el botón de guardado
  const [error,    setError]    = useState<string | null>(null) // Almacena mensajes de error devueltos por el servidor

  // Efecto que pre-pobla los campos cuando se abre en modo edición, o los limpia en modo creación
  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setCc(user.cc)
      setEmail(user.email)
      setRole(user.role)
      setPassword("") // Dejamos la contraseña vacía por defecto; si el admin no escribe nada, no se actualiza
    } else {
      setNombre(""); setCc(""); setEmail(""); setPassword(""); setRole("user")
    }
    setError(null) // Reseteamos errores anteriores
  }, [user, isOpen])

  // Envío del formulario
  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      // Construimos el payload con la estructura requerida por userService
      const payload: UserPayload = { nombre, cc, email, role }
      
      // Si se ingresó una contraseña (obligatoria en crear, opcional en editar), la agregamos al payload
      if (password) payload.password = password
      
      // Ejecutamos la callback asíncrona del padre (que llamará a userService)
      await onSubmit(payload)
      onClose() // Cerramos el modal tras el guardado exitoso
    } catch (err) {
      // Capturamos cualquier error devuelto por la API (ej: cédula o email repetido)
      setError(err instanceof Error ? err.message : "Algo salió mal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        base:    "bg-white border border-slate-200 shadow-2xl",
        header:  "border-b border-slate-100",
        footer:  "border-t border-slate-100",
        body:    "py-6",
        closeButton: "text-slate-400 hover:text-slate-700",
      }}
    >
      <ModalContent>
        {/* Encabezado del modal */}
        <ModalHeader>
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-0.5">
              {isEdit ? "Editar usuario" : "Nuevo usuario"}
            </p>
            <h2 className="font-display text-lg font-semibold text-slate-950">
              {isEdit ? `Editando a ${user?.nombre}` : "Crear cuenta de usuario"}
            </h2>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Banner de error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Campo: Nombre completo */}
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={nombre}
            onValueChange={setNombre}
            variant="bordered"
            classNames={{ input: "text-slate-900", label: "text-slate-500" }}
          />

          {/* Campo: Cédula (Identificación) */}
          <Input
            label="Número de Cédula / Identificación"
            placeholder="1234567890"
            value={cc}
            onValueChange={setCc}
            variant="bordered"
            classNames={{ input: "text-slate-900 font-mono", label: "text-slate-500" }}
          />

          {/* Campo: Correo electrónico */}
          <Input
            type="email"
            label="Correo electrónico"
            placeholder="juan@ejemplo.com"
            value={email}
            onValueChange={setEmail}
            variant="bordered"
            classNames={{ input: "text-slate-900 font-mono text-sm", label: "text-slate-500" }}
          />

          {/* Campo: Contraseña */}
          <div>
            <Input
              type={showPw ? "text" : "password"}
              label={isEdit ? "Nueva contraseña (dejar en blanco para mantener)" : "Contraseña"}
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              variant="bordered"
              classNames={{ input: "text-slate-900 font-mono", label: "text-slate-500" }}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {/* Medidor visual de fortaleza de la contraseña en base a zxcvbn */}
            <PasswordStrengthBar password={password} />
          </div>

          {/* Selector de Rol de HeroUI */}
          <Select
            label="Rol de usuario"
            selectedKeys={[role]}
            onSelectionChange={(keys) => setRole([...keys][0] as "user" | "admin")}
            variant="bordered"
            classNames={{ trigger: "text-slate-900", label: "text-slate-500" }}
          >
            {/* SelectItem representa las opciones del selector */}
            <SelectItem key="user" textValue="Usuario Estándar">Usuario Estándar</SelectItem>
            <SelectItem key="admin" textValue="Administrador">Administrador</SelectItem>
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose} className="text-slate-500 hover:text-slate-800">
            Cancelar
          </Button>
          <Button
            isLoading={loading}
            onPress={handleSubmit}
            className="font-display font-semibold"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            {isEdit ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
