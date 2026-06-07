import { makePersisted } from '@solid-primitives/storage'
import { createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'

export interface AppShellState {
  collapsed: Accessor<boolean>
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

export function createAppShellState(): AppShellState {
  const [collapsed, setCollapsed] = makePersisted(createSignal(false), {
    name: 'sidebar-collapsed',
    serialize: (v) => (v ? '1' : '0'),
    deserialize: (raw) => raw === '1',
  })
  return {
    collapsed,
    setCollapsed,
    toggleCollapsed: () => setCollapsed((v) => !v),
  }
}
