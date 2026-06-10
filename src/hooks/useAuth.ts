// hooks/useAuth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook personalizado de React para centralizar todo el estado y lógica de autenticación.
//
// ¿POR QUÉ UN CUSTOM HOOK?
//   Sin este hook, cada componente que necesitara saber quién es el usuario logueado
//   tendría que duplicar la lógica de acceder a localStorage, parsear el JSON y manejar
//   errores. Agrupándolo aquí, se escribe y valida una sola vez.
//
// ¿CÓMO SE CONECTA CON LA ARQUITECTURA?
//   - Llama a `authService` (capa de servicios) para comunicarse con la API de backend.
//   - Almacena el usuario y el token JWT en el estado de React y en `localStorage`.
//   - Redirige al usuario usando `useRouter` de Next.js.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Indica que este hook se ejecuta exclusivamente en el cliente (navegador)

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService" // Capa de servicios para peticiones de autenticación

// Definición del objeto de usuario que guardaremos en la sesión
export interface AuthUser {
  id: string
  nombre: string
  email: string
  role: "user" | "admin"
  cc: string
}

// Estructura de retorno que expone este hook a los componentes
interface UseAuthReturn {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authHeader: { Authorization: string } | {}
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

// Datos requeridos para registrar un nuevo usuario
interface RegisterData {
  nombre: string
  cc: string
  email: string
  password: string
  role: "user" | "admin"
}

// Constantes para las llaves de localStorage, evitando errores tipográficos
const STORAGE_KEY_USER  = "um_user"
const STORAGE_KEY_TOKEN = "um_token"

export function useAuth(): UseAuthReturn {
  const router = useRouter() // Manejador de rutas para redirecciones seguras en el cliente

  // Estados locales para almacenar el usuario actual y el token JWT
  const [user, setUser]   = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  
  // isLoading inicia en true para indicar que estamos leyendo del almacenamiento persistente
  const [isLoading, setIsLoading] = useState(true)

  // ── Bootstrap (Inicialización) ──────────────────────────────────────────────
  // Se ejecuta una sola vez al montar el hook en el cliente.
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem(STORAGE_KEY_USER)
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)

      // Si tenemos sesión guardada, la cargamos al estado local
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      }
    } catch {
      // Si el JSON está corrupto o el acceso está bloqueado, limpiamos las llaves
      localStorage.removeItem(STORAGE_KEY_USER)
      localStorage.removeItem(STORAGE_KEY_TOKEN)
    } finally {
      // Indicamos que la inicialización ha finalizado
      setIsLoading(false)
    }
  }, [])

  // ── Funciones de Persistencia ────────────────────────────────────────────────
  // Guarda los datos en localStorage y actualiza el estado de React en paralelo
  const persist = useCallback((u: AuthUser, t: string) => {
    localStorage.setItem(STORAGE_KEY_USER,  JSON.stringify(u))
    localStorage.setItem(STORAGE_KEY_TOKEN, t)
    setUser(u)
    setToken(t)
  }, [])

  // Borra la sesión de localStorage y limpia los estados correspondientes
  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    setUser(null)
    setToken(null)
  }, [])

  // ── Acciones de Autenticación ────────────────────────────────────────────────
  
  // Inicio de sesión: llama a la capa de servicios y luego guarda la sesión
  const login = useCallback(async (email: string, password: string) => {
    // LLAMADA A LA CAPA DE SERVICIOS (No fetch directo en vistas/hooks de UI)
    const data = await authService.login(email, password)
    
    // Persistimos el usuario y token devueltos
    persist(data.user, data.token)
    
    // Redirigimos al panel principal protegido
    router.push("/dashboard")
  }, [persist, router])

  // Registro de usuarios: llama al servicio de registro, inicia sesión y redirige
  const register = useCallback(async (formData: RegisterData) => {
    // LLAMADA A LA CAPA DE SERVICIOS
    const data = await authService.register(formData)
    
    // Persistimos la nueva sesión creada automáticamente tras registrarse
    persist(data.user, data.token)
    
    // Redirigimos al panel principal
    router.push("/dashboard")
  }, [persist, router])

  // Cierre de sesión: limpia el almacenamiento local y redirige a la vista de login
  const logout = useCallback(() => {
    clear()
    router.push("/login")
  }, [clear, router])

  // ── Valores derivados ────────────────────────────────────────────────────────
  // Retorna un objeto con la cabecera de autenticación lista para inyectar en llamadas fetch
  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token])

  return {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    authHeader,
    login,
    register,
    logout,
  }
}
