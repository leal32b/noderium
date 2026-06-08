import { useNavigate } from '@solidjs/router'
import { createEffect, onCleanup } from 'solid-js'

import { useCommandStore } from '@entities/command'
import { useI18n, useTheme } from '@shared'

const DEFAULT_IDS = [
  'nav.home',
  'nav.journal',
  'nav.notes',
  'nav.review',
  'nav.editor',
  'nav.settings',
  'actions.toggleTheme',
]

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
        execute: () => navigate('/'),
      },
      {
        id: 'nav.journal',
        title: t('command.navigate.journal'),
        execute: () => navigate('/journal'),
      },
      {
        id: 'nav.notes',
        title: t('command.navigate.notes'),
        execute: () => navigate('/notes'),
      },
      {
        id: 'nav.review',
        title: t('command.navigate.review'),
        execute: () => navigate('/review'),
      },
      {
        id: 'nav.editor',
        title: t('command.navigate.editor'),
        execute: () => navigate('/editor'),
      },
      {
        id: 'nav.settings',
        title: t('command.navigate.settings'),
        execute: () => navigate('/settings'),
      },
      {
        id: 'actions.toggleTheme',
        title: t('command.actions.toggleTheme'),
        execute: () => theme.setTheme(theme.resolvedTheme() === 'dark' ? 'light' : 'dark'),
      },
    ])
  })

  onCleanup(() => commands.unregister(DEFAULT_IDS))
}
