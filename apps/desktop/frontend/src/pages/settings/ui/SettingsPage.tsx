import { For } from 'solid-js'
import type { Component } from 'solid-js'

import { cx, LOCALE_LABELS, LOCALES, useI18n, useTheme } from '@shared'
import type { Density, Locale, Theme } from '@shared'

import { SettingsRow, SettingsSection } from './SettingsSection'

const THEME_OPTIONS: readonly Theme[] = ['light', 'dark', 'system']
const DENSITY_OPTIONS: readonly Density[] = ['comfortable', 'compact']

/** Grouped app settings (FR-12). Sections scale as configuration grows. */
export const SettingsPage: Component = () => {
  const { t, locale, setLocale } = useI18n()
  const theme = useTheme()

  const segment = (active: boolean) =>
    cx(
      'focus-ring rounded px-3 py-1 text-xs font-medium transition-all duration-150',
      active
        ? 'bg-surface-raised text-text-primary shadow-sm'
        : 'text-text-tertiary hover:text-text-primary',
    )

  return (
    <div class="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <h1 class="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
      </header>

      <SettingsSection title={t('settings.appearance')} description={t('settings.appearanceDesc')}>
        <SettingsRow label={t('settings.theme')}>
          <div
            class="inline-flex items-center rounded-md border border-border-default bg-surface-sunken p-0.5"
            role="group"
            aria-label={t('settings.theme')}
          >
            <For each={THEME_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => theme.setTheme(option)}
                  aria-pressed={theme.theme() === option}
                  class={segment(theme.theme() === option)}
                >
                  {t(`theme.${option}`)}
                </button>
              )}
            </For>
          </div>
        </SettingsRow>

        <SettingsRow label={t('settings.density')}>
          <div
            class="inline-flex items-center rounded-md border border-border-default bg-surface-sunken p-0.5"
            role="group"
            aria-label={t('settings.density')}
          >
            <For each={DENSITY_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => theme.setDensity(option)}
                  aria-pressed={theme.density() === option}
                  class={segment(theme.density() === option)}
                >
                  {t(`settings.${option}`)}
                </button>
              )}
            </For>
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t('settings.language')} description={t('settings.languageDesc')}>
        <SettingsRow label={t('settings.language')}>
          <select
            aria-label={t('settings.language')}
            class="focus-ring h-[var(--control-height)] appearance-none rounded-md border border-border-default bg-surface-raised pl-3 pr-8 text-sm text-text-primary transition-colors hover:border-border-strong"
            value={locale()}
            onChange={(e) => setLocale(e.currentTarget.value as Locale)}
          >
            <For each={LOCALES}>{(loc) => <option value={loc}>{LOCALE_LABELS[loc]}</option>}</For>
          </select>
        </SettingsRow>
      </SettingsSection>
    </div>
  )
}
