import { createSignal, onCleanup, onMount } from 'solid-js'
import type { Component } from 'solid-js'

import { createLoroEditor, seedParagraphs } from './loro-binding'

export interface ProseMirrorEditorProps {
  /** Seed the editor with this many paragraph blocks (default 100). */
  initialBlocks?: number
}

/**
 * Minimal editor pane + live latency meter. Type and watch the meter: each
 * keystroke should stay well under the 16 ms (60fps) budget (ADR-004).
 */
export const ProseMirrorEditor: Component<ProseMirrorEditorProps> = (props) => {
  let mountEl!: HTMLDivElement
  const [last, setLast] = createSignal(0)
  const [peak, setPeak] = createSignal(0)

  onMount(() => {
    const editor = createLoroEditor(mountEl, {
      onLatency: (ms) => {
        setLast(ms)
        setPeak((p) => Math.max(p, ms))
      },
    })
    seedParagraphs(editor.view, props.initialBlocks ?? 100)
    editor.view.focus()
    onCleanup(() => editor.destroy())
  })

  return (
    <div style={{ 'font-family': 'system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.5rem',
          'font-variant-numeric': 'tabular-nums',
          color: last() > 16 ? '#dc2626' : '#16a34a',
        }}
      >
        <span>last: {last().toFixed(2)} ms</span>
        <span>peak: {peak().toFixed(2)} ms</span>
        <span style={{ color: '#71717a' }}>budget: 16 ms</span>
      </div>
      <div
        ref={mountEl}
        style={{
          border: '1px solid #e4e4e7',
          'border-radius': '6px',
          padding: '0.75rem',
          'min-height': '300px',
        }}
      />
    </div>
  )
}
