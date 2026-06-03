/**
 * Servicio encargado de procesar la autenticación de usuarios.
 */
export const authService = {
  login: async (email: string, password: string) => {
    // Realizamos la petición POST al endpoint de nuestra API
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Si la respuesta es negativa, lanzamos un error con el mensaje del backend
    if (!response.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    // Retorna los datos del usuario y su token JWT
    return data;
  },
};