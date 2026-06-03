"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, Settings, ShieldCheck, Mail, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Solicitamos protección de ruta básica (requireAuth = true)
  const { user, loading, logoutUser } = useAuth(true, false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm font-mono tracking-widest text-neutral-500">
        CARGANDO IDENTIDAD...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Cabecera del Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panel de Control General</h1>
            <p className="text-sm text-neutral-400 mt-1">Bienvenido de vuelta a tu espacio centralizado.</p>
          </div>
          <button
            onClick={logoutUser}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/25 transition-all self-start sm:self-center"
          >
            <LogOut size={15} /> Cerrar Sesión
          </button>
        </div>

        {/* Tarjeta Flotante de Información de Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 backdrop-blur-xl bg-neutral-900/40 rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-lg">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.nombre}</h3>
                <span className="text-xs text-neutral-400 font-mono">UUID: {user?.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm text-neutral-300">
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <Mail size={16} className="text-neutral-500" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <ShieldCheck size={16} className="text-neutral-500" />
                <span className="capitalize">Rol actual: {user?.role}</span>
              </div>
            </div>
          </div>

          {/* Menú de Accesos Rápidos Condicionales */}
          <div className="backdrop-blur-xl bg-neutral-900/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold tracking-wider text-neutral-400 uppercase text-xs mb-3">Acciones Disponibles</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Dependiendo de tus permisos asignados, podrás realizar modificaciones estructurales del sistema.
              </p>
            </div>

            {user?.role === "admin" ? (
              <Link
                href="/admin/users"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200 transition-all shadow-md shadow-white/5"
              >
                <Settings size={14} /> Administrar Usuarios
              </Link>
            ) : (
              <div className="p-3 bg-neutral-800/30 border border-white/5 rounded-xl text-[11px] text-neutral-400 text-center font-medium">
                🔒 Panel de administración restringido
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}