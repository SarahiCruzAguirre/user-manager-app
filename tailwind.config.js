import { heroui } from "@heroui/react"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    // HeroUI needs to scan its own components so the classes are included in the build
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom font families — we import them in globals.css via @import
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    // heroui() registers all the HeroUI component classes and the design token CSS variables
    heroui({
      themes: {
        light: {
          colors: {
            // Custom branding colors for our light futuristic theme
            primary: {
              DEFAULT: "#0ea5e9",     // Azul Blondie (Sky 500)
              foreground: "#ffffff",
            },
            background: "#f1f5f9",   // Slate 100
            foreground: "#09090b",   // Zinc 950
            focus: "#0ea5e9",
          },
        },
      },
    }),
  ],
}

export default config