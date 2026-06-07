import { A } from '@solidjs/router'
import { Search } from 'lucide-solid'
import { createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { Button, core, Input, isTauri, useI18n } from '@shared'
import type { SearchHitDto } from '@shared'

/** Lexical search over indexed block text (FTS5), via the Rust core. */
export const SearchPanel: Component = () => {
  const { t } = useI18n()
  const [query, setQuery] = createSignal('')
  const [results, setResults] = createSignal<SearchHitDto[]>([])
  const [searched, setSearched] = createSignal(false)

  const run = async () => {
    if (!isTauri() || query().trim() === '') return
    setResults(await core.searchDetailed(query()))
    setSearched(true)
  }

  return (
    <section class="card flex flex-col gap-3 p-4">
      <div class="flex items-center gap-2 text-text-tertiary">
        <Search size={14} />
        <h2 class="text-xs font-semibold uppercase tracking-wider">{t('search.title')}</h2>
      </div>
      <div class="flex gap-2">
        <Input
          placeholder={t('search.placeholder')}
          value={query()}
          onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
            setQuery(e.currentTarget.value)
          }
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter') void run()
          }}
        />
        <Button size="md" onClick={run} disabled={!isTauri()}>
          {t('search.run')}
        </Button>
      </div>
      <Show when={searched()}>
        <p class="text-xs text-text-tertiary">
          {results().length} {t('search.matches')}
        </p>
        <ul class="flex flex-col gap-0.5">
          <For each={results()}>
            {(hit) => (
              <li>
                <A
                  href={`/note/${hit.note_id}`}
                  class="row-interactive block truncate px-2.5 py-1.5 text-sm text-text-secondary"
                >
                  {hit.text}
                </A>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  )
}
