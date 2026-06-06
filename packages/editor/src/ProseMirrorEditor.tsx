import type { Component } from 'solid-js'

import { useLoroEditor } from './useLoroEditor'

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
  const { lastLatency, peakLatency } = useLoroEditor(() => mountEl, {
    initialBlocks: props.initialBlocks ?? 100,
  })

  return (
    <div style={{ 'font-family': 'system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.5rem',
          'font-variant-numeric': 'tabular-nums',
          color: lastLatency() > 16 ? '#dc2626' : '#16a34a',
        }}
      >
        <span>last: {lastLatency().toFixed(2)} ms</span>
        <span>peak: {peakLatency().toFixed(2)} ms</span>
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
