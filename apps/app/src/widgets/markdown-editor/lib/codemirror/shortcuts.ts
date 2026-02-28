import { EditorSelection } from '@codemirror/state'
import { type EditorView, keymap } from '@codemirror/view'

type Command = (view: EditorView) => boolean

const wrapSelection = (view: EditorView, prefix: string, suffix: string): boolean => {
  const state = view.state

  if (state.readOnly) return false

  const result = state.changeByRange((range) => {
    const text = state.sliceDoc(range.from, range.to)
    const insert = prefix + text + suffix

    return {
      changes: { from: range.from, insert, to: range.to },
      range: range.empty
        ? EditorSelection.cursor(range.from + prefix.length)
        : EditorSelection.range(range.from + prefix.length, range.to + prefix.length)
    }
  })

  view.dispatch(state.update(result))

  return true
}

const toggleBold: Command = view => wrapSelection(view, '**', '**')
const toggleItalic: Command = view => wrapSelection(view, '*', '*')
const toggleInlineCode: Command = view => wrapSelection(view, '`', '`')

const markdownShortcutsKeymap = [
  { key: 'Mod-b', preventDefault: true, run: toggleBold },
  { key: 'Mod-i', preventDefault: true, run: toggleItalic },
  { key: 'Mod-e', preventDefault: true, run: toggleInlineCode }
]

const shortcuts = keymap.of(markdownShortcutsKeymap)

export { shortcuts, toggleBold, toggleInlineCode, toggleItalic }
