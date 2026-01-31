import { history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { Strikethrough, TaskList } from '@lezer/markdown'
import { onMount } from 'solid-js'

import { hideMarkers } from './hideMarkers'
import { shortcuts } from './shortcuts'

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
      ref={(el) => { containerRef = el }}
      style={{ height: '100%', width: '100%' }}
    />
  )
}

/* v8 ignore next -- @preserve */
export { MarkdownEditor }
