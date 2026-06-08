import { useNavigate } from '@solidjs/router'
import { PanelLeft, Search, Settings } from 'lucide-solid'
import type { Component } from 'solid-js'

import { useI18n } from '@shared'
import { useCommandPalette } from '@widgets/command-palette'

export interface TopbarProps {
  onToggleSidebar: () => void
}

export const Topbar: Component<TopbarProps> = (props) => {
  const { t } = useI18n()
  const palette = useCommandPalette()
  const navigate = useNavigate()

  return (
    <header class="grid h-14 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border-subtle bg-surface-background px-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="icon-btn h-9 w-9"
          aria-label={t('topbar.toggleSidebar')}
          onClick={() => props.onToggleSidebar()}
        >
          <PanelLeft size={18} />
        </button>
        <div class="flex select-none items-center gap-2">
          <span class="hidden text-[15px] font-semibold tracking-tight sm:inline">Noderium</span>
        </div>
      </div>

      <div class="flex justify-center">
        <button
          type="button"
          onClick={() => palette.open()}
          aria-label={t('topbar.openCommandPalette')}
          class="focus-ring flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border-default bg-surface-raised px-3 text-sm text-text-tertiary transition-colors hover:border-border-strong"
        >
          <Search size={15} />
          <span>{t('topbar.search')}</span>
        </button>
      </div>

      <div class="flex items-center justify-end">
        <button
          type="button"
          class="icon-btn h-9 w-9"
          aria-label={t('settings.title')}
          title={t('settings.title')}
          onClick={() => navigate('/settings')}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
