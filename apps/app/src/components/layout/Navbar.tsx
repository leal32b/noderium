import { type Component } from 'solid-js'

import { isDark, toggleTheme } from '@/stores/theme'

const Navbar: Component = () => {
  return (
    <nav class="flex h-8 items-center px-2">
      <div>Noderium</div>
      <div class="ml-auto flex items-center gap-2">
        <span
          aria-label={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
          class="cursor-pointer h-5 w-5 hover:text-hover"
          classList={{
            'i-material-symbols-dark-mode': isDark(),
            'i-material-symbols-light-mode': !isDark()
          }}
          data-testid="navbar-toggle-theme"
          onClick={toggleTheme}
        />
      </div>
    </nav>
  )
}

/* v8 ignore next -- @preserve */
export { Navbar }
