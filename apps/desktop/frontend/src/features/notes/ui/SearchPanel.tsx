import { createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { Button, core, Input, isTauri, useI18n } from '@shared'

/** Lexical search over indexed block text (FTS5), via the Rust core. */
export const SearchPanel: Component = () => {
  const { t } = useI18n()
  const [query, setQuery] = createSignal('')
  const [results, setResults] = createSignal<string[]>([])
  const [searched, setSearched] = createSignal(false)

  const run = async () => {
    if (!isTauri() || query().trim() === '') return
    setResults(await core.search(query()))
    setSearched(true)
  }

  return (
    <section class="flex flex-col gap-2 rounded-lg border border-border-default p-3">
      <h2 class="text-sm font-semibold">{t('search.title')}</h2>
      <div class="flex gap-2">
        <Input
          placeholder={t('search.placeholder')}
          value={query()}
          onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
            setQuery(e.currentTarget.value)
          }
        />
        <Button size="sm" onClick={run} disabled={!isTauri()}>
          {t('search.run')}
        </Button>
      </div>
      <Show when={searched()}>
        <p class="text-xs text-text-tertiary">
          {results().length} {t('search.matches')}
        </p>
        <For each={results()}>{(id) => <code class="text-xs text-text-secondary">{id}</code>}</For>
      </Show>
    </section>
  )
}
