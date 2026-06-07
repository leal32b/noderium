import { A, useNavigate } from '@solidjs/router'
import { ChevronRight, FileText, Plus } from 'lucide-solid'
import { createResource, For, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { Button, core, isTauri, useI18n } from '@shared'

/** All notes, with a way to create and open them (FR-4 navigation). */
export const NotesPage: Component = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [notes] = createResource(() => (isTauri() ? core.listNotes() : Promise.resolve([])))

  const newNote = async () => {
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    await core.createNote(id, 'atomic', t('notes.untitled'))
    navigate(`/note/${id}`)
  }

  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-6">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-tight">{t('notes.title')}</h1>
        <Show when={isTauri()}>
          <Button size="md" onClick={newNote}>
            <Plus size={16} />
            {t('notes.new')}
          </Button>
        </Show>
      </header>

      <Show
        when={notes() && notes()!.length > 0}
        fallback={
          <div class="card flex flex-col items-center gap-2 p-12 text-center">
            <span class="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunken text-text-tertiary">
              <FileText size={20} />
            </span>
            <p class="text-sm text-text-tertiary">{t('notes.empty')}</p>
          </div>
        }
      >
        <ul class="card divide-y divide-border-subtle overflow-hidden p-0">
          <For each={notes()}>
            {(note) => (
              <li>
                <A
                  href={`/note/${note.id}`}
                  class="focus-ring group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
                >
                  <FileText size={16} class="shrink-0 text-text-tertiary" />
                  <span class="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                    {note.title || t('notes.untitled')}
                  </span>
                  <span class="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] text-text-tertiary">
                    {note.type}
                  </span>
                  <ChevronRight
                    size={16}
                    class="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
                  />
                </A>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
