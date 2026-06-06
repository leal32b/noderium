import { createEffect, For, Show } from 'solid-js'
import { createSignal } from 'solid-js'
import type { Component } from 'solid-js'

import { core, isTauri, useI18n } from '@shared'
import type { BacklinkDto } from '@shared'

export interface BacklinksPanelProps {
  noteId: string
}

/** Backlinks pane (FR-4): blocks elsewhere that `[[link]]` to this note. */
export const BacklinksPanel: Component<BacklinksPanelProps> = (props) => {
  const { t } = useI18n()
  const [links, setLinks] = createSignal<BacklinkDto[]>([])

  createEffect(() => {
    const id = props.noteId
    if (!isTauri()) return
    void core.backlinks(id).then(setLinks)
  })

  return (
    <section class="flex flex-col gap-2 rounded-lg border border-border-default p-3">
      <h2 class="text-sm font-semibold">{t('backlinks.title')}</h2>
      <Show
        when={links().length > 0}
        fallback={<p class="text-xs text-text-tertiary">{t('backlinks.empty')}</p>}
      >
        <For each={links()}>
          {(link) => (
            <div class="text-xs text-text-secondary">
              <span class="text-text-tertiary">{link.source_note_id}</span> — {link.text}
            </div>
          )}
        </For>
      </Show>
    </section>
  )
}
