import { createSignal, onMount } from 'solid-js'
import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { BacklinksPanel, SearchPanel } from '@features/notes'
import { core, isTauri, useI18n } from '@shared'

const today = (): string => new Date().toISOString().slice(0, 10)

/**
 * The journal: today's daily note (FR-1) with the block editor bound to it, plus
 * search and a backlinks pane. The methodology's entry point.
 */
export const JournalPage: Component = () => {
  const { t } = useI18n()
  const date = today()
  const [noteId, setNoteId] = createSignal('spike-note')

  onMount(async () => {
    if (!isTauri()) return
    try {
      setNoteId(await core.openJournal(date))
    } catch {
      /* not running under Tauri / core unavailable */
    }
  })

  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 class="text-xl font-semibold">{t('journal.title')}</h1>
        <p class="text-sm text-text-tertiary">{date}</p>
      </div>
      <EditorPane noteId={noteId()} initialBlocks={0} />
      <SearchPanel />
      <BacklinksPanel noteId={noteId()} />
    </div>
  )
}
