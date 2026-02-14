import { createSignal } from 'solid-js'

const dataTheme = document.documentElement.getAttribute('data-theme') === 'dark'
const [isDark, setIsDark] = createSignal(dataTheme)

const toggleTheme = () => {
  setIsDark(!isDark())
  document.documentElement.setAttribute('data-theme', isDark() ? 'dark' : 'light')
}

export { isDark, toggleTheme }
