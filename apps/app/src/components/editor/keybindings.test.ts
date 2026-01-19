import { describe, it, expect } from "vitest";
import type { Extension } from "@codemirror/state";
import { EditorState, EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";

import { isEmptyListItem, handleEnterInList, listKeymap } from "./keybindings";

function createMarkdownState(doc: string, cursorPosition?: number): EditorState {
  return EditorState.create({
    doc,
    extensions: [markdown()],
    selection: cursorPosition !== undefined ? EditorSelection.single(cursorPosition) : undefined,
  });
}

function createEditorContext(
  doc: string,
  extensions: Extension[] = []
): { view: EditorView; destroy: () => void } {
  const host = document.createElement("div");
  const view = new EditorView({
    state: EditorState.create({ doc, extensions }),
    parent: host,
  });

  return {
    view,
    destroy: () => view.destroy(),
  };
}

const FIXTURES = {
  lists: {
    emptyDash: "- ",
    emptyAsterisk: "* ",
    emptyPlus: "+ ",
    emptyOrdered: "1. ",
    emptyIndented: "  - ",
    withContent: "- item content",
    orderedWithContent: "1. first item",
    multiLine: ["- first", "- second", "- "].join("\n"),
    middleEmpty: ["- first", "- ", "- third"].join("\n"),
  },
  plainText: {
    simple: "just some text",
    regular: "regular text",
    empty: "",
  },
} as const;

describe("isEmptyListItem", () => {
  describe("empty list markers", () => {
    it.each([
      ["dash", FIXTURES.lists.emptyDash],
      ["asterisk", FIXTURES.lists.emptyAsterisk],
      ["plus", FIXTURES.lists.emptyPlus],
      ["ordered", FIXTURES.lists.emptyOrdered],
      ["indented", FIXTURES.lists.emptyIndented],
    ])("returns true for empty %s list item", (_marker, doc) => {
      const state = createMarkdownState(doc);
      const line = state.doc.line(1);

      expect(isEmptyListItem(state, line)).toBe(true);
    });

    it("returns true for empty list item in multi-line document", () => {
      const state = createMarkdownState(FIXTURES.lists.multiLine);
      const line = state.doc.line(3);

      expect(isEmptyListItem(state, line)).toBe(true);
    });
  });

  describe("non-empty content", () => {
    it.each([
      ["unordered with content", FIXTURES.lists.withContent],
      ["ordered with content", FIXTURES.lists.orderedWithContent],
      ["regular text", FIXTURES.plainText.simple],
      ["empty line", FIXTURES.plainText.empty],
    ])("returns false for %s", (_description, doc) => {
      const state = createMarkdownState(doc);
      const line = state.doc.line(1);

      expect(isEmptyListItem(state, line)).toBe(false);
    });
  });
});

describe("handleEnterInList", () => {
  describe("empty list item removal", () => {
    it("removes empty unordered list marker", () => {
      const sut = createEditorContext(FIXTURES.lists.emptyDash, [markdown()]);
      sut.view.dispatch({
        selection: EditorSelection.single(2),
      });

      const result = handleEnterInList(sut.view);

      expect(result).toBe(true);
      expect(sut.view.state.doc.toString()).toBe("");
      expect(sut.view.state.selection.main.head).toBe(0);

      sut.destroy();
    });

    it("removes empty ordered list marker", () => {
      const sut = createEditorContext(FIXTURES.lists.emptyOrdered, [markdown()]);
      sut.view.dispatch({
        selection: EditorSelection.single(3),
      });

      const result = handleEnterInList(sut.view);

      expect(result).toBe(true);
      expect(sut.view.state.doc.toString()).toBe("");
      expect(sut.view.state.selection.main.head).toBe(0);

      sut.destroy();
    });

    it("preserves indentation when removing list marker", () => {
      const sut = createEditorContext(FIXTURES.lists.emptyIndented, [markdown()]);
      sut.view.dispatch({
        selection: EditorSelection.single(4),
      });

      const result = handleEnterInList(sut.view);

      expect(result).toBe(true);
      expect(sut.view.state.doc.toString()).toBe("  ");
      expect(sut.view.state.selection.main.head).toBe(2);

      sut.destroy();
    });

    it("handles empty list item in middle of document", () => {
      const doc = FIXTURES.lists.middleEmpty;
      const emptyItemStart = doc.indexOf("- \n") + 2;

      const sut = createEditorContext(doc, [markdown()]);
      sut.view.dispatch({
        selection: EditorSelection.single(emptyItemStart),
      });

      const result = handleEnterInList(sut.view);

      expect(result).toBe(true);
      expect(sut.view.state.doc.toString()).toBe("- first\n\n- third");

      sut.destroy();
    });
  });

  describe("non-empty content passthrough", () => {
    it("returns false for list item with content", () => {
      const sut = createEditorContext(FIXTURES.lists.withContent, [markdown()]);
      sut.view.dispatch({
        selection: EditorSelection.single(6),
      });

      const result = handleEnterInList(sut.view);

      expect(result).toBe(false);
      expect(sut.view.state.doc.toString()).toBe(FIXTURES.lists.withContent);

      sut.destroy();
    });

    it("returns false for regular text", () => {
      const sut = createEditorContext(FIXTURES.plainText.regular, [markdown()]);
      sut.view.dispatch({
        selection: EditorSelection.single(12),
      });

      const result = handleEnterInList(sut.view);

      expect(result).toBe(false);
      expect(sut.view.state.doc.toString()).toBe(FIXTURES.plainText.regular);

      sut.destroy();
    });
  });
});

describe("listKeymap", () => {
  it("exports Enter key binding", () => {
    expect(listKeymap).toHaveLength(1);
    expect(listKeymap[0].key).toBe("Enter");
    expect(listKeymap[0].run).toBe(handleEnterInList);
  });
});
