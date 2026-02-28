import { markdown } from '@codemirror/lang-markdown'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { Strikethrough, TaskList } from '@lezer/markdown'
import { afterEach } from 'vitest'

const createdViews: EditorView[] = []

afterEach(() => {
  for (const view of createdViews) {
    view.destroy()
  }
  createdViews.length = 0
})

const createEditorView = (doc: string, extensions: Extension[] = []): EditorView => {
  const view = new EditorView({
    parent: document.createElement('div'),
    state: EditorState.create({
      doc,
      extensions: [markdown({ extensions: [Strikethrough, TaskList] }), ...extensions]
    })
  })

  createdViews.push(view)

  return view
}

export { createEditorView }
