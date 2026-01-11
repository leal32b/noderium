import { onMount, onCleanup } from "solid-js";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";

interface MarkdownEditorProps {
  initialContent?: string;
  class?: string;
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  let editorContainer!: HTMLDivElement;
  let view: EditorView | null = null;

  onMount(() => {
    // Minimal optimized editor configuration
    const state = EditorState.create({
      doc: props.initialContent || "# Welcome to Noderium\n\nStart writing your notes...",
      extensions: [
        history(),
        markdown(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-scroller": {
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
          },
          ".cm-content": {
            minHeight: "100%",
            padding: "1rem",
          },
          ".cm-editor": {
            height: "100%",
          },
        }),
      ],
    });

    view = new EditorView({
      state,
      parent: editorContainer,
    });
  });

  onCleanup(() => {
    view?.destroy();
  });

  return (
    <div
      ref={editorContainer}
      class={props.class}
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
}
