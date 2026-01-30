import { markdown } from '@codemirror/lang-markdown'
import { EditorState, Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Strikethrough, TaskList } from '@lezer/markdown'

const createEditorView = (doc: string, extensions: Extension[] = []): EditorView => {
  return new EditorView({
    state: EditorState.create({ 
      doc,
      extensions: [markdown({ extensions: [Strikethrough, TaskList] }), ...extensions]
    }),
    parent: document.createElement("div"),
  });
}

export { createEditorView }