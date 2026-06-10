// app/admin/users/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Panel de Administración de Usuarios (/admin/users).
//
// ¿CÓMO SE INTEGRA EN EL FLUJO DE LA APLICACIÓN?
//   - Solo es accesible para usuarios autenticados que posean el rol de "admin".
//   - Si no hay sesión, se redirige a `/login`. Si hay sesión pero no es admin, a `/dashboard`.
//   - Lista todos los usuarios registrados en MongoDB mediante el componente `<UserCard />`.
//   - Provee la barra de búsqueda reactiva por nombre, email, rol o cédula.
//   - Dispara modales para crear, editar y eliminar usuarios interactuando con `useUsers`.
//   - Permite enviar manualmente correos de bienvenida a los usuarios creados.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Obligatorio para ejecutar código cliente

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Input } from "@heroui/react" // Importación de componentes de HeroUI
import { Plus, Search, LogOut, ChevronLeft, Users, RefreshCw, CheckCircle2 } from "lucide-react" // Iconos limpios
import { useAuth } from "@/hooks/useAuth" // Custom hook para autenticación
import { useUsers } from "@/hooks/useUsers" // Custom hook para operaciones de usuarios
import { UserCard } from "@/components/UserCard" // Componente reutilizable para cada usuario
import { UserFormModal } from "@/components/UserFormModal" // Modal de creación/edición
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal" // Modal de confirmación de eliminación
import type { User } from "@/hooks/useUsers" // Tipo de usuario en el frontend

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, authHeader, logout } = useAuth() // Accedemos a la sesión actual

  // ── Protección de Rutas (Solo Admin) ────────────────────────────────────────
  // Comprueba si el usuario tiene permiso para estar en esta página.
  useEffect(() => {
    if (isLoading) return // Esperamos que cargue la sesión
    
    // Si no está autenticado, lo mandamos a loguearse
    if (!isAuthenticated) { 
      router.replace("/login")
      return 
    }
    
    // Si no tiene el rol de administrador, lo mandamos de vuelta al dashboard
    if (user?.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [isLoading, isAuthenticated, user, router])

  // ── Integración del Hook CRUD de Usuarios ────────────────────────────────────
  // Delegamos el estado de los usuarios y peticiones HTTP en el hook personalizado `useUsers`
  const { 
    users, 
    isLoading: usersLoading, 
    error: usersError, 
    fetchUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    sendWelcomeEmail 
  } = useUsers(authHeader as Record<string, string>)

  // ── Estados locales para control de Modales ──────────────────────────────────
  const [formOpen,    setFormOpen]    = useState(false) // Muestra el modal del formulario
  const [deleteOpen,  setDeleteOpen]  = useState(false) // Muestra el modal de confirmación de borrar
  const [editingUser, setEditingUser] = useState<User | null>(null) // Usuario seleccionado para editar (null = nuevo)
  const [deletingUser,setDeletingUser]= useState<User | null>(null) // Usuario seleccionado para borrar

  // ── Barra de Búsqueda ────────────────────────────────────────────────────────
  const [query, setQuery] = useState("") // Filtro escrito por el administrador

  // Estados locales para banners de alerta (Éxito y Error local)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  // Filtrado de usuarios en tiempo real (compara contra nombre, email, cc y rol)
  const filtered = users.filter((u) =>
    [u.nombre, u.email, u.cc, u.role === "admin" ? "administrador" : "usuario"]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  // ── Controladores de Eventos (Handlers) ──────────────────────────────────────
  
  // Abre el modal para crear un usuario nuevo (limpiando el estado anterior)
  const openCreate = () => { setEditingUser(null); setFormOpen(true) }

  // Abre el modal para editar un usuario, pasándole el registro seleccionado
  const openEdit = (u: User) => { setEditingUser(u); setFormOpen(true) }

  // Abre el modal de confirmación para eliminar al usuario seleccionado
  const openDelete = (u: User) => { setDeletingUser(u); setDeleteOpen(true) }

  // Procesa el formulario enviado (crea o actualiza según tengamos un usuario seleccionado)
  const handleFormSubmit = async (payload: Parameters<typeof createUser>[0]) => {
    setLocalError(null)
    if (editingUser) {
      await updateUser(editingUser._id, payload)
      setSuccessMsg("¡Usuario actualizado exitosamente!")
    } else {
      await createUser(payload)
      setSuccessMsg("¡Usuario creado exitosamente y correo de bienvenida enviado!")
    }
    setTimeout(() => setSuccessMsg(null), 5000)
  }

  // Confirma la eliminación y llama al hook para borrar en MongoDB y refrescar la lista local
  const handleDeleteConfirm = async () => {
    setLocalError(null)
    if (deletingUser) {
      await deleteUser(deletingUser._id)
      setSuccessMsg("¡Usuario eliminado exitosamente!")
      setTimeout(() => setSuccessMsg(null), 5000)
    }
  }

  // Envía manualmente el correo de bienvenida con contraseña temporal generada
  const handleSendWelcomeEmail = async (u: User) => {
    setLocalError(null)
    setSuccessMsg(null)
    try {
      const res = await sendWelcomeEmail(u._id)
      setSuccessMsg(`¡Correo de bienvenida enviado con éxito a ${u.nombre}!`)
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Error al enviar el correo de bienvenida")
      setTimeout(() => setLocalError(null), 5000)
    }
  }

  // Si se está verificando la sesión en el montaje inicial, mostramos la pantalla de carga
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9]">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const activeError = localError || usersError

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto relative overflow-hidden bg-[#f1f5f9]">
      {/* Luces decorativas de fondo */}
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Encabezado superior con botón de volver al dashboard y cerrar sesión */}
      <header className="flex items-center justify-between mb-10 animate-fade-up">
        <div className="flex items-center gap-3">
          {/* Botón de regreso */}
          <button
            onClick={() => router.push("/dashboard")}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200"
          >
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-semibold text-sm text-slate-900">
            Gestión de Usuarios
          </span>
        </div>

        <Button
          variant="flat"
          size="sm"
          onPress={logout}
          startContent={<LogOut size={14} />}
          className="text-xs text-slate-500 hover:text-slate-900"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
        >
          Cerrar sesión
        </Button>
      </header>

      {/* Título de la página y botones de acción principal */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-up delay-1">
        <div>
          <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-1">
            Panel de Administración
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Todos los usuarios
            {/* Contador total de usuarios registrados */}
            <span
              className="ml-3 text-sm font-mono font-normal px-2 py-0.5 rounded-lg"
              style={{ background: "var(--bg-raised)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {users.length}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón para refrescar la lista de usuarios manualmente */}
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={fetchUsers}
            isLoading={usersLoading}
            className="text-slate-500 hover:text-slate-900"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <RefreshCw size={14} />
          </Button>

          {/* Botón para abrir el modal de crear usuario */}
          <Button
            onPress={openCreate}
            size="sm"
            startContent={<Plus size={15} />}
            className="font-display font-semibold text-sm"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            Nuevo usuario
          </Button>
        </div>
      </section>

      {/* Entrada de búsqueda */}
      <div className="mb-6 animate-fade-up delay-2">
        <Input
          placeholder="Buscar por nombre, correo o cédula..."
          value={query}
          onValueChange={setQuery}
          startContent={<Search size={15} className="text-slate-400 flex-shrink-0" />}
          variant="bordered"
          classNames={{
            input: "text-slate-900 text-sm placeholder:text-slate-400",
            inputWrapper: "max-w-sm",
          }}
          isClearable
          onClear={() => setQuery("")}
        />
      </div>

      {/* Mostrar banner de éxito si el mensaje existe */}
      {successMsg && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm text-emerald-700 flex items-center gap-2 animate-fade-in bg-emerald-50 border border-emerald-200"
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Mostrar banner si hay errores de red o servidor */}
      {activeError && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm text-red-600 animate-fade-in bg-red-50 border border-red-200"
        >
          {activeError}
        </div>
      )}

      {/* Esqueleto de carga (skeletons) si es la primera carga y está vacío */}
      {usersLoading && !users.length && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl animate-pulse bg-white border border-slate-200"
            />
          ))}
        </div>
      )}

      {/* Mensaje de lista vacía */}
      {!usersLoading && filtered.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 bg-white border border-slate-200"
          >
            <Users size={22} className="text-slate-400" />
          </div>
          <p className="font-display font-medium text-slate-500">
            {query ? "Ningún usuario coincide con la búsqueda." : "No hay usuarios registrados. ¡Crea el primero!"}
          </p>
          {!query && (
            <Button
              onPress={openCreate}
              size="sm"
              className="mt-4 font-display font-semibold text-sm"
              style={{ background: "var(--accent)", color: "#ffffff" }}
            >
              Crear primer usuario
            </Button>
          )}
        </div>
      )}

      {/* Rejilla (Grid) de tarjetas de usuarios usando el componente reusable UserCard */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up delay-3">
          {filtered.map((u) => (
            <UserCard
              key={u._id}
              nombre={u.nombre}
              cc={u.cc}
              email={u.email}
              role={u.role}
              onEdit={() => openEdit(u)} // Callback al hacer clic en editar
              onDelete={() => openDelete(u)} // Callback al hacer clic en eliminar
              onSendWelcome={() => handleSendWelcomeEmail(u)} // Envío manual de correo
              isMe={u.email === user.email}
            />
          ))}
        </div>
      )}

      {/* Modales controlados */}
      <UserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={deletingUser?.nombre ?? ""}
      />

    </main>
  )
}
