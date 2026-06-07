import { A, useNavigate } from '@solidjs/router'
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
    <div class="mx-auto flex max-w-3xl flex-col gap-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold">{t('notes.title')}</h1>
        <Show when={isTauri()}>
          <Button size="sm" onClick={newNote}>
            {t('notes.new')}
          </Button>
        </Show>
      </div>
      <Show
        when={notes() && notes()!.length > 0}
        fallback={<p class="text-sm text-text-tertiary">{t('notes.empty')}</p>}
      >
        <ul class="flex flex-col gap-1">
          <For each={notes()}>
            {(note) => (
              <li>
                <A
                  href={`/note/${note.id}`}
                  class="focus-ring flex items-center justify-between rounded px-3 py-2 hover:bg-surface-sunken"
                >
                  <span>{note.title || t('notes.untitled')}</span>
                  <span class="text-xs text-text-tertiary">{note.type}</span>
                </A>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
