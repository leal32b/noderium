import { createRoot, createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'

export interface CommandPaletteStore {
  isOpen: Accessor<boolean>
  setOpen: (open: boolean) => void
  toggle: () => void
  open: () => void
  close: () => void
}

function createCommandPaletteStore(): CommandPaletteStore {
  const [isOpen, setOpen] = createSignal(false)
  return {
    isOpen,
    setOpen,
    toggle: () => setOpen((v) => !v),
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
}

const store = createRoot(createCommandPaletteStore)

export function useCommandPalette(): CommandPaletteStore {
  return store
}
