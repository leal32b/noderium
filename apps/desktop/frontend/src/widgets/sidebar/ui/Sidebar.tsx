import { A } from '@solidjs/router'
import { BookText, FileText, GraduationCap, Home, PenLine, Settings } from 'lucide-solid'
import { For, Show } from 'solid-js'
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
        'flex shrink-0 flex-col gap-1 border-r border-border-subtle bg-surface-raised py-3 transition-[width] duration-200',
        props.collapsed ? 'w-16 items-center px-2' : 'w-60 px-3',
      )}
    >
      <Show when={!props.collapsed}>
        <p class="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          {t('navigation.section')}
        </p>
      </Show>

      <ul class="flex w-full flex-col gap-0.5">
        <For each={NAV_ITEMS}>
          {(item) => (
            <li class={cx('flex', props.collapsed && 'justify-center')}>
              <Show
                when={props.collapsed}
                fallback={
                  <A
                    href={item.href}
                    end={item.href === '/'}
                    class="focus-ring flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:(bg-surface-hover text-text-primary)"
                    activeClass="nav-active"
                  >
                    <item.icon size={17} />
                    {t(item.labelKey)}
                  </A>
                }
              >
                <A
                  href={item.href}
                  end={item.href === '/'}
                  aria-label={t(item.labelKey)}
                  data-tip={t(item.labelKey)}
                  class="sidebar-tip focus-ring relative flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:(bg-surface-hover text-text-primary)"
                  activeClass="nav-active"
                >
                  <item.icon size={19} />
                </A>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}
