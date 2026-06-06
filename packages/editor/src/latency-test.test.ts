import { describe, expect, it } from 'vitest'

import { createLoroEditor, positionInsideBlock, seedParagraphs } from './loro-binding'

const BLOCKS = 100
const TARGET_BLOCK = 50
const KEYSTROKES = 100
const BUDGET_MS = 16 // 60fps = 16.67ms/frame (ADR-004)

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[index] ?? 0
}

describe('editor latency spike (ProseMirror + loro-prosemirror)', () => {
  it(`keeps p95 keystroke latency < ${BUDGET_MS}ms typing in block ${TARGET_BLOCK} of ${BLOCKS}`, () => {
    const mount = document.createElement('div')
    document.body.appendChild(mount)

    const samples: number[] = []
    const editor = createLoroEditor(mount, { onLatency: (ms) => samples.push(ms) })

    // Setup: BLOCKS blocks in the Loro tree.
    seedParagraphs(editor.view, BLOCKS)
    expect(editor.view.state.doc.childCount).toBe(BLOCKS)
    samples.length = 0 // discard the one-shot seed transaction

    // Test: type KEYSTROKES characters into block TARGET_BLOCK, measuring each.
    let pos = positionInsideBlock(editor.view, TARGET_BLOCK)
    for (let i = 0; i < KEYSTROKES; i++) {
      const tr = editor.view.state.tr.insertText('x', pos)
      editor.view.dispatch(tr)
      pos += 1
    }

    expect(samples.length).toBe(KEYSTROKES)

    const avg = samples.reduce((a, b) => a + b, 0) / samples.length
    const p95 = percentile(samples, 95)
    const max = Math.max(...samples)

    // Surfaced in the test output and copied into README findings.
    console.log(
      `[latency] n=${samples.length} avg=${avg.toFixed(3)}ms p95=${p95.toFixed(3)}ms max=${max.toFixed(3)}ms (budget ${BUDGET_MS}ms)`,
    )

    editor.destroy()
    mount.remove()

    expect(p95).toBeLessThan(BUDGET_MS)
  })
})
