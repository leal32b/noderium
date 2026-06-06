import { createSignal, onCleanup, onMount } from 'solid-js'
import type { Accessor } from 'solid-js'

import { createLoroEditor, seedParagraphs } from './loro-binding'
import type { LoroEditor } from './loro-binding'

export interface UseLoroEditorOptions {
  /** Seed the editor with this many paragraph blocks. */
  initialBlocks?: number
  /** Focus the editor on mount (default true). */
  autofocus?: boolean
}

export interface UseLoroEditorResult {
  /** Latency (ms) of the most recent doc-changing keystroke. */
  lastLatency: Accessor<number>
  /** Worst latency (ms) observed this session. */
  peakLatency: Accessor<number>
  /** The underlying editor handle, available after mount. */
  editor: Accessor<LoroEditor | undefined>
}

/**
 * Solid hook that mounts a Loro-backed ProseMirror editor into the element
 * returned by `getMount`, exposing live latency signals. Plain TS (no JSX) so it
 * can be consumed by an app without re-running the Solid JSX transform on this
 * package's source.
 */
export function useLoroEditor(
  getMount: () => HTMLElement | undefined,
  options: UseLoroEditorOptions = {},
): UseLoroEditorResult {
  const [lastLatency, setLast] = createSignal(0)
  const [peakLatency, setPeak] = createSignal(0)
  const [editor, setEditor] = createSignal<LoroEditor | undefined>(undefined)

  onMount(() => {
    const mount = getMount()
    if (!mount) return

    const instance = createLoroEditor(mount, {
      onLatency: (ms) => {
        setLast(ms)
        setPeak((p) => Math.max(p, ms))
      },
    })

    if (options.initialBlocks) {
      seedParagraphs(instance.view, options.initialBlocks)
      // The seed is one bulk transaction, not a keystroke — don't let it skew
      // the meter; reset so the readout reflects real typing only.
      setLast(0)
      setPeak(0)
    }
    if (options.autofocus !== false) instance.view.focus()

    setEditor(instance)
    onCleanup(() => instance.destroy())
  })

  return { lastLatency, peakLatency, editor }
}
