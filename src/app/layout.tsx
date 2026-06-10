// app/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The root layout wraps EVERY page in the app.
// In Next.js App Router, layout.tsx is rendered once and persists across
// navigations — it's a great place for providers and global UI.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next"
import "@/app/globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "User Manager",
  description: "Manage users with role-based access control",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="en" helps screen readers and SEO
    <html lang="en">
      {/*
        The "dark" class on <html> activates Tailwind's dark: variants and
        HeroUI's dark theme across the entire app.
      */}
      <body className="noise-bg grid-bg min-h-screen">
        {/*
          Providers wraps children with HeroUI's NextUIProvider (which injects
          design tokens and motion context) — see providers.tsx.
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
