// hooks/useUsers.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook personalizado de React para encapsular todo el estado y CRUD de usuarios.
//
// ¿POR QUÉ SE USA ESTE HOOK?
//   Este hook actúa como el "controlador" para la vista de administración (/admin/users).
//   Mantiene la lista de usuarios en memoria (React state) y expone funciones para crear,
//   actualizar y eliminar usuarios llamando al servicio `userService` que interactúa con la API.
//   Esto hace que la página principal sea muy "delgada" y fácil de mantener.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Indica que este hook se ejecuta exclusivamente en el navegador

import { useState, useEffect, useCallback } from "react"
import { userService, UserPayload } from "@/services/userService" // Capa de servicios para peticiones HTTP

// Definición de la interfaz del usuario en el frontend (sin el campo password)
export interface User {
  _id: string
  nombre: string
  cc: string
  email: string
  role: "user" | "admin"
  createdAt: string
}

// Recibe la cabecera de autenticación que useAuth nos provee automáticamente
export function useUsers(authHeader: Record<string, string>) {
  // Estados para almacenar la lista de usuarios, el estado de carga y posibles errores
  const [users, setUsers]       = useState<User[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  // ── Obtener todos los usuarios ──────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true) // Iniciamos spinner
    setError(null)    // Limpiamos errores previos
    try {
      // Llamamos a la capa de servicios para traer la lista de usuarios
      const data = await userService.getUsers(authHeader)
      setUsers(data) // Guardamos en el estado
    } catch (err) {
      // Si ocurre un error, guardamos el mensaje para mostrarlo en la interfaz
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false) // Apagamos spinner
    }
  }, [authHeader])

  // Se ejecuta al montar y cada vez que cambia la cabecera de autenticación (el token)
  useEffect(() => {
    if (authHeader.Authorization) fetchUsers()
  }, [fetchUsers, authHeader])

  // ── Crear Usuario ───────────────────────────────────────────────────────────
  const createUser = useCallback(async (payload: UserPayload) => {
    // Llama al servicio para registrar al usuario en la base de datos (MongoDB)
    const newUser = await userService.createUser(payload, authHeader)
    
    // Actualización optimista: agregamos el nuevo usuario al principio de la lista
    setUsers((prev) => [newUser, ...prev])
    return newUser
  }, [authHeader])

  // ── Actualizar Usuario ────────────────────────────────────────────────────────
  const updateUser = useCallback(async (id: string, payload: Partial<UserPayload>) => {
    // Llama al servicio para actualizar los datos en MongoDB
    const updated = await userService.updateUser(id, payload, authHeader)
    
    // Reemplazamos el registro modificado en el estado local de React sin hacer re-fetch completo
    setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)))
    return updated
  }, [authHeader])

  // ── Eliminar Usuario ──────────────────────────────────────────────────────────
  const deleteUser = useCallback(async (id: string) => {
    // Llama al servicio para borrar el registro de MongoDB
    await userService.deleteUser(id, authHeader)
    
    // Filtramos la lista local de React para quitar al usuario eliminado instantáneamente
    setUsers((prev) => prev.filter((u) => u._id !== id))
  }, [authHeader])

  // ── Enviar Correo de Bienvenida Manual ─────────────────────────────────────────
  const sendWelcomeEmail = useCallback(async (id: string) => {
    return await userService.sendWelcomeEmail(id, authHeader)
  }, [authHeader])

  return { users, isLoading, error, fetchUsers, createUser, updateUser, deleteUser, sendWelcomeEmail }
}
