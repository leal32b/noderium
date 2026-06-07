import { useNavigate } from '@solidjs/router'
import { FileText, Search } from 'lucide-solid'
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { useCommandStore } from '@entities/command'
import { core, cx, Dialog, isTauri, useI18n } from '@shared'
import type { SearchHitDto } from '@shared'

import { useCommandPalette } from '../model/store'

type PaletteItem =
  | { kind: 'command'; id: string; title: string; shortcut: string | undefined }
  | { kind: 'note'; noteId: string; text: string }

const MAX_NOTE_HITS = 8

export const CommandPalette: Component = () => {
  const palette = useCommandPalette()
  const commands = useCommandStore()
  const navigate = useNavigate()
  const { t } = useI18n()

  const [query, setQuery] = createSignal('')
  const [debounced, setDebounced] = createSignal('')
  const [noteHits, setNoteHits] = createSignal<SearchHitDto[]>([])
  const [activeIndex, setActiveIndex] = createSignal(0)

  let timer: ReturnType<typeof setTimeout> | undefined
  createEffect(() => {
    const q = query()
    clearTimeout(timer)
    timer = setTimeout(() => setDebounced(q), 140)
  })
  onCleanup(() => clearTimeout(timer))

  // Live content search as the query changes (Tauri only).
  createEffect(() => {
    const q = debounced().trim()
    if (!isTauri() || q === '') {
      setNoteHits([])
      return
    }
    void core.searchDetailed(q).then((hits) => setNoteHits(hits.slice(0, MAX_NOTE_HITS)))
  })

  const commandItems = createMemo<PaletteItem[]>(() => {
    const q = query().toLowerCase().trim()
    return commands
      .commands()
      .filter((c) => c.title.toLowerCase().includes(q))
      .map((c) => ({ kind: 'command' as const, id: c.id, title: c.title, shortcut: c.shortcut }))
  })

  const noteItems = createMemo<PaletteItem[]>(() =>
    noteHits().map((h) => ({ kind: 'note' as const, noteId: h.note_id, text: h.text })),
  )

  const items = createMemo<PaletteItem[]>(() => [...commandItems(), ...noteItems()])

  // Keep the highlighted row valid as results / visibility change.
  createEffect(() => {
    items()
    palette.isOpen()
    setActiveIndex(0)
  })

  const select = (item: PaletteItem) => {
    if (item.kind === 'command') commands.execute(item.id)
    else navigate(`/note/${item.noteId}`)
    palette.close()
    setQuery('')
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const list = items()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = list[activeIndex()]
      if (item) select(item)
    }
  }

  const rowClass = (active: boolean) =>
    cx(
      'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
      active ? 'bg-accent-subtle-bg text-accent-subtle-text' : 'text-text-secondary',
    )

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

      <ul class="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
        <Show
          when={items().length > 0}
          fallback={
            <li class="px-3 py-8 text-center text-sm text-text-tertiary">{t('command.empty')}</li>
          }
        >
          <Show when={commandItems().length > 0}>
            <li class="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              {t('command.commandsLabel')}
            </li>
            <For each={commandItems()}>
              {(item, index) => (
                <li>
                  <button
                    type="button"
                    class={rowClass(index() === activeIndex())}
                    onMouseEnter={() => setActiveIndex(index())}
                    onClick={() => select(item)}
                  >
                    <span class="flex-1 truncate">{item.kind === 'command' ? item.title : ''}</span>
                    <Show when={item.kind === 'command' && item.shortcut}>
                      <kbd class="rounded border border-border-default px-1.5 py-0.5 text-[11px] text-text-tertiary">
                        {item.kind === 'command' ? item.shortcut : ''}
                      </kbd>
                    </Show>
                  </button>
                </li>
              )}
            </For>
          </Show>

          <Show when={noteItems().length > 0}>
            <li class="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              {t('command.notesLabel')}
            </li>
            <For each={noteItems()}>
              {(item, index) => {
                const globalIndex = () => commandItems().length + index()
                return (
                  <li>
                    <button
                      type="button"
                      class={rowClass(globalIndex() === activeIndex())}
                      onMouseEnter={() => setActiveIndex(globalIndex())}
                      onClick={() => select(item)}
                    >
                      <FileText size={15} class="shrink-0 text-text-tertiary" />
                      <span class="flex-1 truncate">{item.kind === 'note' ? item.text : ''}</span>
                    </button>
                  </li>
                )
              }}
            </For>
          </Show>
        </Show>
      </ul>
    </Dialog>
  )
}
