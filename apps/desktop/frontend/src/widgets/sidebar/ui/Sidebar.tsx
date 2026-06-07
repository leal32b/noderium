import { A } from '@solidjs/router'
import { BookText, FileText, GraduationCap, Home, PenLine, Settings } from 'lucide-solid'
import { For } from 'solid-js'
import type { Component } from 'solid-js'

import { cx, useI18n } from '@shared'
import type { TranslationKey } from '@shared'

export interface SidebarProps {
  collapsed: boolean
}

interface NavItem {
  href: string
  labelKey: TranslationKey
  icon: Component<{ size?: number }>
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', labelKey: 'navigation.home', icon: Home },
  { href: '/journal', labelKey: 'navigation.journal', icon: BookText },
  { href: '/notes', labelKey: 'navigation.notes', icon: FileText },
  { href: '/review', labelKey: 'navigation.review', icon: GraduationCap },
  { href: '/editor', labelKey: 'navigation.editor', icon: PenLine },
  { href: '/settings', labelKey: 'navigation.settings', icon: Settings },
]

export const Sidebar: Component<SidebarProps> = (props) => {
  const { t } = useI18n()

  return (
    <nav
      class={cx(
        'flex shrink-0 flex-col gap-0.5 border-r border-border-subtle bg-surface-background px-3 py-3 transition-[width] duration-200 ease-out',
        props.collapsed ? 'w-16' : 'w-60',
      )}
    >
      <ul class="flex flex-col gap-0.5">
        <For each={NAV_ITEMS}>
          {(item) => (
            <li>
              <A
                href={item.href}
                end={item.href === '/'}
                aria-label={t(item.labelKey)}
                data-tip={props.collapsed ? t(item.labelKey) : undefined}
                class={cx(
                  'focus-ring relative flex w-full items-center rounded-md py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:(bg-surface-hover text-text-primary)',
                  props.collapsed && 'sidebar-tip',
                )}
                activeClass="nav-active"
              >
                {/* Fixed-width icon slot keeps icons static while the bar resizes. */}
                <span class="flex w-10 shrink-0 items-center justify-center">
                  <item.icon size={19} />
                </span>
                <span
                  class={cx(
                    'overflow-hidden whitespace-nowrap transition-all duration-200 ease-out',
                    props.collapsed ? 'max-w-0 opacity-0' : 'max-w-[10rem] opacity-100',
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </A>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}
