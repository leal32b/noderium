import { Toast } from '@kobalte/core/toast'
import { CircleAlert, CircleCheck, X } from 'lucide-solid'

import { cx } from './cx'

type NotifyVariant = 'success' | 'error'

const ICON: Record<NotifyVariant, typeof CircleCheck> = {
  success: CircleCheck,
  error: CircleAlert,
}

const ICON_CLASS: Record<NotifyVariant, string> = {
  success: 'text-feedback-success-text',
  error: 'text-feedback-danger-text',
}

function show(variant: NotifyVariant, message: string): void {
  const Icon = ICON[variant]
  Toast.toaster.show((props) => (
    <Toast
      toastId={props.toastId}
      class="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-border-default bg-surface-overlay px-3 py-2.5 shadow-lg"
    >
      <Icon size={16} class={cx('shrink-0', ICON_CLASS[variant])} />
      <Toast.Description class="flex-1 text-sm text-text-primary">{message}</Toast.Description>
      <Toast.CloseButton class="icon-btn h-6 w-6 shrink-0">
        <X size={14} />
      </Toast.CloseButton>
    </Toast>
  ))
}

/**
 * Transient feedback over the app's Kobalte toast region (mounted by
 * `ToastProvider`). Use for the outcome of a one-off action; persistent status
 * (e.g. the editor's save indicator) stays inline.
 */
export const notify = {
  success: (message: string) => show('success', message),
  error: (message: string) => show('error', message),
}
