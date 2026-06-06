import { exportSnapshot } from '@noderium/editor/binding'
import { useLoroEditor } from '@noderium/editor/hook'
import type { UseLoroEditorOptions } from '@noderium/editor/hook'
import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { Button, core, cx, isTauri, useI18n } from '@shared'

import './editor.css'

export interface EditorPaneProps {
  initialBlocks?: number
  /** Note this editor persists to (defaults to the spike demo note). */
  noteId?: string
  /** Re-hydrate the editor from the note's stored snapshot on open (Tauri only). */
  loadPersisted?: boolean
}

// Stable note id for the spike's persistence demo.
const SPIKE_NOTE_ID = 'spike-note'

export const EditorPane: Component<EditorPaneProps> = (props) => {
  let mountEl!: HTMLDivElement
  const { t } = useI18n()
  const noteId = () => props.noteId ?? SPIKE_NOTE_ID
  const editorOptions: UseLoroEditorOptions = { initialBlocks: props.initialBlocks ?? 100 }
  if (props.loadPersisted && isTauri()) {
    editorOptions.loadSnapshot = () => core.loadEditorSnapshot(noteId())
  }
  const { lastLatency, peakLatency, editor } = useLoroEditor(() => mountEl, editorOptions)
  const [status, setStatus] = createSignal('')
  const [markdown, setMarkdown] = createSignal('')

  const overBudget = () => lastLatency() > 16

  // Flush the live JS Loro doc to the Rust core (ADR-005). Only meaningful when
  // running inside Tauri; in the browser there is no core to talk to.
  const persist = async () => {
    const instance = editor()
    if (!instance) return
    try {
      setStatus('saving…')
      await core.createNote(noteId(), 'journal')
      await core.saveEditorSnapshot(noteId(), exportSnapshot(instance))
      setStatus('saved to core ✓')
    } catch (error) {
      setStatus(`error: ${String(error)}`)
    }
  }

  // Export the persisted note as markdown (FR-9). Doubles as a visual check that
  // data survived — including across an app restart (on-disk SQLite).
  const exportMarkdown = async () => {
    try {
      setMarkdown(await core.exportNoteMarkdown(noteId()))
    } catch (error) {
      setMarkdown(`error: ${String(error)}`)
    }
  }

  return (
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-4 text-sm tabular-nums">
        <span class={cx('font-medium', overBudget() ? 'text-red-500' : 'text-green-600')}>
          last: {lastLatency().toFixed(2)} ms
        </span>
        <span class="text-text-secondary">peak: {peakLatency().toFixed(2)} ms</span>
        <span class="text-text-tertiary">{t('editor.subtitle')}</span>
        <Show when={isTauri()}>
          <Button size="sm" variant="secondary" onClick={persist}>
            Persist to core
          </Button>
          <Button size="sm" variant="ghost" onClick={exportMarkdown}>
            Export .md
          </Button>
          <span class="text-text-tertiary">{status()}</span>
        </Show>
      </div>
      <div
        ref={mountEl}
        class="rounded-lg border border-border-default bg-surface-raised p-3 text-text-primary"
      />
      <Show when={markdown()}>
        <pre class="overflow-auto rounded-lg border border-border-default bg-surface-sunken p-3 text-xs text-text-secondary">
          {markdown()}
        </pre>
      </Show>
    </div>
  )
}
