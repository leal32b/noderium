import type { KeyBinding } from "@codemirror/view";
import type { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { LineInfo } from "./types";
import { getLeadingWhitespace } from "./utils";

const LIST_CONTAINER_NODES: ReadonlySet<string> = new Set([
  "ListItem",
  "BulletList",
  "OrderedList",
  "Document",
]);

export function isEmptyListItem(state: EditorState, line: LineInfo): boolean {
  const tree = syntaxTree(state);
  let hasListMark = false;
  let hasContent = false;

  tree.iterate({
    from: line.from,
    to: line.to,
    enter: ({ type, from, to }) => {
      if (type.name === "ListMark") {
        hasListMark = true;
        return;
      }

      if (LIST_CONTAINER_NODES.has(type.name)) {
        return;
      }

      const isWithinLine = from >= line.from && to <= line.to;
      if (isWithinLine && state.doc.sliceString(from, to).trim()) {
        hasContent = true;
      }
    },
  });

  return hasListMark && !hasContent;
}

export function handleEnterInList(view: EditorView): boolean {
  const { state } = view;
  const { head } = state.selection.main;
  const line = state.doc.lineAt(head);

  if (!isEmptyListItem(state, line)) {
    return false;
  }

  const leadingWhitespace = getLeadingWhitespace(line.text);

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: leadingWhitespace },
    selection: { anchor: line.from + leadingWhitespace.length },
  });

  return true;
}

export const listKeymap: readonly KeyBinding[] = [
  { key: "Enter", run: handleEnterInList },
];
