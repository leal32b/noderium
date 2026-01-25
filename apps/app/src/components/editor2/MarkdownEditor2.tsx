import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { onMount } from "solid-js";

const DEFAULT_CONTENT = `# Welcome to Noderium`;

const MarkdownEditor2 = () => {
  let containerRef!: HTMLDivElement;

  onMount(() => {
    const state = EditorState.create({
      doc: DEFAULT_CONTENT
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
