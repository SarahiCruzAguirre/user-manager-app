// components/PasswordStrengthBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Componente de interfaz visual para mostrar la fortaleza de la contraseña en segmentos.
//
// ¿CÓMO SE INTEGRA EN EL PROYECTO?
//   - Se utiliza dentro de `UserFormModal` y en el formulario de registro de `LoginPage`.
//   - Llama internamente al hook personalizado `usePasswordStrength`.
//   - Renderiza una barra dividida en 5 segmentos que se pintan según la fortaleza (0 a 4).
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Habilita comportamiento reactivo en el cliente

import { usePasswordStrength } from "@/hooks/usePasswordStrength" // Hook de fortaleza de contraseña

interface Props {
  password: string
  showFeedback?: boolean // Determina si se imprimen consejos adicionales debajo de la barra
}

export function PasswordStrengthBar({ password, showFeedback = true }: Props) {
  // Obtenemos los valores evaluados a partir de la contraseña escrita
  const { score, label, feedback, percentage } = usePasswordStrength(password)

  // Si la contraseña está vacía, no renderizamos nada en pantalla
  if (!password) return null

  return (
    <div className="mt-2 space-y-2 animate-fade-in">

      {/* Fila con la barra dividida en 5 segmentos */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              // Pintamos el segmento con el color de acento si su índice es menor o igual a la puntuación
              background: i <= score
                ? `var(--accent)` // Color de acento de la aplicación (azul blondie)
                : "rgba(15, 23, 42, 0.06)", // Fondo neutro apagado para los segmentos vacíos en tema claro
              
              // Aplicamos opacidad progresiva sutil
              opacity: i <= score ? 1 - (score - i) * 0.12 : 1,
            }}
          />
        ))}
      </div>

      {/* Etiquetas e indicador numérico en porcentaje */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium" style={{ color: "var(--accent)" }}>
          {label} {/* Ejemplo: "Muy débil", "Aceptable", "Fuerte" */}
        </span>
        <span className="text-xs text-gray-600 font-mono">{Math.round(percentage)}%</span>
      </div>

      {/* Recomendación adicional provista por zxcvbn en inglés */}
      {showFeedback && feedback.length > 0 && (
        <p className="text-xs text-gray-500 leading-relaxed">
          {feedback[0]}
        </p>
      )}
    </div>
  )
}
