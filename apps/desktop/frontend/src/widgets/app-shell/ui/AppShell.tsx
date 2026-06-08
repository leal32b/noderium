import type { ParentComponent } from 'solid-js'

import { CommandDefaults } from '@features/command-defaults'
import { CommandPalette, useCommandPaletteShortcut } from '@widgets/command-palette'
import { Sidebar } from '@widgets/sidebar'
import { Topbar } from '@widgets/topbar'

import { createAppShellState } from '../model/store'

/**
 * App shell: Topbar + Sidebar + main. Local-first — no auth/session gating
 * (ADR-012 adaptation); children render directly. The sidebar is collapsible.
 */
export const AppShell: ParentComponent = (props) => {
  const shell = createAppShellState()
  useCommandPaletteShortcut()

  return (
    <div class="flex h-screen flex-col bg-surface-background text-text-primary">
      <CommandDefaults />
      <Topbar onToggleSidebar={shell.toggleCollapsed} />
      <div class="flex min-h-0 flex-1">
        <Sidebar collapsed={shell.collapsed()} />
        <main id="main" class="min-w-0 flex-1 overflow-y-auto px-6 py-[var(--pad-main-y)] md:px-10">
          {props.children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
