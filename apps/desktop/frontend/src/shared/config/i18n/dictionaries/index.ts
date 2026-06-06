import enUS from './en-US'
import type { Locale } from '../locales'

export type Dictionary = typeof enUS

// en-US is the bundled default (statically imported, so it shares the main
// chunk); other locales are lazy-loaded on demand (ADR-012).
export const dictionaryLoaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  'en-US': () => Promise.resolve({ default: enUS }),
  'pt-BR': () => import('./pt-BR'),
}
