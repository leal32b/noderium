import { EditorSelection } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

type Command = (view: EditorView) => boolean;

const wrapSelection = (view: EditorView, prefix: string, suffix: string): boolean => {
  const state = view.state;

  if (state.readOnly) return false;

  const result = state.changeByRange((range) => {
    const text = state.sliceDoc(range.from, range.to);
    const insert = prefix + text + suffix;
 
    return {
      changes: { from: range.from, to: range.to, insert },
      range: range.empty
        ? EditorSelection.cursor(range.from + prefix.length)
        : EditorSelection.range(range.from + prefix.length, range.to + prefix.length)
    };
  });

  view.dispatch(state.update(result));

  return true;
}

const toggleBold: Command = (view) => wrapSelection(view, "**", "**");
const toggleItalic: Command = (view) => wrapSelection(view, "*", "*");
const toggleInlineCode: Command = (view) => wrapSelection(view, "`", "`");

const markdownShortcutsKeymap = [
  { key: "Mod-b", run: toggleBold, preventDefault: true },
  { key: "Mod-i", run: toggleItalic, preventDefault: true },
  { key: "Mod-e", run: toggleInlineCode, preventDefault: true },
];

const shortcuts = keymap.of(markdownShortcutsKeymap);

export { shortcuts, toggleBold, toggleItalic, toggleInlineCode };
