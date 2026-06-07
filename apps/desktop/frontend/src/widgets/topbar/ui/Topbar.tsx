import { ChevronDown, Globe, Monitor, Moon, PanelLeft, Search, Sun } from 'lucide-solid'
import { For } from 'solid-js'
import type { Component } from 'solid-js'

import { cx, LOCALE_LABELS, LOCALES, useI18n, useTheme } from '@shared'
import type { Locale, Theme } from '@shared'
import { useCommandPalette } from '@widgets/command-palette'

export interface TopbarProps {
  onToggleSidebar: () => void
}

const THEME_OPTIONS: readonly { value: Theme; icon: Component<{ size?: number }> }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

export const Topbar: Component<TopbarProps> = (props) => {
  const { t, locale, setLocale } = useI18n()
  const theme = useTheme()
  const palette = useCommandPalette()

  return (
    <header class="grid h-14 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border-subtle bg-surface-background px-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="icon-btn h-9 w-9"
          aria-label={t('topbar.toggleSidebar')}
          onClick={() => props.onToggleSidebar()}
        >
          <PanelLeft size={18} />
        </button>
        <div class="flex select-none items-center gap-2">
          <span class="hidden text-[15px] font-semibold tracking-tight sm:inline">Noderium</span>
        </div>
      </div>

      <div class="flex justify-center">
        <button
          type="button"
          onClick={() => palette.open()}
          aria-label={t('topbar.openCommandPalette')}
          class="focus-ring flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border-default bg-surface-raised px-3 text-sm text-text-tertiary transition-colors hover:border-border-strong"
        >
          <Search size={15} />
          <span>{t('topbar.search')}</span>
        </button>
      </div>

      <div class="flex items-center justify-end gap-2">
        <div
          class="inline-flex items-center rounded-md border border-border-default bg-surface-sunken p-0.5"
          role="group"
          aria-label={t('topbar.theme')}
        >
          <For each={THEME_OPTIONS}>
            {(option) => (
              <button
                type="button"
                onClick={() => theme.setTheme(option.value)}
                aria-label={t(`theme.${option.value}`)}
                title={t(`theme.${option.value}`)}
                aria-pressed={theme.theme() === option.value}
                class={cx(
                  'focus-ring inline-flex h-7 w-7 items-center justify-center rounded transition-all duration-150',
                  theme.theme() === option.value
                    ? 'bg-surface-raised text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-primary',
                )}
              >
                <option.icon size={15} />
              </button>
            )}
          </For>
        </div>

        <div class="relative">
          <Globe
            size={15}
            class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <select
            aria-label={t('topbar.language')}
            class="focus-ring h-9 appearance-none rounded-md border border-border-default bg-surface-raised pl-8 pr-7 text-sm text-text-primary transition-colors hover:border-border-strong"
            value={locale()}
            onChange={(e) => setLocale(e.currentTarget.value as Locale)}
          >
            <For each={LOCALES}>{(loc) => <option value={loc}>{LOCALE_LABELS[loc]}</option>}</For>
          </select>
          <ChevronDown
            size={14}
            class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
        </div>
      </div>
    </header>
  )
}
