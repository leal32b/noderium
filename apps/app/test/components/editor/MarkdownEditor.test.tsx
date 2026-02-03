import { language } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { fireEvent, render, screen } from '@solidjs/testing-library'

import { MarkdownEditor } from '@/components/editor/MarkdownEditor'

type SutTypes = {
  container: HTMLElement
  editor: HTMLElement
  view: EditorView
}

const makeSut = (): SutTypes => {
  const { container } = render(() => <MarkdownEditor />)
  const editor = screen.getByRole('textbox')
  const view = EditorView.findFromDOM(editor)!

  return { container, editor, view }
}

describe('MarkdownEditor', () => {
  it('creates a new editor view', () => {
    const { container } = makeSut()
    expect(container.firstElementChild).toBeDefined()
  })

  it('enables markdown language support', () => {
    const { view } = makeSut()
    expect(view?.state.facet(language)?.name).toBe('markdown')
  })

  it('indents with tab key', () => {
    const { editor, view } = makeSut()
    const docBefore = view.state.doc.toString()

    fireEvent.keyDown(editor, { bubbles: true, key: 'Tab' })

    expect(view.state.doc.toString()).not.toBe(docBefore)
    expect(view.state.doc.line(1).text).toMatch(/^\s+/)
  })
})
