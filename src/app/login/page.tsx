// app/login/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Página de Autenticación (/login) — Permite iniciar sesión y registrarse.
//
// ¿CÓMO SE INTEGRA EN EL FLUJO DE LA APLICACIÓN?
//   - Al ingresar el email y contraseña y presionar "Iniciar sesión", se valida contra MongoDB.
//   - Al registrarse, se ingresa Nombre, Cédula (cc), Email y Contraseña (con medidor de fuerza).
//   - Utiliza el hook `useAuth` para encapsular la autenticación e interactuar con la DB.
//   - El estado de la sesión se guarda localmente y se usa `useRouter` de Next.js para redirigir.
//   - Si el usuario ya está autenticado, se le redirige automáticamente al `/dashboard`.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Obligatorio para ejecutar código cliente (hooks, estado de React)

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select, SelectItem } from "@heroui/react" // Importación limpia de componentes HeroUI
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Hash } from "lucide-react" // Iconos limpios en lugar de emojis
import { useAuth } from "@/hooks/useAuth" // Custom hook que maneja la sesión
import { PasswordStrengthBar } from "@/components/PasswordStrengthBar" // Barra de seguridad

export default function LoginPage() {
  const router = useRouter() // Instancia del router para redirecciones cliente
  const { login, register, isLoading, isAuthenticated } = useAuth() // Acciones y estados provistos por el custom hook

  // Alterna entre la pestaña de "login" (iniciar sesión) y "register" (crear cuenta)
  const [mode, setMode] = useState<"login" | "register">("login")

  // ── Estados para campos compartidos (Login y Registro) ─────────────────────
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw]   = useState(false) // Controla si la contraseña se lee en texto claro

  // ── Estados para campos exclusivos de Registro ──────────────────────────────
  const [nombre,  setNombre]  = useState("")
  const [cc,      setCc]      = useState("")
  const [role,    setRole]    = useState<"user" | "admin">("user") // Selector de rol para la cuenta

  const [submitting, setSubmitting] = useState(false) // Spinner de carga mientras responde el servidor
  const [error,      setError]      = useState<string | null>(null) // Muestra errores de credenciales o de la API

  // Protección del login: Si el usuario ya está logueado, lo mandamos directo al dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard")
  }, [isLoading, isAuthenticated, router])

  // Manejo de envío del formulario (Login o Registro)
  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      if (mode === "login") {
        // Ejecuta login llamando al servicio y guardando localStorage
        await login(email, password)
      } else {
        // En modo registro, validamos primero que los campos obligatorios estén llenos
        if (!nombre || !cc) {
          setError("Todos los campos son obligatorios")
          return
        }
        // Registramos al usuario, guardamos sesión y redirigimos
        await register({ nombre, cc, email, password, role })
      }
    } catch (err) {
      // Capturamos errores de credenciales o validación
      setError(err instanceof Error ? err.message : "Algo salió mal")
    } finally {
      setSubmitting(false)
    }
  }

  // Permite enviar el formulario presionando la tecla Enter dentro de cualquier Input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit()
  }

  // Mientras se recupera el token de localStorage en el montaje, mostramos una pantalla de carga neutra
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f1f5f9]">

      {/* Luces decorativas de fondo (Glow radial blobs) para estilo premium */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="w-full max-w-md relative z-10">

        {/* Marca/Logotipo superior */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 overflow-hidden shadow-md border border-slate-200 glow-accent"
          >
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "login" ? "Inicia sesión en tu cuenta" : "Crea una cuenta nueva"}
          </p>
        </div>

        {/* Tarjeta principal con estilo Glassmorphism */}
        <div className="glass p-8 animate-fade-up delay-1 bg-white/80 border-slate-200">

          {/* Selector de pestañas (Tabs): Iniciar Sesión / Registrarse */}
          <div
            className="flex rounded-xl p-1 mb-7 bg-slate-100/80"
            style={{ border: "1px solid var(--border)" }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-display font-medium transition-all duration-200"
                style={{
                  background: mode === m ? "var(--bg-overlay)" : "transparent",
                  color:      mode === m ? "var(--text-primary)" : "var(--text-muted)",
                  border:     mode === m ? "1px solid var(--border-mid)" : "1px solid transparent",
                  boxShadow:  mode === m ? "0 4px 12px -2px rgba(15, 23, 42, 0.05)" : "none",
                }}
              >
                {m === "login" ? "Ingresar" : "Registrarse"}
              </button>
            ))}
          </div>

          {/* Banner de error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 animate-fade-in bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4" onKeyDown={handleKeyDown}>

            {/* Campos exclusivos del modo registro */}
            {mode === "register" && (
              <>
                {/* Nombre completo */}
                <Input
                  type="text"
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  value={nombre}
                  onValueChange={setNombre}
                  variant="bordered"
                  startContent={<User size={15} className="text-slate-400 flex-shrink-0" />}
                  classNames={{ input: "text-slate-900 text-sm", label: "text-slate-500 text-sm" }}
                />
                {/* Número de Cédula (Identificación) */}
                <Input
                  type="text"
                  label="Número de Cédula / Identificación"
                  placeholder="1234567890"
                  value={cc}
                  onValueChange={setCc}
                  variant="bordered"
                  startContent={<Hash size={15} className="text-slate-400 flex-shrink-0" />}
                  classNames={{ input: "text-slate-900 font-mono text-sm", label: "text-slate-500 text-sm" }}
                />
              </>
            )}

            {/* Entrada del correo electrónico (Compartida) */}
            <Input
              type="email"
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={email}
              onValueChange={setEmail}
              variant="bordered"
              startContent={<Mail size={15} className="text-slate-400 flex-shrink-0" />}
              classNames={{ input: "text-slate-900 font-mono text-sm", label: "text-slate-500 text-sm" }}
            />

            {/* Entrada de la contraseña (Compartida) */}
            <div>
              <Input
                type={showPw ? "text" : "password"}
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                startContent={<Lock size={15} className="text-slate-400 flex-shrink-0" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                classNames={{ input: "text-slate-900 font-mono", label: "text-slate-500 text-sm" }}
              />
              {/* Barra de seguridad de contraseña (Solo en registro) */}
              {mode === "register" && <PasswordStrengthBar password={password} />}
            </div>

            {/* Selector de Rol (Solo en registro) */}
            {mode === "register" && (
              <Select
                label="Rol de usuario"
                selectedKeys={[role]}
                onSelectionChange={(keys) => setRole([...keys][0] as "user" | "admin")}
                variant="bordered"
                classNames={{ trigger: "text-slate-900 text-sm", label: "text-slate-500 text-sm" }}
              >
                <SelectItem key="user" textValue="Usuario Estándar">Usuario Estándar</SelectItem>
                <SelectItem key="admin" textValue="Administrador">Administrador</SelectItem>
              </Select>
            )}

          </div>

          {/* Botón de envío */}
          <Button
            isLoading={submitting}
            onPress={handleSubmit}
            fullWidth
            size="lg"
            endContent={!submitting && <ArrowRight size={16} />}
            className="mt-7 font-display font-semibold tracking-wide text-sm"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            {mode === "login" ? "Iniciar Sesión" : "Crear cuenta"}
          </Button>

        </div>

        {/* Nota informativa en el pie de página */}
        <p className="text-center text-xs text-slate-500 mt-6 animate-fade-up delay-2">
          Tu sesión está protegida con encriptación JWT.
        </p>

      </div>
    </main>
  )
}
