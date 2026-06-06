import { useNavigate } from '@solidjs/router'
import { createEffect, onCleanup } from 'solid-js'

import { useCommandStore } from '@entities/command'
import { useI18n, useTheme } from '@shared'

const DEFAULT_IDS = ['nav.home', 'nav.journal', 'nav.editor', 'nav.settings', 'actions.toggleTheme']

/** Registers the built-in command palette commands (navigation + actions). */
export function useDefaultCommands(): void {
  const navigate = useNavigate()
  const commands = useCommandStore()
  const { t } = useI18n()
  const theme = useTheme()

  createEffect(() => {
    commands.register([
      {
        id: 'nav.home',
        title: t('command.navigate.home'),
        group: 'navigate',
        execute: () => navigate('/'),
      },
      {
        id: 'nav.journal',
        title: t('command.navigate.journal'),
        group: 'navigate',
        execute: () => navigate('/journal'),
      },
      {
        id: 'nav.editor',
        title: t('command.navigate.editor'),
        group: 'navigate',
        execute: () => navigate('/editor'),
      },
      {
        id: 'nav.settings',
        title: t('command.navigate.settings'),
        group: 'navigate',
        execute: () => navigate('/settings'),
      },
      {
        id: 'actions.toggleTheme',
        title: t('command.actions.toggleTheme'),
        group: 'actions',
        execute: () => theme.setTheme(theme.resolvedTheme() === 'dark' ? 'light' : 'dark'),
      },
    ])
  })

  onCleanup(() => commands.unregister(DEFAULT_IDS))
}
