import { A, useParams } from '@solidjs/router'
import { ArrowLeft, GraduationCap } from 'lucide-solid'
import { Show } from 'solid-js'
import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { BacklinksPanel } from '@features/notes'
import { Button, core, isTauri, notify, useI18n } from '@shared'

/** A single note: the editor bound to it (autosaving) + its backlinks. */
export const NotePage: Component = () => {
  const params = useParams<{ id: string }>()
  const { t } = useI18n()

  const addToReview = async (id: string) => {
    try {
      await core.createCard(`card-${id}`, id, 'note')
      notify.success(t('review.added'))
    } catch {
      notify.error(t('review.addError'))
    }
  }

  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-6">
      <header class="flex items-center justify-between">
        <A
          href="/notes"
          class="row-interactive -ml-2 inline-flex items-center gap-1.5 px-2 py-1 text-sm text-text-secondary"
        >
          <ArrowLeft size={15} />
          {t('notes.title')}
        </A>
        <Show when={isTauri()}>
          <Button size="sm" variant="secondary" onClick={() => addToReview(params.id)}>
            <GraduationCap size={15} />
            {t('review.add')}
          </Button>
        </Show>
      </header>
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
