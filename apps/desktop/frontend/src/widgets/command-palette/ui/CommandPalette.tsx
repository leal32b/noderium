import { Search } from 'lucide-solid'
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { useCommandStore } from '@entities/command'
import { cx, Dialog, useI18n } from '@shared'

import { useCommandPalette } from '../model/store'

export const CommandPalette: Component = () => {
  const palette = useCommandPalette()
  const commands = useCommandStore()
  const { t } = useI18n()
  const [query, setQuery] = createSignal('')
  const [activeIndex, setActiveIndex] = createSignal(0)

  const filtered = createMemo(() => {
    const q = query().toLowerCase().trim()
    return commands.commands().filter((c) => c.title.toLowerCase().includes(q))
  })

  // Keep the highlighted item valid as results / visibility change.
  createEffect(() => {
    filtered()
    palette.isOpen()
    setActiveIndex(0)
  })

  const run = (id: string) => {
    commands.execute(id)
    palette.close()
    setQuery('')
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const items = filtered()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = items[activeIndex()]
      if (cmd) run(cmd.id)
    }
  }

  return (
    <Dialog open={palette.isOpen()} onOpenChange={palette.setOpen}>
      <div class="flex items-center gap-2.5 border-b border-border-subtle px-4">
        <Search size={16} class="shrink-0 text-text-tertiary" />
        <input
          autofocus
          class="h-12 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          placeholder={t('command.placeholder')}
          value={query()}
          onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
            setQuery(e.currentTarget.value)
          }
          onKeyDown={onKeyDown}
        />
        <kbd class="shrink-0 rounded border border-border-default bg-surface-sunken px-1.5 py-0.5 font-sans text-[11px] text-text-tertiary">
          ESC
        </kbd>
      </div>
      <ul class="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
        <Show
          when={filtered().length > 0}
          fallback={
            <li class="px-3 py-8 text-center text-sm text-text-tertiary">{t('command.empty')}</li>
          }
        >
          <For each={filtered()}>
            {(cmd, index) => (
              <li>
                <button
                  type="button"
                  class={cx(
                    'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    index() === activeIndex()
                      ? 'bg-accent-subtle-bg text-accent-subtle-text'
                      : 'text-text-secondary',
                  )}
                  onMouseEnter={() => setActiveIndex(index())}
                  onClick={() => run(cmd.id)}
                >
                  <span>{cmd.title}</span>
                  <Show when={cmd.shortcut}>
                    {(shortcut) => (
                      <kbd class="rounded border border-border-default px-1.5 py-0.5 text-[11px] text-text-tertiary">
                        {shortcut()}
                      </kbd>
                    )}
                  </Show>
                </button>
              </li>
            )}
          </For>
        </Show>
      </ul>
    </Dialog>
  )
}
