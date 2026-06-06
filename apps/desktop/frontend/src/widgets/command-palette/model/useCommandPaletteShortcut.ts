import { createShortcut } from '@solid-primitives/keyboard'

import { useCommandPalette } from './store'

/** Binds ⌘K / Ctrl+K to toggle the command palette. */
export function useCommandPaletteShortcut(): void {
  const palette = useCommandPalette()
  createShortcut(['Meta', 'K'], () => palette.toggle(), { preventDefault: true })
  createShortcut(['Control', 'K'], () => palette.toggle(), { preventDefault: true })
}
