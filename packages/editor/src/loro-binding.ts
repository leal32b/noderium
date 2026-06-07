import { LoroDoc } from 'loro-crdt'
import { LoroSyncPlugin, LoroUndoPlugin } from 'loro-prosemirror'
import type { LoroDocType } from 'loro-prosemirror'
import { baseKeymap } from 'prosemirror-commands'
import { keymap } from 'prosemirror-keymap'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import { schema } from './schema'

export interface LoroEditor {
  view: EditorView
  /** The Loro CRDT document — source of truth (ADR-001). */
  doc: LoroDoc
  destroy: () => void
}

export interface CreateLoroEditorOptions {
  /** Called after each doc-changing transaction with its apply→render time (ms). */
  onLatency?: (ms: number) => void
  /** Called after each doc-changing transaction (for autosave/debounce). */
  onChange?: () => void
  /** A previously exported snapshot to re-hydrate the document from. */
  snapshot?: Uint8Array
}

/**
 * Wire a ProseMirror editor to a Loro document via loro-prosemirror. The live
 * Loro doc lives here (JS/WASM), attached to the editor — no IPC per keystroke
 * (ADR-005). `dispatchTransaction` is instrumented to measure per-keystroke
 * latency (apply + Loro sync plugin + DOM patch).
 */
export function createLoroEditor(
  mount: HTMLElement,
  options: CreateLoroEditorOptions = {},
): LoroEditor {
  const doc = new LoroDoc()
  // Re-hydrate from a stored snapshot before the sync plugin builds the PM doc,
  // so the editor opens with the note's persisted content (Loro is cross-session).
  if (options.snapshot) {
    doc.import(options.snapshot)
  }

  const state = EditorState.create({
    schema,
    plugins: [
      LoroSyncPlugin({ doc: doc as unknown as LoroDocType }),
      LoroUndoPlugin({ doc: doc as unknown as LoroDocType }),
      keymap(baseKeymap),
    ],
  })

  const view: EditorView = new EditorView(mount, {
    state,
    dispatchTransaction(tr) {
      const start = performance.now()
      const next = view.state.apply(tr)
      view.updateState(next)
      if (tr.docChanged) {
        options.onLatency?.(performance.now() - start)
        options.onChange?.()
      }
    },
  })

  return {
    view,
    doc,
    destroy: () => view.destroy(),
  }
}

/** Replace the document with `count` paragraph blocks ("Block N"), one local op. */
export function seedParagraphs(view: EditorView, count: number): void {
  const { schema: s } = view.state
  const paragraphs = Array.from({ length: count }, (_, i) =>
    s.nodes['paragraph']!.create({ id: `b${i}`, blockType: 'paragraph' }, s.text(`Block ${i}`)),
  )
  const docNode = s.nodes['doc']!.create(null, paragraphs)
  const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, docNode.content)
  view.dispatch(tr)
}

/** Export the editor's Loro document as a snapshot (the bytes sent to the Rust
 *  core to persist + index; loro-prosemirror-shaped). */
export function exportSnapshot(editor: LoroEditor): Uint8Array {
  return editor.doc.export({ mode: 'snapshot' })
}

/** Document position just inside the content of block `index`. */
export function positionInsideBlock(view: EditorView, index: number): number {
  let offset = 0
  for (let i = 0; i < index; i++) offset += view.state.doc.child(i).nodeSize
  return offset + 1
}
