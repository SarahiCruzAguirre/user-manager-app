/**
 * Servicio encargado de gestionar las operaciones CRUD de los usuarios.
 */
export const userService = {
  // Obtener todos los usuarios registrados
  getUsers: async () => {
    const response = await fetch("/api/users", { method: "GET" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al obtener usuarios");
    return data;
  },

  // Registrar o crear un nuevo usuario (dispara el email en el servidor)
  createUser: async (userData: unknown) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al crear usuario");
    return data;
  },

  // Actualizar la información de un usuario específico mediante su ID único de MongoDB
  updateUser: async (id: string, userData: unknown) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al actualizar usuario");
    return data;
  },

  // Eliminar permanentemente un usuario de la base de datos
  deleteUser: async (id: string) => {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al eliminar usuario");
    return data;
  },
};