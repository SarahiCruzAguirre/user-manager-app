import type { Metadata } from "next";
import React from "react";
// Importamos tu archivo CSS con la "s" al final para que cargue Tailwind y tus efectos
import "./globals.css"; 

export const metadata: Metadata = {
  title: "Nexus | User Management System",
  description: "Sistema premium de gestión de usuarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#0a0a0c] text-slate-200 min-h-screen antialiased selection:bg-purple-500/30">
        {/* Aquí se inyectarán de forma dinámica todas tus páginas (como el /login) */}
        {children}
      </body>
    </html>
  );
}