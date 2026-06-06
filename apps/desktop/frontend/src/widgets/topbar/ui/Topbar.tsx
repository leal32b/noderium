import { Menu, Search } from 'lucide-solid'
import { For } from 'solid-js'
import type { Component } from 'solid-js'

import { Button, LOCALE_LABELS, LOCALES, useI18n, useTheme } from '@shared'
import type { Locale, Theme } from '@shared'
import { useCommandPalette } from '@widgets/command-palette'

export interface TopbarProps {
  onToggleSidebar: () => void
}

const THEME_OPTIONS: readonly Theme[] = ['light', 'dark', 'system']

const selectClass =
  'focus-ring h-8 rounded border border-border-default bg-surface-background px-2 text-sm text-text-primary'

export const Topbar: Component<TopbarProps> = (props) => {
  const { t, locale, setLocale } = useI18n()
  const theme = useTheme()
  const palette = useCommandPalette()

  return (
    <header class="flex h-12 shrink-0 items-center gap-2 border-b border-border-default bg-surface-raised px-3">
      <Button
        variant="ghost"
        size="sm"
        aria-label={t('topbar.toggleSidebar')}
        onClick={() => props.onToggleSidebar()}
      >
        <Menu size={18} />
      </Button>
      <span class="font-semibold">Noderium</span>

      <div class="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          aria-label={t('topbar.openCommandPalette')}
          onClick={() => palette.open()}
        >
          <Search size={16} />
          <span class="text-text-tertiary">⌘K</span>
        </Button>

        <select
          aria-label={t('topbar.theme')}
          class={selectClass}
          value={theme.theme()}
          onChange={(e) => theme.setTheme(e.currentTarget.value as Theme)}
        >
          <For each={THEME_OPTIONS}>
            {(option) => <option value={option}>{t(`theme.${option}`)}</option>}
          </For>
        </select>

        <select
          aria-label={t('topbar.language')}
          class={selectClass}
          value={locale()}
          onChange={(e) => setLocale(e.currentTarget.value as Locale)}
        >
          <For each={LOCALES}>{(loc) => <option value={loc}>{LOCALE_LABELS[loc]}</option>}</For>
        </select>
      </div>
    </header>
  )
}
