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
        <KDialog.Overlay class="fixed inset-0 z-40 bg-black/40" />
        <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <KDialog.Content class="w-full max-w-lg rounded-lg border border-border-default bg-surface-raised text-text-primary shadow-xl">
            <Show when={props.title}>
              {(title) => (
                <KDialog.Title class="border-b border-border-default px-4 py-3 font-medium">
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
