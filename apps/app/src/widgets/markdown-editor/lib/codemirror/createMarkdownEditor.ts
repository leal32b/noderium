import { history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { Strikethrough, TaskList } from '@lezer/markdown'

import { codeHighlight, mainTheme } from './editorTheme'
import { hideMarkers } from './hideMarkers'
import { shortcuts } from './shortcuts'

export type CreateMarkdownEditorOptions = {
  initialContent?: string
}

export function createMarkdownEditor(
  parent: HTMLElement,
  options: CreateMarkdownEditorOptions = {}
): () => void {
  const { initialContent = '' } = options

  const state = EditorState.create({
    doc: initialContent,
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

  const view = new EditorView({
    parent,
    state
  })

  return () => {
    view.destroy()
  }
}
