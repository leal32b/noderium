import { useLoroEditor } from '@noderium/editor/hook'
import type { Component } from 'solid-js'

import { cx, useI18n } from '@shared'

import './editor.css'

export interface EditorPaneProps {
  initialBlocks?: number
}

export const EditorPane: Component<EditorPaneProps> = (props) => {
  let mountEl!: HTMLDivElement
  const { t } = useI18n()
  const { lastLatency, peakLatency } = useLoroEditor(() => mountEl, {
    initialBlocks: props.initialBlocks ?? 100,
  })

  const overBudget = () => lastLatency() > 16

  return (
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-4 text-sm tabular-nums">
        <span class={cx('font-medium', overBudget() ? 'text-red-500' : 'text-green-600')}>
          last: {lastLatency().toFixed(2)} ms
        </span>
        <span class="text-text-secondary">peak: {peakLatency().toFixed(2)} ms</span>
        <span class="text-text-tertiary">{t('editor.subtitle')}</span>
      </div>
      <div
        ref={mountEl}
        class="rounded-lg border border-border-default bg-surface-raised p-3 text-text-primary"
      />
    </div>
  )
}
