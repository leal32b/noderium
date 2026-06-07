import { A, useParams } from '@solidjs/router'
import { Show } from 'solid-js'
import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { BacklinksPanel } from '@features/notes'
import { useI18n } from '@shared'

/** A single note: the editor bound to it (autosaving) + its backlinks. */
export const NotePage: Component = () => {
  const params = useParams<{ id: string }>()
  const { t } = useI18n()

  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-4">
      <A href="/notes" class="focus-ring text-sm text-action-primary-default hover:underline">
        ← {t('notes.title')}
      </A>
      {/* `keyed` re-mounts the editor when navigating between notes. */}
      <Show when={params.id} keyed>
        {(id) => (
          <>
            <EditorPane noteId={id} initialBlocks={0} loadPersisted autoPersist />
            <BacklinksPanel noteId={id} />
          </>
        )}
      </Show>
    </div>
  )
}
