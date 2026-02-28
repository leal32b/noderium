import { createSignal } from 'solid-js'

const getThemeFromDom = () => document.documentElement.getAttribute('data-theme') === 'dark'
const [isDark, setIsDark] = createSignal(getThemeFromDom())

const setTheme = (dark: boolean) => {
  setIsDark(dark)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  setTheme(!isDark())
}

export const themeStore = { isDark, setTheme, toggleTheme }
