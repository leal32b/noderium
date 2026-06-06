import { flatten, resolveTemplate, translator } from '@solid-primitives/i18n'
import type { Flatten } from '@solid-primitives/i18n'
import { makePersisted } from '@solid-primitives/storage'
import {
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  useContext,
} from 'solid-js'
import type { Accessor, ParentComponent } from 'solid-js'

import enUS from '../config/i18n/dictionaries/en-US'
import { DEFAULT_LOCALE, detectBrowserLocale, dictionaryLoaders, isLocale } from '../config/i18n'
import type { Locale } from '../config/i18n'

type FlatDictionary = Flatten<typeof enUS>
export type TranslationKey = keyof FlatDictionary & string

const flattenedDefault: FlatDictionary = flatten(enUS)

export interface I18nContextValue {
  locale: Accessor<Locale>
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  formatDate: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
}

const I18nContext = createContext<I18nContextValue>()

export const I18nProvider: ParentComponent = (props) => {
  const [stored, setStored] = makePersisted(createSignal<Locale>(detectBrowserLocale()), {
    name: 'locale',
    deserialize: (raw) => (isLocale(raw) ? raw : DEFAULT_LOCALE),
    serialize: (value) => value,
  })

  const locale = createMemo<Locale>(() => (isLocale(stored()) ? stored() : DEFAULT_LOCALE))

  const [dict] = createResource(
    locale,
    async (loc) => {
      const mod = await dictionaryLoaders[loc]()
      return flatten(mod.default)
    },
    { initialValue: flattenedDefault },
  )

  const translate = translator<FlatDictionary>(() => dict() ?? flattenedDefault, resolveTemplate)

  const t: I18nContextValue['t'] = (key, params) => {
    const value = params === undefined ? translate(key) : translate(key, params)
    return typeof value === 'string' ? value : key
  }

  const formatDate: I18nContextValue['formatDate'] = (value, options) =>
    new Intl.DateTimeFormat(locale(), options).format(value)

  const formatNumber: I18nContextValue['formatNumber'] = (value, options) =>
    new Intl.NumberFormat(locale(), options).format(value)

  createEffect(() => {
    document.documentElement.setAttribute('lang', locale())
  })

  return (
    <I18nContext.Provider value={{ locale, setLocale: setStored, t, formatDate, formatNumber }}>
      {props.children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
