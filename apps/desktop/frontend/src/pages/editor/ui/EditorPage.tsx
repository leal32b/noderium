import type { Component } from 'solid-js'

import { EditorPane } from '@features/editor'
import { useI18n } from '@shared'

export const EditorPage: Component = () => {
  const { t } = useI18n()
  return (
    <div class="mx-auto max-w-3xl">
      <h1 class="mb-3 text-xl font-semibold">{t('editor.title')}</h1>
      <EditorPane initialBlocks={100} />
    </div>
  )
}
