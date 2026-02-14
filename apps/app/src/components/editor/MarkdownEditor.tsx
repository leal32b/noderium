import { history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { Strikethrough, TaskList } from '@lezer/markdown'
import { onMount } from 'solid-js'

import { codeHighlight, mainTheme } from '@/components/editor/editorTheme'
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
        markdown({ extensions: [Strikethrough, TaskList] }),
        EditorView.lineWrapping,
        keymap.of([...historyKeymap, indentWithTab]),
        history(),
        mainTheme,
        codeHighlight,
        shortcuts,
        hideMarkers
      ]
    })

    new EditorView({
      parent: containerRef,
      state
    })
  })

  return (
    <div
      class="flex-1 min-h-0"
      ref={(el) => { containerRef = el }}
    />
  )
}

/* v8 ignore next -- @preserve */
export { MarkdownEditor }
