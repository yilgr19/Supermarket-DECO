// ES: Diálogo de confirmación (Radix AlertDialog + estilos Tailwind)
// EN: Confirmation dialog (Radix AlertDialog + Tailwind)

import * as AlertDialog from '@radix-ui/react-alert-dialog'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  cancelLabel?: string
  confirmLabel?: string
  onConfirm: () => void
  /** ES: Deshabilitar acciones mientras se procesa EN: Disable while pending */
  pending?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Confirmar',
  onConfirm,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] data-[state=closed]:animate-none" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[min(420px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-pos-lg focus:outline-none">
          <AlertDialog.Title className="text-lg font-bold tracking-tight text-slate-900">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-slate-600">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={pending}
                className="pos-btn-secondary min-h-[44px] px-5 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!pending) onConfirm()
                onOpenChange?.(false)
              }}
              className="min-h-[44px] rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:from-red-500 hover:to-rose-500 disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
