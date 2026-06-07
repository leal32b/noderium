import { createSignal, onMount, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { BacklinksPanel } from '@features/notes'
import { core, isTauri, useI18n } from '@shared'

const todayIso = (): string => new Date().toISOString().slice(0, 10)

/**
 * The journal: today's daily note (FR-1) with the block editor bound to it, plus
 * search and a backlinks pane. The methodology's entry point.
 */
export const JournalPage: Component = () => {
  const { t, formatDate } = useI18n()
  const date = todayIso()
  const [noteId, setNoteId] = createSignal<string | undefined>()

  onMount(async () => {
    if (!isTauri()) {
      setNoteId('spike-note')
      return
    }
    try {
      setNoteId(await core.openJournal(date))
    } catch {
      setNoteId(`journal-${date}`)
    }
  })

  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 class="text-3xl font-semibold tracking-tight first-letter:uppercase">
          {formatDate(new Date(`${date}T00:00:00`), { dateStyle: 'full' })}
        </h1>
        <p class="mt-1 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('journal.title')}
        </p>
      </header>
      <Show when={noteId()}>
        {(id) => (
          <>
            <EditorPane noteId={id()} initialBlocks={0} loadPersisted autoPersist />
            <BacklinksPanel noteId={id()} />
          </>
        )}
      </Show>
    </div>
  )
}
