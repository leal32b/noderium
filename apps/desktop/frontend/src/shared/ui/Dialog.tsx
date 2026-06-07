import { Dialog as KDialog } from '@kobalte/core/dialog'
import { Show } from 'solid-js'
import type { JSX, ParentComponent } from 'solid-js'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children?: JSX.Element
}

export const Dialog: ParentComponent<DialogProps> = (props) => {
  return (
    <KDialog open={props.open} onOpenChange={props.onOpenChange}>
      <KDialog.Portal>
        <KDialog.Overlay class="dialog-overlay fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />
        <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <KDialog.Content class="dialog-content w-full max-w-xl overflow-hidden rounded-xl border border-border-default bg-surface-overlay text-text-primary shadow-lg">
            <Show when={props.title}>
              {(title) => (
                <KDialog.Title class="border-b border-border-subtle px-4 py-3 text-sm font-semibold">
                  {title()}
                </KDialog.Title>
              )}
            </Show>
            {props.children}
          </KDialog.Content>
        </div>
      </KDialog.Portal>
    </KDialog>
  )
}
