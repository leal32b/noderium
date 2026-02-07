import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

const inlineCodeTheme = HighlightStyle.define([{
  backgroundColor: 'var(--color-inline)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '14px',
  tag: tags.monospace
}])
const codeHighlight = syntaxHighlighting(inlineCodeTheme)

const mainTheme = EditorView.theme(
  {
    '.cm-content': {
      caretColor: 'var(--color-primary-content)',
      fontFamily: 'sans-serif'
    },
    '.cm-line.cm-code-block': {
      fontFamily: 'ui-monospace'
    },
    '.cm-selectionBackground, .cm-content ::selection': {
    },
    '&': {
      color: 'var(--color-base-content)',
      maxWidth: '720px',
      width: '100%'
    },
    '&.cm-editor.cm-focused': {
      outline: 'none'
    }
  },
  { dark: false }
)

export { codeHighlight, mainTheme }
