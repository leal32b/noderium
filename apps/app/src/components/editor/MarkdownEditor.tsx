import { createEffect, onMount, onCleanup } from "solid-js";
import type { Extension } from "@codemirror/state";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { languages as codeLanguages } from "@codemirror/language-data";

import type { MarkdownEditorProps } from "./types";
import { editorTheme } from "./theme";

const DEFAULT_CONTENT = "# Welcome to Noderium";
import {
  codeBlockDecorations,
  hideMarkdownExceptCurrentLine,
  markdownSemanticStyles,
} from "./decorations";
import { listKeymap } from "./keybindings";

function createOnChangeListener(
  onChange: (value: string) => void,
  isApplyingExternal: { value: boolean }
): Extension {
  return EditorView.updateListener.of((update) => {
    if (update.docChanged && !isApplyingExternal.value) {
      onChange(update.state.doc.toString());
    }
  });
}

function createEditorExtensions(
  onChange: ((value: string) => void) | undefined,
  isApplyingExternal: { value: boolean }
): Extension[] {
  const extensions: Extension[] = [
    history(),
    markdown({ codeLanguages }),
    codeBlockDecorations(),
    markdownSemanticStyles(),
    hideMarkdownExceptCurrentLine(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...listKeymap, ...defaultKeymap, ...historyKeymap]),
    editorTheme,
  ];

  if (onChange) {
    extensions.push(createOnChangeListener(onChange, isApplyingExternal));
  }

  return extensions;
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  let containerRef!: HTMLDivElement;
  let editorView: EditorView | null = null;
  const isApplyingExternal = { value: false };

  onMount(() => {
    const state = EditorState.create({
      doc: props.value ?? props.initialContent ?? DEFAULT_CONTENT,
      extensions: createEditorExtensions(props.onChange, isApplyingExternal),
    });

    editorView = new EditorView({
      state,
      parent: containerRef,
    });

    props.onReady?.(editorView);
  });

  createEffect(() => {
    if (!editorView || props.value === undefined) {
      return;
    }

    const currentValue = editorView.state.doc.toString();
    if (currentValue === props.value) {
      return;
    }

    const clampedHead = Math.min(
      editorView.state.selection.main.head,
      props.value.length
    );

    isApplyingExternal.value = true;
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: props.value },
      selection: EditorSelection.single(clampedHead),
    });
    isApplyingExternal.value = false;
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
/* c8 ignore start */
}
/* c8 ignore stop */
