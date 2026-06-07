import { A, useParams } from '@solidjs/router'
import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { BacklinksPanel } from '@features/notes'
import { Button, core, isTauri, useI18n } from '@shared'

/** A single note: the editor bound to it (autosaving) + its backlinks. */
export const NotePage: Component = () => {
  const params = useParams<{ id: string }>()
  const { t } = useI18n()
  const [cardStatus, setCardStatus] = createSignal('')

  const addToReview = async (id: string) => {
    try {
      await core.createCard(`card-${id}`, id, 'note')
      setCardStatus(t('review.added'))
    } catch (error) {
      setCardStatus(`error: ${String(error)}`)
    }
  }

  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-4">
      <div class="flex items-center justify-between">
        <A href="/notes" class="focus-ring text-sm text-action-primary-default hover:underline">
          ← {t('notes.title')}
        </A>
        <Show when={isTauri()}>
          <div class="flex items-center gap-2">
            <span class="text-xs text-text-tertiary">{cardStatus()}</span>
            <Button size="sm" variant="ghost" onClick={() => addToReview(params.id)}>
              {t('review.add')}
            </Button>
          </div>
        </Show>
      </div>
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
