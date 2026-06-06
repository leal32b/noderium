import type { ParentComponent } from 'solid-js'

import { CommandDefaults } from '@features/command-defaults'
import { CommandPalette, useCommandPaletteShortcut } from '@widgets/command-palette'
import { Sidebar } from '@widgets/sidebar'
import { Topbar } from '@widgets/topbar'

import { createAppShellState } from '../model/store'

/**
 * App shell: Topbar + Sidebar + main. Local-first — no auth/session gating
 * (ADR-012 adaptation); children render directly.
 */
export const AppShell: ParentComponent = (props) => {
  const shell = createAppShellState()
  useCommandPaletteShortcut()

  return (
    <div class="flex h-screen flex-col bg-surface-background text-text-primary">
      <CommandDefaults />
      <Topbar onToggleSidebar={shell.toggleSidebar} />
      <div class="flex min-h-0 flex-1">
        <Sidebar open={shell.sidebarOpen()} onClose={() => shell.setSidebarOpen(false)} />
        <main id="main" class="min-w-0 flex-1 overflow-y-auto p-6">
          {props.children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
