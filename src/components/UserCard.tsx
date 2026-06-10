// components/UserCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Componente de presentación reutilizable para mostrar la tarjeta de un usuario.
//
// ¿CÓMO FUNCIONA?
//   Este es un componente "tonto" o de presentación (dumb component). No realiza llamadas
//   HTTP ni maneja lógica compleja de base de datos; simplemente recibe toda su información
//   a través de props y dispara funciones callbacks (onEdit y onDelete) provistas por el padre
//   cuando el administrador hace clic en los botones correspondientes.
//
// CARACTERÍSTICAS ESPECIALES:
//   - Color de fondo dinámico según el rol (admin = azul/indigo, user = gris/neutro).
//   - Iconos limpios e interactivos usando la librería `lucide-react`.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Habilita comportamiento interactivo en el cliente

import { useState } from "react"
import { Button, Chip } from "@heroui/react" // Importamos los componentes listos de HeroUI
import { Pencil, Trash2, ShieldCheck, User, Mail } from "lucide-react" // Iconos limpios en lugar de emojis normales

// Interfaz que define las propiedades que obligatoriamente requiere este componente
interface UserCardProps {
  nombre:   string
  cc:       string
  email:    string
  role:     "user" | "admin"
  onEdit:   () => void   // Función callback al presionar el botón de editar
  onDelete: () => void   // Función callback al presionar el botón de borrar
  onSendWelcome?: () => Promise<void> // Callback opcional para enviar correo de bienvenida
  isMe?:    boolean      // Indica si la tarjeta representa al usuario actual logueado
}

export function UserCard({ nombre, cc, email, role, onEdit, onDelete, onSendWelcome, isMe = false }: UserCardProps) {
  const isAdmin = role === "admin" // Constante booleana para simplificar condicionales
  const [sendingMail, setSendingMail] = useState(false)

  const handleSendMail = async () => {
    if (!onSendWelcome) return
    setSendingMail(true)
    try {
      await onSendWelcome()
    } catch (err) {
      console.error(err)
    } finally {
      setSendingMail(false)
    }
  }

  return (
    <article
      className="relative overflow-hidden rounded-2xl border transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        // Asignamos estilos de fondo y bordes dinámicos según el rol usando las variables CSS globales
        background:   isAdmin ? "var(--role-admin)"        : "var(--role-user)",
        borderColor:  isAdmin ? "var(--role-admin-border)" : "var(--role-user-border)",
        boxShadow: isAdmin
          ? "0 8px 30px rgba(14, 165, 233, 0.05)"
          : "0 8px 30px rgba(15, 23, 42, 0.03)",
      }}
    >
      {/* Línea decorativa sutil en la parte superior */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: isAdmin
            ? "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.3), transparent)"
            : "linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.06), transparent)",
        }}
      />

      <div className="p-5">
        {/* Fila del encabezado: inicial del avatar, nombre del usuario y Chip de rol */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Círculo con la inicial del nombre */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
              style={{
                background: isAdmin
                  ? "rgba(14, 165, 233, 0.08)"
                  : "rgba(15, 23, 42, 0.04)",
                color: isAdmin ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {nombre.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-display font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                {nombre}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Cédula {cc}
              </p>
            </div>
          </div>

          {/* Chip de rol de HeroUI, con variantes de color sutiles */}
          <Chip
            size="sm"
            variant="flat"
            startContent={
              isAdmin
                ? <ShieldCheck size={12} className="ml-1" /> // Icono escudo para administradores
                : <User size={12} className="ml-1" />        // Icono silueta para usuarios estándar
            }
            classNames={{
              base: isAdmin
                ? "bg-sky-500/10 border border-sky-500/20"
                : "bg-slate-500/5 border border-slate-500/10",
              content: isAdmin
                ? "text-sky-600 text-xs font-mono font-medium"
                : "text-slate-500 text-xs font-mono font-medium",
            }}
          >
            {role === "admin" ? "administrador" : "usuario"}
          </Chip>
        </div>

        {/* Fila del correo electrónico (truncado para evitar que desborde el diseño) */}
        <div className="mb-4">
          <p
            className="text-xs font-mono truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {email}
          </p>
        </div>

        {/* Botones de acción (Editar y Eliminar) */}
        <div className="flex gap-2">
          {/* Botón Correo: Envía/Reenvía correo de bienvenida */}
          {onSendWelcome && (
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              onPress={handleSendMail}
              isLoading={sendingMail}
              className="text-xs font-body h-8 w-8 min-w-[32px]"
              style={{
                background: "rgba(14, 165, 233, 0.06)",
                color: "var(--accent)",
                border: "1px solid rgba(14, 165, 233, 0.15)",
              }}
              title="Enviar Correo de Bienvenida"
            >
              {!sendingMail && <Mail size={13} />}
            </Button>
          )}

          {/* Botón Lápiz: Abre el formulario de edición */}
          <Button
            size="sm"
            variant="flat"
            onPress={onEdit}
            startContent={<Pencil size={13} />}
            className="flex-1 text-xs font-body h-8"
            style={{
              background: "rgba(15, 23, 42, 0.02)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            Editar
          </Button>

          {/* Botón Caneca: Elimina el usuario con confirmación (desactivado si es el mismo usuario) */}
          <Button
            size="sm"
            variant="flat"
            onPress={onDelete}
            isDisabled={isMe}
            startContent={<Trash2 size={13} />}
            className="flex-1 text-xs font-body h-8"
            style={{
              background: isMe ? "rgba(15, 23, 42, 0.02)" : "rgba(239,68,68,0.05)",
              color: isMe ? "var(--text-muted)" : "#dc2626",
              border: isMe ? "1px solid var(--border)" : "1px solid rgba(239,68,68,0.12)",
            }}
            title={isMe ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  )
}
