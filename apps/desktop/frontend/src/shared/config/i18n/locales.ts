export const LOCALES = ['en-US', 'pt-BR'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en-US'

export const LOCALE_LABELS: Record<Locale, string> = {
  'en-US': 'English (US)',
  'pt-BR': 'Português (BR)',
}

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale)

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  for (const candidate of navigator.languages ?? [navigator.language]) {
    if (isLocale(candidate)) return candidate
    const prefix = candidate.split('-')[0]
    const match = LOCALES.find((loc) => loc.split('-')[0] === prefix)
    if (match) return match
  }
  return DEFAULT_LOCALE
}
