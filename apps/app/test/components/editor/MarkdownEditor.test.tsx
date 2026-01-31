import { language } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { render } from '@solidjs/testing-library'

import { MarkdownEditor } from '../../../src/components/editor/MarkdownEditor'

type SutTypes = {
  container: HTMLElement
  content: HTMLElement
  editor: HTMLElement
  view: EditorView
}

const makeSut = (): SutTypes => {
  const { container } = render(() => <MarkdownEditor />)
  const editor = container.querySelector('.cm-editor') as HTMLElement
  const view = EditorView.findFromDOM(editor)!
  const content = editor.querySelector('.cm-content') as HTMLElement

  return { container, content, editor, view }
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
    const { content, view } = makeSut()
    const docBefore = view.state.doc.toString()

    content.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }))

    expect(view.state.doc.toString()).not.toBe(docBefore)
    expect(view.state.doc.line(1).text).toMatch(/^\s+/)
  })
})
