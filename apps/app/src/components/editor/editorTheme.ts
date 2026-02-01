import { EditorView } from '@codemirror/view'

// Tema CM6 que só define o shell visual (fundo, texto, borda)
const editorTheme = EditorView.theme(
  {
    '.cm-content': {
      caretColor: 'var(--text-editor)'
    },
    '.cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'var(--color-bg-editor-selected)',
      color: 'var(--color-text-editor-selected)'
    },
    '&': {
      color: 'var(--color-text-editor)',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    },
    '&.cm-editor.cm-focused': {
      outline: 'none'
    }
  },
  { dark: false }
)

export { editorTheme }
