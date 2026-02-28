import { EditorSelection, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { createEditorView } from './__helpers__/editorHelpers'
import { toggleBold, toggleInlineCode, toggleItalic } from '@/widgets/markdown-editor/lib/codemirror/shortcuts'

type SutTypes = {
  toggleBold: typeof toggleBold
  toggleInlineCode: typeof toggleInlineCode
  toggleItalic: typeof toggleItalic
}

const makeSut = (): SutTypes => {
  return {
    toggleBold,
    toggleInlineCode,
    toggleItalic
  }
}

describe('shortcuts', () => {
  describe('toggleBold', () => {
    it('wraps selected text with ** markers', () => {
      const { toggleBold } = makeSut()
      const view = createEditorView('hello world')

      view.dispatch({ selection: EditorSelection.single(0, 5) })
      const result = toggleBold(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('**hello** world')
      expect(view.state.selection.main.from).toBe(2)
      expect(view.state.selection.main.to).toBe(7)
    })

    it('inserts ** markers and positions cursor between them when no selection', () => {
      const { toggleBold } = makeSut()
      const view = createEditorView('hello world')

      view.dispatch({ selection: EditorSelection.cursor(6) })
      const result = toggleBold(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('hello ****world')
      expect(view.state.selection.main.from).toBe(8)
      expect(view.state.selection.main.to).toBe(8)
    })

    it('returns false and does not modify content when editor is read-only', () => {
      const { toggleBold } = makeSut()
      const readOnlyView = new EditorView({
        parent: document.createElement('div'),
        state: EditorState.create({
          doc: 'hello world',
          extensions: [EditorState.readOnly.of(true)]
        })
      })

      readOnlyView.dispatch({ selection: EditorSelection.single(0, 5) })
      const originalDoc = readOnlyView.state.doc.toString()
      const result = toggleBold(readOnlyView)

      expect(result).toBe(false)
      expect(readOnlyView.state.doc.toString()).toBe(originalDoc)
    })

    it('handles empty document', () => {
      const { toggleItalic } = makeSut()
      const view = createEditorView('')

      const result = toggleItalic(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('**')
      expect(view.state.selection.main.from).toBe(1)
      expect(view.state.selection.main.to).toBe(1)
    })
  })

  describe('toggleItalic', () => {
    it('wraps selected text with * markers', () => {
      const { toggleItalic } = makeSut()
      const view = createEditorView('hello world')

      view.dispatch({ selection: EditorSelection.single(0, 5) })
      const result = toggleItalic(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('*hello* world')
      expect(view.state.selection.main.from).toBe(1)
      expect(view.state.selection.main.to).toBe(6)
    })

    it('inserts * markers and positions cursor between them when no selection', () => {
      const { toggleItalic } = makeSut()
      const view = createEditorView('hello world')

      view.dispatch({ selection: EditorSelection.cursor(6) })
      const result = toggleItalic(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('hello **world')
      expect(view.state.selection.main.from).toBe(7)
      expect(view.state.selection.main.to).toBe(7)
    })

    it('returns false and does not modify content when editor is read-only', () => {
      const { toggleItalic } = makeSut()
      const readOnlyView = new EditorView({
        parent: document.createElement('div'),
        state: EditorState.create({
          doc: 'hello world',
          extensions: [EditorState.readOnly.of(true)]
        })
      })

      readOnlyView.dispatch({ selection: EditorSelection.single(0, 5) })
      const originalDoc = readOnlyView.state.doc.toString()
      const result = toggleItalic(readOnlyView)

      expect(result).toBe(false)
      expect(readOnlyView.state.doc.toString()).toBe(originalDoc)
    })
  })

  describe('toggleInlineCode', () => {
    it('wraps selected text with ` markers', () => {
      const { toggleInlineCode } = makeSut()
      const view = createEditorView('console.log(hello)')

      view.dispatch({ selection: EditorSelection.single(0, 11) })
      const result = toggleInlineCode(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('`console.log`(hello)')
      expect(view.state.selection.main.from).toBe(1)
      expect(view.state.selection.main.to).toBe(12)
    })

    it('inserts ` markers and positions cursor between them when no selection', () => {
      const { toggleInlineCode } = makeSut()
      const view = createEditorView('hello world')

      view.dispatch({ selection: EditorSelection.cursor(6) })
      const result = toggleInlineCode(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('hello ``world')
      expect(view.state.selection.main.from).toBe(7)
      expect(view.state.selection.main.to).toBe(7)
    })

    it('returns false and does not modify content when editor is read-only', () => {
      const { toggleInlineCode } = makeSut()
      const readOnlyView = new EditorView({
        parent: document.createElement('div'),
        state: EditorState.create({
          doc: 'hello world',
          extensions: [EditorState.readOnly.of(true)]
        })
      })

      readOnlyView.dispatch({ selection: EditorSelection.single(0, 5) })
      const originalDoc = readOnlyView.state.doc.toString()
      const result = toggleInlineCode(readOnlyView)

      expect(result).toBe(false)
      expect(readOnlyView.state.doc.toString()).toBe(originalDoc)
    })
  })

  describe('edge cases', () => {
    it('handles wrapping entire document', () => {
      const { toggleBold } = makeSut()
      const view = createEditorView('hello')

      view.dispatch({ selection: EditorSelection.single(0, 5) })
      const result = toggleBold(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('**hello**')
    })

    it('handles cursor at position 0', () => {
      const { toggleItalic } = makeSut()
      const view = createEditorView('hello')

      view.dispatch({ selection: EditorSelection.cursor(0) })
      const result = toggleItalic(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('**hello')
      expect(view.state.selection.main.from).toBe(1)
    })

    it('handles cursor at end of document', () => {
      const { toggleBold } = makeSut()
      const view = createEditorView('hello')

      view.dispatch({ selection: EditorSelection.cursor(5) })
      const result = toggleBold(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('hello****')
      expect(view.state.selection.main.from).toBe(7)
    })

    it('preserves other content when wrapping selection in middle', () => {
      const { toggleInlineCode } = makeSut()
      const view = createEditorView('before middle after')

      view.dispatch({ selection: EditorSelection.single(7, 13) })
      const result = toggleInlineCode(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('before `middle` after')
    })

    it('handles single character selection', () => {
      const { toggleBold } = makeSut()
      const view = createEditorView('hello world')

      view.dispatch({ selection: EditorSelection.single(0, 1) })
      const result = toggleBold(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('**h**ello world')
    })

    it('handles selection with newlines', () => {
      const { toggleBold } = makeSut()
      const view = createEditorView('hello\nworld')

      view.dispatch({ selection: EditorSelection.single(0, 11) })
      const result = toggleBold(view)

      expect(result).toBe(true)
      expect(view.state.doc.toString()).toBe('**hello\nworld**')
    })
  })

  describe('command return values', () => {
    it('toggleBold returns true on success', () => {
      const { toggleBold } = makeSut()
      const view = createEditorView('test')

      const result = toggleBold(view)

      expect(result).toBe(true)
    })

    it('toggleItalic returns true on success', () => {
      const { toggleItalic } = makeSut()
      const view = createEditorView('test')

      const result = toggleItalic(view)

      expect(result).toBe(true)
    })

    it('toggleInlineCode returns true on success', () => {
      const { toggleInlineCode } = makeSut()
      const view = createEditorView('test')

      const result = toggleInlineCode(view)

      expect(result).toBe(true)
    })
  })
})
