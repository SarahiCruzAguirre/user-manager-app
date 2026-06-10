// hooks/usePasswordStrength.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook personalizado de React para evaluar la fortaleza de la contraseña en tiempo real.
//
// ¿CÓMO FUNCIONA?
//   Utiliza la librería 'zxcvbn' desarrollada por Dropbox. A diferencia de reglas
//   simples e ineficaces como "debe tener 1 mayúscula y 1 número", zxcvbn:
//     - Compara contra una base de datos de 30,000 contraseñas comunes.
//     - Detecta patrones lógicos de teclado (como "qwerty", "123456").
//     - Identifica sustituciones comunes tipo l33tspeak (como usar "3" en lugar de "E").
//     - Retorna una puntuación de 0 a 4 y consejos sugeridos en lenguaje natural.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Indica que este hook se ejecuta exclusivamente en el cliente

import { useMemo } from "react"
import zxcvbn from "zxcvbn" // Librería de estimación realista de contraseñas

// Estructura de niveles para mapear la puntuación numérica a etiquetas y colores visuales
const LEVELS = [
  { label: "Muy débil",   color: "#ef4444", tailwind: "bg-red-500"    }, // Puntuación 0
  { label: "Débil",       color: "#f97316", tailwind: "bg-orange-500" }, // Puntuación 1
  { label: "Aceptable",   color: "#eab308", tailwind: "bg-yellow-500" }, // Puntuación 2
  { label: "Buena",       color: "#22c55e", tailwind: "bg-green-500"  }, // Puntuación 3
  { label: "Fuerte",      color: "#a3e635", tailwind: "bg-lime-400"   }, // Puntuación 4
] as const

// Diccionario para traducir las sugerencias de la librería zxcvbn al español
const SUGGESTIONS_MAP: Record<string, string> = {
  "Add another word or two. Uncommon words are better.": "Añade una o dos palabras más. Las palabras poco comunes son mejores.",
  "Predictable patterns make it easy to guess.": "Los patrones predecibles son fáciles de adivinar.",
  "Capitalization doesn't help very much.": "Las mayúsculas no ayudan mucho.",
  "Numbers don't help very much.": "Los números no ayudan mucho.",
  "Symbols don't help very much.": "Los símbolos no ayudan mucho.",
  "Avoid sequences.": "Evita secuencias lógicas o caracteres ordenados.",
  "Avoid recent years.": "Evita años recientes.",
  "Avoid dates and years that are associated with you.": "Evita fechas y años asociados contigo.",
  "Avoid repeat characters.": "Evita la repetición de caracteres seguidos.",
  "Avoid keyboard patterns.": "Evita patrones de teclado comunes (ej: qwerty).",
  "Avoid words that are easy to guess.": "Evita palabras fáciles de adivinar.",
  "Avoid common names or surnames.": "Evita nombres o apellidos comunes.",
  "Avoid names or surnames that are associated with you.": "Evita nombres o apellidos asociados contigo.",
  "Avoid dates and times that are associated with you.": "Evita fechas y horas asociadas contigo.",
  "Use a longer keyboard pattern with more turns.": "Usa un patrón de teclado más largo con más cambios de dirección.",
  "Avoid common words.": "Evita palabras de uso común.",
  "Avoid strings of digits.": "Evita series de números consecutivos.",
  "Avoid words that are associated with you.": "Evita palabras que se relacionen contigo."
}

export function usePasswordStrength(password: string) {
  // useMemo optimiza el rendimiento evitando re-calcular zxcvbn si la contraseña no ha cambiado.
  // zxcvbn es pesado porque carga diccionarios en memoria; useMemo es crucial aquí.
  return useMemo(() => {
    // Si no hay contraseña ingresada, retornamos valores por defecto vacíos
    if (!password) {
      return { score: -1, label: "", color: "", tailwind: "", feedback: [], percentage: 0 }
    }

    // Evaluamos la contraseña actual
    const result = zxcvbn(password)
    const level  = LEVELS[result.score] // Obtenemos el nivel basado en la puntuación (0-4)

    // Traducimos las sugerencias al español usando el diccionario
    const translatedSuggestions = result.feedback.suggestions.map(
      (s) => SUGGESTIONS_MAP[s] || SUGGESTIONS_MAP[s.trim()] || s
    )

    return {
      score:      result.score,        // 0 = terrible, 4 = excelente
      label:      level.label,         // Etiqueta legible en español
      color:      level.color,         // Color en formato hexadecimal para CSS inline
      tailwind:   level.tailwind,      // Clase de Tailwind CSS correspondiente
      
      // Retorna las sugerencias traducidas
      feedback:   translatedSuggestions,
      
      // Porcentaje de progreso de 1 a 100 para la barra de fuerza
      percentage: ((result.score + 1) / 5) * 100,
    }
  }, [password])
}
