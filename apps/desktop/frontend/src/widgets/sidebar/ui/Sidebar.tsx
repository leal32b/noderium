import { A } from '@solidjs/router'
import { Home, Settings } from 'lucide-solid'
import { For } from 'solid-js'
import type { Component } from 'solid-js'

import { cx, useI18n } from '@shared'
import type { TranslationKey } from '@shared'

export interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  href: string
  labelKey: TranslationKey
  icon: Component<{ size?: number }>
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', labelKey: 'navigation.home', icon: Home },
  { href: '/settings', labelKey: 'navigation.settings', icon: Settings },
]

export const Sidebar: Component<SidebarProps> = (props) => {
  const { t } = useI18n()

  return (
    <nav
      class={cx(
        'w-56 shrink-0 border-r border-border-default bg-surface-sunken p-3',
        props.open ? 'block' : 'hidden md:block',
      )}
    >
      <ul class="space-y-1">
        <For each={NAV_ITEMS}>
          {(item) => (
            <li>
              <A
                href={item.href}
                end={item.href === '/'}
                class="focus-ring flex items-center gap-2 rounded px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised"
                activeClass="bg-surface-raised text-text-primary"
                onClick={() => props.onClose()}
              >
                <item.icon size={16} />
                {t(item.labelKey)}
              </A>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}
