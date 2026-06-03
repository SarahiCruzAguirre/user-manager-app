"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando sesión con:", { email, password });
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 🌌 Orbes decorativos de fondo (clases de tu globals.css) */}
      <div className="glow-top"></div>
      <div className="glow-bottom"></div>

      {/* 💳 Tarjeta con diseño Glassmorphism */}
      <div className="glass-card w-full max-w-[420px] p-8 text-center backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-2xl relative z-10">
        
        {/* Encabezado */}
        <div className="mb-8">
          <span className="text-[11px] font-medium text-purple-400 uppercase tracking-[2px] block mb-2">
            ✦ Nexus System Auth ✦
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-sm font-light text-slate-400 mt-2">
            Introduce tus credenciales para acceder al panel de control.
          </p>
        </div>

        {/* Formulario Estilizado y Corregido */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          {/* Campo: Correo Electrónico */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@nexus.com"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all block"
            />
          </div>

          {/* Campo: Contraseña */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all block"
            />
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            className="w-full mt-2 px-4 py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer shadow-lg block text-center"
          >
            Autenticar Cuenta
          </button>

        </form>

        {/* Enlace de retorno protegido para evitar errores de hidratación */}
        <div className="mt-6">
          <Link 
            href="/" 
            className="text-xs text-zinc-400 hover:text-white transition-colors no-underline inline-block"
          >
            {"← Volver a la página principal"}
          </Link>
        </div>

      </div>
    </div>
  );
}