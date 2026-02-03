import { createSignal } from 'solid-js'

const [isDark, setIsDark] = createSignal(false)

const toggleTheme = () => {
  setIsDark(!isDark())
  document.documentElement.classList.toggle('dark')
}

export { isDark, toggleTheme }
