import { type Component } from 'solid-js'

import { AppShell } from '@/widgets/app-shell'
import { MarkdownEditor } from '@/widgets/markdown-editor'

const NotePage: Component = () => {
  return (
    <AppShell>
      <MarkdownEditor />
    </AppShell>
  )
}

/* v8 ignore next -- @preserve */
export { NotePage }
