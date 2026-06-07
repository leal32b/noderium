import { exportSnapshot } from '@noderium/editor/binding'
import { useLoroEditor } from '@noderium/editor/hook'
import type { UseLoroEditorOptions } from '@noderium/editor/hook'
import { createSignal, onCleanup, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { Button, core, cx, isTauri, useI18n } from '@shared'

import './editor.css'

export interface EditorPaneProps {
  initialBlocks?: number
  /** Note this editor persists to (defaults to the spike demo note). */
  noteId?: string
  /** Re-hydrate the editor from the note's stored snapshot on open (Tauri only). */
  loadPersisted?: boolean
  /** Autosave to the core ~600ms after typing stops (the note must already exist). */
  autoPersist?: boolean
}

// Stable note id for the spike's persistence demo.
const SPIKE_NOTE_ID = 'spike-note'
const AUTOSAVE_DELAY_MS = 600

export const EditorPane: Component<EditorPaneProps> = (props) => {
  let mountEl!: HTMLDivElement
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  const { t } = useI18n()
  const noteId = () => props.noteId ?? SPIKE_NOTE_ID
  const [status, setStatus] = createSignal('')
  const [markdown, setMarkdown] = createSignal('')

  const autosaveEnabled = () => Boolean(props.autoPersist) && isTauri()

  const saveNow = async () => {
    const instance = editor()
    if (!instance) return
    try {
      setStatus(t('editor.saving'))
      await core.saveEditorSnapshot(noteId(), exportSnapshot(instance))
      setStatus(t('editor.saved'))
    } catch (error) {
      setStatus(`error: ${String(error)}`)
    }
  }

  const scheduleSave = () => {
    if (!autosaveEnabled()) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => void saveNow(), AUTOSAVE_DELAY_MS)
  }

  const editorOptions: UseLoroEditorOptions = { initialBlocks: props.initialBlocks ?? 100 }
  if (props.loadPersisted && isTauri()) {
    editorOptions.loadSnapshot = () => core.loadEditorSnapshot(noteId())
  }
  if (props.autoPersist) editorOptions.onChange = scheduleSave

  const { lastLatency, peakLatency, editor } = useLoroEditor(() => mountEl, editorOptions)

  // Flush any pending edit when leaving the page.
  onCleanup(() => {
    if (saveTimer !== undefined) {
      clearTimeout(saveTimer)
      if (autosaveEnabled()) void saveNow()
    }
  })

  const overBudget = () => lastLatency() > 16

  // Manual one-shot persist (used on the spike page, which has no note row yet).
  const persist = async () => {
    const instance = editor()
    if (!instance) return
    try {
      setStatus(t('editor.saving'))
      await core.createNote(noteId(), 'journal')
      await core.saveEditorSnapshot(noteId(), exportSnapshot(instance))
      setStatus(t('editor.saved'))
    } catch (error) {
      setStatus(`error: ${String(error)}`)
    }
  }

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
        <Show when={isTauri()}>
          <Show
            when={props.autoPersist}
            fallback={
              <Button size="sm" variant="secondary" onClick={persist}>
                Persist to core
              </Button>
            }
          >
            <span class="text-text-tertiary">{status()}</span>
          </Show>
          <Button size="sm" variant="ghost" onClick={exportMarkdown}>
            Export .md
          </Button>
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
