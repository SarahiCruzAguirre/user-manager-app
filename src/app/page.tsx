// app/page.tsx
// The root URL (/) redirects to /login.
// redirect() is a Next.js server-side utility — no client JS needed.

import { redirect } from "next/navigation"

export default function Home() {
  redirect("/login")
}
