import { Toast } from '@kobalte/core/toast'
import { Portal } from 'solid-js/web'
import type { ParentComponent } from 'solid-js'

/** Mounts a Kobalte toast region; `Toast.toaster.show(...)` shows toasts. */
export const ToastProvider: ParentComponent = (props) => (
  <>
    {props.children}
    <Portal>
      <Toast.Region>
        <Toast.List class="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2 outline-none" />
      </Toast.Region>
    </Portal>
  </>
)
