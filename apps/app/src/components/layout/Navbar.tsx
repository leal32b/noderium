import { type Component } from 'solid-js'

import { isDark, toggleTheme } from '@/stores/theme'

const Navbar: Component = () => {
  return (
    <div class="navbar min-h-0">
      <div class="navbar-start">
        {/* Left menu */}
        <button class="btn btn-sm p-1 btn-ghost">
          <span class="i-material-symbols-menu h-5 w-5" />
        </button>
      </div>
      <div class="navbar-center">
        {/* Title */}
        <span>Noderium</span>
      </div>
      <div class="navbar-end">
        {/* More menu */}
        <div class="dropdown dropdown-end">
          <button
            class="btn btn-sm p-1 btn-ghost"
            tabindex="0"
          >
            <span class="i-material-symbols-more-horiz h-5 w-5" />
          </button>
          <ul
            class="menu menu-sm dropdown-content mt-2 p-2 shadow w-52 rounded-box bg-black/10 z-[2]"
            onClick={() => (document.activeElement as HTMLElement).blur()}
            tabindex="0"
          >
            <li onClick={toggleTheme}>
              <a class="flex items-center gap-2">
                <span
                  class="w-4 h-4"
                  classList={{
                    'i-material-symbols-dark-mode': isDark(),
                    'i-material-symbols-light-mode': !isDark()
                  }}
                />
                Toggle theme
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/* v8 ignore next -- @preserve */
export { Navbar }
