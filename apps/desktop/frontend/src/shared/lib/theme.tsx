import { makePersisted } from '@solid-primitives/storage'
import { createContext, createEffect, createSignal, onCleanup, onMount, useContext } from 'solid-js'
import type { Accessor, ParentComponent } from 'solid-js'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
export type Density = 'comfortable' | 'compact'

export interface ThemeContextValue {
  theme: Accessor<Theme>
  setTheme: (theme: Theme) => void
  resolvedTheme: Accessor<ResolvedTheme>
  density: Accessor<Density>
  setDensity: (density: Density) => void
}

const ThemeContext = createContext<ThemeContextValue>()

const THEMES: readonly Theme[] = ['light', 'dark', 'system']
const DENSITIES: readonly Density[] = ['comfortable', 'compact']

const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme)
const isDensity = (value: unknown): value is Density => DENSITIES.includes(value as Density)

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setTheme] = makePersisted(createSignal<Theme>('system'), {
    name: 'theme',
    deserialize: (raw) => (isTheme(raw) ? raw : 'system'),
    serialize: (value) => value,
  })
  const [density, setDensity] = makePersisted(createSignal<Density>('comfortable'), {
    name: 'density',
    deserialize: (raw) => (isDensity(raw) ? raw : 'comfortable'),
    serialize: (value) => value,
  })
  const [systemDark, setSystemDark] = createSignal(prefersDark())

  onMount(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener('change', handler)
    onCleanup(() => media.removeEventListener('change', handler))
  })

  const resolvedTheme: Accessor<ResolvedTheme> = () => {
    const current = theme()
    if (current === 'system') return systemDark() ? 'dark' : 'light'
    return current
  }

  createEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', resolvedTheme())
    root.setAttribute('data-density', density())
  })

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, density, setDensity }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
