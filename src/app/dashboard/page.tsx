// app/dashboard/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Vista del Dashboard Protegido (/dashboard).
//
// ¿CÓMO SE INTEGRA EN EL FLUJO DE LA APLICACIÓN?
//   - Solo es accesible si el usuario ha iniciado sesión (tiene un token en localStorage).
//   - Si no hay sesión activa, el hook `useAuth` e `useEffect` redirigen automáticamente a `/login`.
//   - Muestra la información básica del usuario autenticado: Nombre, Email, CC y Rol.
//   - Posee un selector de pestañas interactivo ("Inicio" y "Mi Perfil") para cumplir con la vista de perfil.
//   - Contiene el botón de "Cerrar sesión" que limpia localStorage y redirige a `/login`.
//   - Si el rol es admin, muestra un enlace rápido al panel de administración de usuarios.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Obligatorio para ejecutar código cliente (hooks, redirecciones de router)

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Chip } from "@heroui/react" // Importamos componentes interactivos de HeroUI
import { LogOut, Users, ShieldCheck, LayoutDashboard, ArrowRight } from "lucide-react" // Iconos limpios
import { useAuth } from "@/hooks/useAuth" // Custom hook de sesión

export default function DashboardPage() {
  const router = useRouter() // Instanciamos el router para redirigir
  const { user, isLoading, isAuthenticated, logout } = useAuth() // Estados y logout expuestos por useAuth

  // Estado para controlar la pestaña activa: "inicio" o "perfil"
  const [activeTab, setActiveTab] = useState<"inicio" | "perfil">("inicio")

  // Protección de ruta: se ejecuta en el montaje del componente.
  // Esperamos a que 'isLoading' sea false para evitar redirigir al login
  // mientras leemos el localStorage durante la carga inicial.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Si aún está cargando la sesión o no tenemos el objeto usuario cargado, mostramos spinner
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9]">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const isAdmin = user.role === "admin" // Guardamos en variable si el usuario es administrador

  // Generamos las iniciales del nombre (ej: "Juan Pérez" -> "JP")
  const initials = user.nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto relative overflow-hidden bg-[#f1f5f9]">
      {/* Glows de fondo decorativos */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Encabezado superior con logotipo y botón de cerrar sesión */}
      <header className="flex items-center justify-between mb-12 animate-fade-up">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200"
          >
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-semibold text-sm text-slate-900">
            User Manager
          </span>
        </div>

        {/* Botón Cerrar Sesión: borra localStorage y redirige al login */}
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

      {/* Navegación por Pestañas (Tabs) en español */}
      <div className="flex gap-6 border-b border-slate-900/[0.06] mb-10 animate-fade-up delay-1">
        <button
          onClick={() => setActiveTab("inicio")}
          className={`pb-3 text-sm font-display font-semibold transition-all relative ${
            activeTab === "inicio" ? "text-slate-950" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Panel de Control
          {activeTab === "inicio" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("perfil")}
          className={`pb-3 text-sm font-display font-semibold transition-all relative ${
            activeTab === "perfil" ? "text-slate-950" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Mi Perfil
          {activeTab === "perfil" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ─── PESTAÑA 1: INICIO (DASHBOARD) ─────────────────────────────────── */}
      {activeTab === "inicio" && (
        <div className="space-y-10 animate-fade-in">
          {/* Sección de bienvenida */}
          <section className="animate-fade-up">
            <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-2">
              Inicio
            </p>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0"
                style={{
                  background: isAdmin ? "rgba(14, 165, 233, 0.08)" : "var(--bg-raised)",
                  border: `1px solid ${isAdmin ? "rgba(14, 165, 233, 0.15)" : "var(--border)"}`,
                  color: isAdmin ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {initials}
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-950">
                  ¡Hola, {user.nombre.split(" ")[0]}!
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">{user.email}</span>
                  <Chip
                    size="sm"
                    variant="flat"
                    startContent={isAdmin ? <ShieldCheck size={11} className="ml-1" /> : undefined}
                    classNames={{
                      base: isAdmin
                        ? "bg-sky-500/10 border border-sky-500/20"
                        : "bg-slate-500/5 border border-slate-500/10",
                      content: isAdmin ? "text-sky-600 text-xs font-mono" : "text-slate-500 text-xs font-mono",
                    }}
                  >
                    {isAdmin ? "administrador" : "usuario estándar"}
                  </Chip>
                </div>
              </div>
            </div>
          </section>

          {/* Tarjetas de información y estado de la sesión */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Estado de la cuenta",
                value: "Activo",
                sub: "Tu sesión es válida y segura",
                accent: true,
              },
              {
                label: "Rol de usuario",
                value: user.role === "admin" ? "Administrador" : "Usuario estándar",
                sub: isAdmin ? "Acceso completo concedido" : "Acceso limitado a la plataforma",
                accent: false,
              },
              {
                label: "Registro de sesión",
                value: "Autenticado",
                sub: "Protegido con encriptación JWT",
                accent: false,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-5 transition-all duration-200"
                style={{
                  background: card.accent ? "var(--accent-dim)" : "var(--bg-surface)",
                  border: `1px solid ${card.accent ? "rgba(14, 165, 233, 0.15)" : "var(--border)"}`,
                  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.02)",
                }}
              >
                <p
                  className="text-xs font-mono tracking-widest uppercase mb-2"
                  style={{ color: card.accent ? "var(--accent)" : "var(--text-muted)" }}
                >
                  {card.label}
                </p>
                <p className="font-display font-semibold text-lg text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Atajo de administración: Solo se muestra si el rol es "admin" */}
          {isAdmin && (
            <div
              className="rounded-2xl p-6 flex items-center justify-between"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.15)" }}
                >
                  <Users size={18} color="var(--accent)" />
                </div>
                <div>
                  <p className="font-display font-semibold text-slate-950 text-sm">Gestión de Usuarios</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Crea, edita, elimina y envía correos de bienvenida a los usuarios.
                  </p>
                </div>
              </div>

              <Button
                onPress={() => router.push("/admin/users")}
                size="sm"
                endContent={<ArrowRight size={14} />}
                className="font-display font-semibold text-xs"
                style={{ background: "var(--accent)", color: "#ffffff" }}
              >
                Administrar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── PESTAÑA 2: MI PERFIL (PROFILE VIEW) ───────────────────────────── */}
      {activeTab === "perfil" && (
        <div className="space-y-6 animate-fade-in">
          <section>
            <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-2">
              Mi Perfil
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-950 mb-6">
              Detalles de la cuenta
            </h1>

            {/* Tarjeta de detalles de perfil con glassmorphism */}
            <div className="glass p-8 space-y-6 max-w-2xl bg-white/80 border-slate-200">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-900/[0.06]">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-3xl flex-shrink-0"
                  style={{
                    background: isAdmin ? "rgba(14, 165, 233, 0.08)" : "var(--bg-raised)",
                    border: `1px solid ${isAdmin ? "rgba(14, 165, 233, 0.15)" : "var(--border)"}`,
                    color: isAdmin ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {initials}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="font-display text-xl font-bold text-slate-950">{user.nombre}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm text-slate-500 font-mono">{user.email}</span>
                    <Chip size="sm" variant="dot" color={isAdmin ? "secondary" : "default"}>
                      {isAdmin ? "Administrador" : "Usuario"}
                    </Chip>
                  </div>
                </div>
              </div>

              {/* Grid de campos del perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase text-slate-400">Cédula / Identificación</span>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{user.cc}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase text-slate-400">Rol asignado</span>
                  <p className="text-sm font-semibold text-slate-900">
                    {user.role === "admin" ? "Administrador del sistema" : "Usuario estándar"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase text-slate-400">Correo Electrónico</span>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase text-slate-400">Identificador de Usuario (ID)</span>
                  <p className="text-sm text-slate-500 font-mono text-xs truncate" title={user.id}>{user.id}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
