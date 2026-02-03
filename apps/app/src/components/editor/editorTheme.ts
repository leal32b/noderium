import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

const inlineCodeTheme = HighlightStyle.define([{
  backgroundColor: 'var(--color-bg-editor-selected)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  tag: tags.monospace
}])
const codeHighlight = syntaxHighlighting(inlineCodeTheme)

const mainTheme = EditorView.theme(
  {
    '.cm-content': {
      caretColor: 'var(--text-editor)',
      fontFamily: 'sans-serif'
    },
    '.cm-gutters': {
      color: 'red'
    },
    '.cm-line.cm-code-block': {
      fontFamily: 'ui-monospace'
    },
    '.cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'var(--color-bg-editor-selected)',
      color: 'var(--color-text-editor-selected)'
    },
    '&': {
      color: 'var(--color-text-editor)'
    },
    '&.cm-editor.cm-focused': {
      outline: 'none'
    }
  },
  { dark: false }
)

export { codeHighlight, mainTheme }
