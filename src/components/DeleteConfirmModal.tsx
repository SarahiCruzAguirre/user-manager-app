// components/DeleteConfirmModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal de confirmación para eliminar un usuario de forma segura.
//
// ¿CÓMO SE INTEGRA EN EL PROYECTO?
//   - Se abre desde la vista de administración (/admin/users) cuando se presiona la caneca.
//   - Al presionar 'Confirmar', ejecuta la callback `onConfirm` para llamar a deleteUser.
// ─────────────────────────────────────────────────────────────────────────────

"use client" // Habilita comportamiento reactivo en el cliente

import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react" // Modales oficiales de HeroUI
import { AlertTriangle } from "lucide-react" // Icono de advertencia en lugar de emojis estándar

interface Props {
  isOpen:    boolean
  onClose:   () => void // Cierra el modal sin ejecutar acciones
  onConfirm: () => Promise<void> // Callback asíncrona para confirmar la eliminación
  userName:  string // Nombre del usuario que se va a eliminar
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName }: Props) {
  const [loading, setLoading] = useState(false) // Estado de carga para el botón de confirmación

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm() // Ejecutamos la función de borrado
      onClose() // Cerramos el modal tras la ejecución correcta
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose() }}
      size="sm"
      classNames={{
        base:   "bg-white border border-slate-200 shadow-2xl",
        header: "border-b border-slate-100",
        footer: "border-t border-slate-100",
      }}
    >
      <ModalContent>
        {/* Cabecera del modal con advertencia */}
        <ModalHeader>
          <div className="flex items-center gap-3">
            {/* Contenedor del icono de advertencia */}
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-slate-400">Confirmar eliminación</p>
              <h2 className="font-display text-base font-semibold text-slate-950">Eliminar usuario</h2>
            </div>
          </div>
        </ModalHeader>

        {/* Cuerpo del modal mostrando el nombre del usuario */}
        <ModalBody className="py-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar permanentemente a{" "}
            <span className="text-slate-950 font-semibold">{userName}</span>?
            Esta acción no se puede deshacer.
          </p>
        </ModalBody>

        {/* Botones de confirmar o cancelar */}
        <ModalFooter>
          <Button variant="flat" onPress={onClose} className="text-slate-500 hover:text-slate-800">
            Cancelar
          </Button>
          <Button
            isLoading={loading}
            onPress={handleConfirm}
            className="font-display font-semibold bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
