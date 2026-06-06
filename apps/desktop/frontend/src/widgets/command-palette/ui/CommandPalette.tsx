import { createMemo, createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { useCommandStore } from '@entities/command'
import { Dialog, Input, useI18n } from '@shared'

import { useCommandPalette } from '../model/store'

export const CommandPalette: Component = () => {
  const palette = useCommandPalette()
  const commands = useCommandStore()
  const { t } = useI18n()
  const [query, setQuery] = createSignal('')

  const filtered = createMemo(() => {
    const q = query().toLowerCase().trim()
    return commands.commands().filter((c) => c.title.toLowerCase().includes(q))
  })

  const run = (id: string) => {
    commands.execute(id)
    palette.close()
    setQuery('')
  }

  return (
    <Dialog open={palette.isOpen()} onOpenChange={palette.setOpen}>
      <div class="border-b border-border-default p-2">
        <Input
          autofocus
          placeholder={t('command.placeholder')}
          value={query()}
          onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
            setQuery(e.currentTarget.value)
          }
        />
      </div>
      <ul class="max-h-80 overflow-y-auto p-2">
        <Show
          when={filtered().length > 0}
          fallback={
            <li class="px-3 py-6 text-center text-sm text-text-tertiary">{t('command.empty')}</li>
          }
        >
          <For each={filtered()}>
            {(cmd) => (
              <li>
                <button
                  type="button"
                  class="focus-ring flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-surface-sunken"
                  onClick={() => run(cmd.id)}
                >
                  <span>{cmd.title}</span>
                  <Show when={cmd.shortcut}>
                    {(shortcut) => <kbd class="text-xs text-text-tertiary">{shortcut()}</kbd>}
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
