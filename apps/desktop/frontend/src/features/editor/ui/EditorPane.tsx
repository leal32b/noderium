import { exportSnapshot } from '@noderium/editor/binding'
import { useLoroEditor } from '@noderium/editor/hook'
import type { UseLoroEditorOptions } from '@noderium/editor/hook'
import { Check, FileDown, Loader2 } from 'lucide-solid'
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
  /** Show the keystroke-latency meter (spike page only). */
  showMeter?: boolean
}

const SPIKE_NOTE_ID = 'spike-note'
const AUTOSAVE_DELAY_MS = 600

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export const EditorPane: Component<EditorPaneProps> = (props) => {
  let mountEl!: HTMLDivElement
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  const { t } = useI18n()
  const noteId = () => props.noteId ?? SPIKE_NOTE_ID
  const [saveState, setSaveState] = createSignal<SaveState>('idle')
  const [markdown, setMarkdown] = createSignal('')

  const autosaveEnabled = () => Boolean(props.autoPersist) && isTauri()

  const saveNow = async () => {
    const instance = editor()
    if (!instance) return
    try {
      setSaveState('saving')
      await core.saveEditorSnapshot(noteId(), exportSnapshot(instance))
      setSaveState('saved')
    } catch {
      setSaveState('error')
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

  onCleanup(() => {
    if (saveTimer !== undefined) {
      clearTimeout(saveTimer)
      if (autosaveEnabled()) void saveNow()
    }
  })

  const overBudget = () => lastLatency() > 16

  const persist = async () => {
    const instance = editor()
    if (!instance) return
    try {
      setSaveState('saving')
      await core.createNote(noteId(), 'journal')
      await core.saveEditorSnapshot(noteId(), exportSnapshot(instance))
      setSaveState('saved')
    } catch {
      setSaveState('error')
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
    <div class="flex flex-col gap-3">
      <div class="flex min-h-7 items-center justify-between gap-3 text-sm">
        <Show when={props.showMeter}>
          <div class="flex items-center gap-3 tabular-nums">
            <span
              class={cx(
                'font-medium',
                overBudget() ? 'text-feedback-danger-text' : 'text-feedback-success-text',
              )}
            >
              {lastLatency().toFixed(2)} ms
            </span>
            <span class="text-text-tertiary">
              peak {peakLatency().toFixed(2)} ms · budget 16 ms
            </span>
          </div>
        </Show>

        <Show when={isTauri()}>
          <div class="ml-auto flex items-center gap-2">
            <Show
              when={props.autoPersist}
              fallback={
                <Button size="sm" variant="secondary" onClick={persist}>
                  {t('editor.persist')}
                </Button>
              }
            >
              <span class="flex items-center gap-1.5 text-xs text-text-tertiary">
                <Show when={saveState() === 'saving'}>
                  <Loader2 size={13} class="animate-spin" /> {t('editor.saving')}
                </Show>
                <Show when={saveState() === 'saved'}>
                  <Check size={13} class="text-feedback-success-text" /> {t('editor.saved')}
                </Show>
                <Show when={saveState() === 'error'}>
                  <span class="text-feedback-danger-text">{t('editor.saveError')}</span>
                </Show>
              </span>
            </Show>
            <Button size="sm" variant="ghost" onClick={exportMarkdown}>
              <FileDown size={15} />
              {t('editor.export')}
            </Button>
          </div>
        </Show>
      </div>

      <div
        ref={mountEl}
        class="prose-editor min-h-[280px] rounded-lg border border-border-default bg-surface-raised px-5 py-4 text-text-primary shadow-sm transition-colors focus-within:border-border-strong"
      />

      <Show when={markdown()}>
        <pre class="panel-inset overflow-auto p-4 text-xs text-text-secondary">{markdown()}</pre>
      </Show>
    </div>
  )
}
