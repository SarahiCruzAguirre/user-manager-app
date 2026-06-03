import React from "react";
import { ShieldAlert, User as UserIcon, Mail, CreditCard, Pencil, Trash2 } from "lucide-react";

// Definimos la interfaz de props obligatorias tipadas de forma estricta
interface UserCardProps {
  nombre: string;
  cc: string;
  email: string;
  role: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  nombre,
  cc,
  email,
  role,
  onEdit,
  onDelete,
}) => {
  // Evaluamos condicionalmente el estilo de borde e iluminación según el rol asignado
  const isAdmin = role === "admin";
  
  return (
    <div
      className={`relative overflow-hidden backdrop-blur-xl bg-neutral-900/40 rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
        isAdmin 
          ? "border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]" 
          : "border-white/5 shadow-lg"
      }`}
    >
      {/* Indicador visual de rol flotante en la esquina superior derecha */}
      <div className="absolute top-4 right-4">
        {isAdmin ? (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldAlert size={12} /> Admin
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-white/5 text-neutral-400 border border-white/5">
            <UserIcon size={12} /> User
          </span>
        )}
      </div>

      {/* Contenido Principal de Información */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight leading-snug">{nombre}</h4>
          <span className="text-xs text-neutral-500 block mt-0.5">ID Único de Sistema</span>
        </div>

        <div className="space-y-2.5 text-sm text-neutral-300">
          <div className="flex items-center gap-2.5">
            <Mail size={15} className="text-neutral-500" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CreditCard size={15} className="text-neutral-500" />
            <span className="font-mono text-xs tracking-wider">{cc}</span>
          </div>
        </div>

        {/* Panel de Botones de Control Inferiores */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5 mt-2">
          <button
            onClick={onEdit}
            className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
            title="Editar Información"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
            title="Eliminar Usuario"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};