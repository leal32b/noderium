import { A } from '@solidjs/router'
import { BookText, FileText, GraduationCap, Home, PenLine, Settings } from 'lucide-solid'
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
        'w-60 shrink-0 flex-col gap-1 border-r border-border-subtle bg-surface-raised p-3',
        props.open ? 'flex' : 'hidden md:flex',
      )}
    >
      <p class="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
        {t('navigation.section')}
      </p>
      <ul class="flex flex-col gap-0.5">
        <For each={NAV_ITEMS}>
          {(item) => (
            <li>
              <A
                href={item.href}
                end={item.href === '/'}
                onClick={() => props.onClose()}
                class="focus-ring flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:(bg-surface-hover text-text-primary)"
                activeClass="nav-active"
              >
                <item.icon size={17} />
                {t(item.labelKey)}
              </A>
            </li>
          )}
        </For>
      </ul>

      <div class="mt-auto px-3 pb-1 pt-3 text-[11px] text-text-tertiary">
        <span class="inline-flex items-center gap-1.5">
          <kbd class="rounded border border-border-default bg-surface-sunken px-1.5 py-0.5 font-sans text-[10px] text-text-secondary">
            ⌘K
          </kbd>
          {t('topbar.search')}
        </span>
      </div>
    </nav>
  )
}
