import { onCleanup, onMount } from 'solid-js'

import { createMarkdownEditor } from '../lib/codemirror'

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
    const destroy = createMarkdownEditor(containerRef, {
      initialContent: DEFAULT_CONTENT
    })
    onCleanup(destroy)
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
