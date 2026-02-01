import { history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { Strikethrough, TaskList } from '@lezer/markdown'
import { onMount } from 'solid-js'

import { editorTheme } from '@/components/editor/editorTheme'
import { hideMarkers } from '@/components/editor/hideMarkers'
import { shortcuts } from '@/components/editor/shortcuts'

const DEFAULT_CONTENT = `
# Welcome to Noderium
*EmphasisMark*
**EmphasisMark**
_EmphasisMark_
__EmphasisMark__
~~StrikethroughMark~~
[LinkMark](https://www.google.com)
- ListMark
* ListMark
+ ListMark
- [ ] TaskMarker
> QuoteMark
\`inline code\`
\`\`\`bash
  npm i
\`\`\`
[[Wikilink]]
`

const MarkdownEditor = () => {
  let containerRef!: HTMLDivElement

  onMount(() => {
    const state = EditorState.create({
      doc: DEFAULT_CONTENT,
      extensions: [
        history(),
        keymap.of([...historyKeymap, indentWithTab]),
        markdown({ extensions: [Strikethrough, TaskList] }),
        shortcuts,
        hideMarkers,
        editorTheme
      ]
    })

    new EditorView({
      parent: containerRef,
      state
    })
  })

  return (
    <div
      class="h-full w-full"
      ref={(el) => { containerRef = el }}
    />
  )
}

/* v8 ignore next -- @preserve */
export { MarkdownEditor }
