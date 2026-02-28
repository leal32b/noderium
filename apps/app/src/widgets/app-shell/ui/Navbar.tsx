import {
  IconDots,
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutSidebarRightExpand,
  IconMoonFilled,
  IconSunFilled
} from '@tabler/icons-solidjs'
import { type Component } from 'solid-js'

import { appShellStore } from '../model'
import { themeStore } from '@/shared/model'

const Navbar: Component = () => {
  return (
    <div class="navbar min-h-0">
      <div class="flex-none">
        <button aria-label="Toggle left sidebar" class="btn btn-sm btn-square btn-ghost" onClick={() => appShellStore.toggleLeftCollapsed()}>
          {
            appShellStore.isLeftCollapsed()
              ? <IconLayoutSidebarLeftCollapseFilled class="size-5" />
              : <IconLayoutSidebarLeftExpand class="size-5" />
          }
        </button>
      </div>
      <div class="flex-1 text-center">Noderium</div>
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <button aria-label="More options" class="btn btn-sm btn-square btn-ghost" role="button" tabindex="0">
            <IconDots class="size-4" />
          </button>
          <ul
            class="menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-3 w-52 p-2"
            tabindex="-1"
          >
            <li onClick={() => {
              (document.activeElement as HTMLElement)?.blur()
              themeStore.toggleTheme()
            }}
            >
              <a>
                {
                  themeStore.isDark()
                    ? <IconMoonFilled class="size-4" />
                    : <IconSunFilled class="size-4" />
                }
                Toggle theme
              </a>
            </li>
          </ul>
        </div>
        <button aria-label="Toggle right sidebar" class="btn btn-sm btn-square btn-ghost" onClick={() => appShellStore.toggleRightCollapsed()}>
          {
            appShellStore.isRightCollapsed()
              ? <IconLayoutSidebarRightCollapseFilled class="size-5" />
              : <IconLayoutSidebarRightExpand class="size-5" />
          }
        </button>
      </div>
    </div>
  )
}

/* v8 ignore next -- @preserve */
export { Navbar }
