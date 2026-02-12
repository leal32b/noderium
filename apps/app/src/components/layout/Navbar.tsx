import { type Component } from 'solid-js'

import { toggleLeftCollapsed, toggleRightCollapsed } from '@/stores/layout'
import { isDark, toggleTheme } from '@/stores/theme'

const closeDetails = (details: HTMLDetailsElement) => {
  details.removeAttribute('open')
}

const Navbar: Component = () => {
  return (
    <div class="navbar min-h-0 fixed top-0 left-0 right-0 z-50">
      <div class="navbar-start">
        {/* Left menu */}
        <button
          class="btn btn-sm p-1 btn-ghost"
          onClick={() => toggleLeftCollapsed()}
        >
          <span class="i-material-symbols-transition-slide-outline h-5 w-5" />
        </button>
      </div>
      <div class="navbar-center">
        {/* Title */}
        <span>Noderium</span>
      </div>
      <div class="navbar-end">
        {/* More menu */}
        <details class="dropdown dropdown-end">
          <summary class="btn btn-sm p-1 btn-ghost">
            <span class="i-material-symbols-more-horiz h-5 w-5" />
          </summary>
          <ul class="menu menu-sm dropdown-content mt-2 p-2 shadow w-52 rounded-box bg-base-300">
            <li onClick={(e) => {
              toggleTheme()
              closeDetails(e.currentTarget.closest('details')!) // Fecha
            }}
            >
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
        </details>
        <button
          class="btn btn-sm p-1 btn-ghost"
          onClick={() => toggleRightCollapsed()}
        >
          <span class="i-material-symbols-transition-slide-outline rotate-180 h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

/* v8 ignore next -- @preserve */
export { Navbar }
