import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export function useAuth(requireAuth = true, requireAdmin = false) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Comprobamos la existencia de una sesión activa guardada en el almacenamiento local
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // Si la ruta requiere estar logueado y no hay sesión, mandamos a login
      if (requireAuth) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Si la ruta requiere privilegios de administrador y el usuario actual no lo es
      if (requireAdmin && parsedUser.role !== "admin") {
        router.push("/dashboard"); // Redirección automática de seguridad
      } else {
        setLoading(false);
      }
    }
  }, [router, requireAuth, requireAdmin]);

  // Función ejecutada al enviar el formulario de Login
  const loginUser = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      // Almacenamos el perfil y el token de sesión devueltos de forma persistente
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setUser(data.user);
      router.push("/dashboard"); // Redirección al panel principal inmediato
    } catch (err: unknown) {
      setError(err.message || "Credenciales incorrectas");
      throw err;
    }
  };

  // Limpieza completa del entorno al cerrar sesión
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, error, loginUser, logoutUser };
}