import { createSignal, onMount, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { BacklinksPanel, SearchPanel } from '@features/notes'
import { core, isTauri, useI18n } from '@shared'

const today = (): string => new Date().toISOString().slice(0, 10)

/**
 * The journal: today's daily note (FR-1) with the block editor bound to it, plus
 * search and a backlinks pane. The methodology's entry point.
 *
 * The note id is resolved before the editor mounts, so the editor can re-hydrate
 * from that note's stored snapshot.
 */
export const JournalPage: Component = () => {
  const { t } = useI18n()
  const date = today()
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
    <div class="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 class="text-xl font-semibold">{t('journal.title')}</h1>
        <p class="text-sm text-text-tertiary">{date}</p>
      </div>
      <Show when={noteId()}>
        {(id) => (
          <>
            <EditorPane noteId={id()} initialBlocks={0} loadPersisted />
            <BacklinksPanel noteId={id()} />
          </>
        )}
      </Show>
      <SearchPanel />
    </div>
  )
}
