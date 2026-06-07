import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { useI18n } from '@shared'

export const EditorPage: Component = () => {
  const { t } = useI18n()
  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 class="text-2xl font-semibold tracking-tight">{t('editor.title')}</h1>
        <p class="mt-1 text-sm text-text-secondary">{t('editor.subtitle')}</p>
      </header>
      <EditorPane initialBlocks={100} showMeter />
    </div>
  )
}
