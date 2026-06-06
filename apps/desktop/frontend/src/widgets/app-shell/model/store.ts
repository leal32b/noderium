import { createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'

export interface AppShellState {
  sidebarOpen: Accessor<boolean>
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export function createAppShellState(): AppShellState {
  const [sidebarOpen, setSidebarOpen] = createSignal(false)
  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen((v) => !v),
  }
}
