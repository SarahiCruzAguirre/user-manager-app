// app/providers.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Proveedor global para los componentes de HeroUI (antes NextUI).
//
// ¿POR QUÉ ESTÁ EN UN ARCHIVO SEPARADO?
//   En el App Router de Next.js, el archivo root layout.tsx es un Server Component
//   por defecto. Sin embargo, HeroUIProvider requiere ejecutarse en el CLIENTE
//   (navegador) para manejar eventos de teclado, foco, animaciones y temas.
//   Por ello, creamos este wrapper marcado con "use client" y lo importamos en layout.tsx.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Habilita el contexto de cliente en Next.js para este archivo

import { HeroUIProvider } from "@heroui/react" // Importamos el proveedor oficial de HeroUI
import { useRouter } from "next/navigation" // Hook de Next.js para manejar navegación cliente

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter() // Instanciamos el router de Next.js

  return (
    /*
      El prop 'navigate' le dice a HeroUI cómo hacer la navegación interna de botones
      y enlaces (Links). Pasándole 'router.push', logramos que las transiciones de página
      usen la navegación SPA rápida de Next.js en lugar de recargar la pestaña entera.
    */
    <HeroUIProvider navigate={router.push}>
      {children}
    </HeroUIProvider>
  )
}
