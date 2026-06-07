import { A } from '@solidjs/router'
import { Link2 } from 'lucide-solid'
import { createEffect, createSignal, For, Show } from 'solid-js'
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
    <section class="card flex flex-col gap-3 p-4">
      <div class="flex items-center gap-2 text-text-tertiary">
        <Link2 size={14} />
        <h2 class="text-xs font-semibold uppercase tracking-wider">{t('backlinks.title')}</h2>
      </div>
      <Show
        when={links().length > 0}
        fallback={<p class="text-sm text-text-tertiary">{t('backlinks.empty')}</p>}
      >
        <ul class="flex flex-col gap-0.5">
          <For each={links()}>
            {(link) => (
              <li>
                <A
                  href={`/note/${link.source_note_id}`}
                  class="row-interactive block truncate px-2.5 py-1.5 text-sm text-text-secondary"
                >
                  {link.text}
                </A>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  )
}
