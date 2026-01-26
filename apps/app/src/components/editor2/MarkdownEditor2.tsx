import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { Strikethrough, TaskList } from "@lezer/markdown";
import { onMount } from "solid-js";
import { hideMarkers } from './decorators/hideMarkers'

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
`;

const MarkdownEditor2 = () => {
  let containerRef!: HTMLDivElement;

  onMount(() => {
    const state = EditorState.create({
      doc: DEFAULT_CONTENT,
      extensions: [
        keymap.of([indentWithTab]),
        markdown({ extensions: [Strikethrough, TaskList] }),
        hideMarkers
      ]
    })

    new EditorView({
      state,
      parent: containerRef
    })
  })

  return (
    <div
      ref={(el) => { containerRef = el; }}
      style={{ width:  "100%", height: "100%" }}
    />
  )
}

/* v8 ignore next -- @preserve */
export { MarkdownEditor2 };
