import { EditorState, EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";

import { isEmptyListItem, handleEnterInList } from "./keybindings";

function createEditorView(doc: string): EditorView {
  return new EditorView({
    state: EditorState.create({ doc, extensions: [markdown()] }),
    parent: document.createElement("div"),
  });
}

describe("isEmptyListItem", () => {
  it("returns true for empty list markers", () => {
    const emptyMarkers = ["- ", "* ", "+ ", "1. ", "  - "];

    for (const doc of emptyMarkers) {
      const state = EditorState.create({ doc, extensions: [markdown()] });
      const line = state.doc.line(1);
      expect(isEmptyListItem(state, line)).toBe(true);
    }
  });

  it("returns true for empty list item in multi-line document", () => {
    const doc = "- first\n- second\n- ";
    const state = EditorState.create({ doc, extensions: [markdown()] });
    const line = state.doc.line(3);

    expect(isEmptyListItem(state, line)).toBe(true);
  });

  it("returns false for list items with content", () => {
    const doc = "- item content";
    const state = EditorState.create({ doc, extensions: [markdown()] });
    const line = state.doc.line(1);

    expect(isEmptyListItem(state, line)).toBe(false);
  });

  it("returns false for plain text", () => {
    const doc = "just some text";
    const state = EditorState.create({ doc, extensions: [markdown()] });
    const line = state.doc.line(1);

    expect(isEmptyListItem(state, line)).toBe(false);
  });
});

describe("handleEnterInList", () => {
  it("removes empty unordered list marker", () => {
    const view = createEditorView("- ");
    view.dispatch({ selection: EditorSelection.single(2) });

    expect(handleEnterInList(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("");

    view.destroy();
  });

  it("removes empty ordered list marker", () => {
    const view = createEditorView("1. ");
    view.dispatch({ selection: EditorSelection.single(3) });

    expect(handleEnterInList(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("");

    view.destroy();
  });

  it("preserves indentation when removing list marker", () => {
    const view = createEditorView("  - ");
    view.dispatch({ selection: EditorSelection.single(4) });

    expect(handleEnterInList(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("  ");

    view.destroy();
  });

  it("handles empty list item in middle of document", () => {
    const view = createEditorView("- first\n- \n- third");
    view.dispatch({ selection: EditorSelection.single(10) }); // cursor after "- " on line 2

    expect(handleEnterInList(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("- first\n\n- third");

    view.destroy();
  });

  it("returns false for list item with content", () => {
    const view = createEditorView("- item content");
    view.dispatch({ selection: EditorSelection.single(6) });

    expect(handleEnterInList(view)).toBe(false);
    expect(view.state.doc.toString()).toBe("- item content");

    view.destroy();
  });

  it("returns false for regular text", () => {
    const view = createEditorView("regular text");
    view.dispatch({ selection: EditorSelection.single(5) });

    expect(handleEnterInList(view)).toBe(false);

    view.destroy();
  });
});
