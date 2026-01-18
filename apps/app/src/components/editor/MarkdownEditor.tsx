import { onMount, onCleanup } from "solid-js";
import type { Extension } from "@codemirror/state";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { languages as codeLanguages } from "@codemirror/language-data";

import type { MarkdownEditorProps } from "./types";
import { editorTheme } from "./theme";

const DEFAULT_CONTENT = "Welcome to Noderium";
import {
  codeBlockDecorations,
  hideMarkdownExceptCurrentLine,
  markdownSemanticStyles,
} from "./decorations";
import { listKeymap } from "./keybindings";

function createEditorExtensions(): Extension[] {
  return [
    history(),
    markdown({ codeLanguages }),
    codeBlockDecorations(),
    markdownSemanticStyles(),
    hideMarkdownExceptCurrentLine(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...listKeymap, ...defaultKeymap, ...historyKeymap]),
    editorTheme,
  ];
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  let containerRef!: HTMLDivElement;
  let editorView: EditorView | null = null;

  onMount(() => {
    const state = EditorState.create({
      doc: props.initialContent ?? DEFAULT_CONTENT,
      extensions: createEditorExtensions(),
    });

    editorView = new EditorView({
      state,
      parent: containerRef,
    });

    props.onReady?.(editorView);
  });

  onCleanup(() => {
    editorView?.destroy();
    editorView = null;
  });

  return (
    <div
      ref={(el) => { containerRef = el; }}
      class={props.class}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
