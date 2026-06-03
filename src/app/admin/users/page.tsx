"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { UserCard } from "@/components/UserCard";
import { ArrowLeft, UserPlus, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  // Aseguramos que el usuario esté logueado Y sea admin strictly (requireAuth=true, requireAdmin=true)
  const { loading: authLoading } = useAuth(true, true);
  const { users, loading: usersLoading, addUser, editUser, removeUser } = useUsers();

  // Estados locales para el control del formulario del CRUD
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cc: "", email: "", password: "", role: "user" });
  const [formError, setFormError] = useState<string | null>(null);

  if (authLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm font-mono tracking-widest text-neutral-500">
        SINCRONIZANDO REGISTROS DE SEGURIDAD...
      </div>
    );
  }

  const handleEditClick = (user: unknown) => {
    setIsEditing(true);
    setCurrentId(user._id);
    setForm({ nombre: user.nombre, cc: user.cc, email: user.email, password: "", role: user.role });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (isEditing && currentId) {
        await editUser(currentId, form);
      } else {
        await addUser(form);
      }
      // Limpieza y reinicio de estado del formulario
      setForm({ nombre: "", cc: "", email: "", password: "", role: "user" });
      setIsEditing(false);
      setCurrentId(null);
    } catch (err: unknown) {
      setFormError(err.message || "Error al procesar la acción en el formulario");
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("¿Estás completamente seguro de eliminar este usuario del sistema?")) {
      try {
        await removeUser(id);
      } catch (err: unknown) {
        alert(err.message || "No se pudo realizar la eliminación");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Barra de Navegación Retorno */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-all">
            <ArrowLeft size={14} /> Volver al Dashboard
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-white/5 border border-white/5 text-neutral-300 font-mono">
            <Users size={12} /> Total cuentas: {users.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Columna Izquierda: Formulario Dinámico (Crear / Editar) */}
          <div className="backdrop-blur-xl bg-neutral-900/40 rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
              {isEditing ? <Sparkles size={16} className="text-blue-400" /> : <UserPlus size={16} />}
              <h3>{isEditing ? "Modificar Perfil" : "Registrar Nuevo Perfil"}</h3>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <input
                type="text"
                placeholder="Nombre Completo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-all"
                required
              />
              <input
                type="text"
                placeholder="Número de Cédula (CC)"
                value={form.cc}
                onChange={(e) => setForm({ ...form, cc: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-all"
                required
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-all"
                required
              />
              <input
                type="password"
                placeholder={isEditing ? "Contraseña (Vacío para conservar)" : "Contraseña de Acceso"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-all"
                required={!isEditing}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all"
              >
                <option value="user">Usuario Común (User)</option>
                <option value="admin">Administrador Central (Admin)</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all"
                >
                  {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({ nombre: "", cc: "", email: "", password: "", role: "user" });
                    }}
                    className="px-4 py-2.5 bg-white/5 border border-white/5 text-neutral-400 rounded-xl text-xs hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Columna Derecha: Listado de Usuarios mediante Componente Reutilizable */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Cuentas Registradas</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Control y asignación de credenciales del ecosistema.</p>
            </div>

            {users.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/[0.01] border border-white/5 text-neutral-500 text-sm">
                No hay usuarios registrados. ¡Crea el primero usando el panel lateral!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {users.map((item) => (
                  <UserCard
                    key={item._id}
                    nombre={item.nombre}
                    cc={item.cc}
                    email={item.email}
                    role={item.role}
                    onEdit={() => handleEditClick(item)}
                    onDelete={() => handleDeleteClick(item._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}