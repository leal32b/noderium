import "@testing-library/jest-dom/vitest";

import { createSignal } from "solid-js";
import { render, cleanup } from "@solidjs/testing-library";
import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import MarkdownEditor from "./MarkdownEditor";

async function flushUpdates(): Promise<void> {
  await Promise.resolve();
}

afterEach(cleanup);

describe("MarkdownEditor", () => {
  describe("initialization", () => {
    it("creates editor with provided content and applies class", () => {
      let capturedView: EditorView | null = null;

      const { container, unmount } = render(() => (
        <MarkdownEditor
          class="custom-class"
          initialContent="# Title"
          onReady={(view) => { capturedView = view; }}
        />
      ));

      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(capturedView).not.toBeNull();
      expect(capturedView!.state.doc.toString()).toBe("# Title");

      const destroySpy = vi.spyOn(capturedView!, "destroy");
      unmount();
      expect(destroySpy).toHaveBeenCalledOnce();
    });

    it("uses default content when initialContent is omitted", () => {
      let capturedView: EditorView | null = null;

      render(() => (
        <MarkdownEditor onReady={(view) => { capturedView = view; }} />
      ));

      expect(capturedView).not.toBeNull();
      expect(capturedView!.state.doc.toString()).toContain("Welcome to Noderium");
    });

    it("prefers value over initialContent", () => {
      let capturedView: EditorView | null = null;

      render(() => (
        <MarkdownEditor
          value="controlled"
          initialContent="ignored"
          onReady={(view) => { capturedView = view; }}
        />
      ));

      expect(capturedView).not.toBeNull();
      expect(capturedView!.state.doc.toString()).toBe("controlled");
    });
  });

  describe("controlled updates", () => {
    it("updates document when value changes", async () => {
      const [value, setValue] = createSignal("initial");
      let capturedView: EditorView | null = null;

      render(() => (
        <MarkdownEditor
          value={value()}
          onReady={(view) => { capturedView = view; }}
        />
      ));

      expect(capturedView).not.toBeNull();
      setValue("next");
      await flushUpdates();

      expect(capturedView!.state.doc.toString()).toBe("next");
    });

    it("emits onChange for user edits", () => {
      const onChange = vi.fn();
      let capturedView: EditorView | null = null;

      render(() => (
        <MarkdownEditor
          value="initial"
          onChange={onChange}
          onReady={(view) => { capturedView = view; }}
        />
      ));

      capturedView!.dispatch({
        changes: { from: 0, to: 7, insert: "updated" },
      });

      expect(onChange).toHaveBeenCalledWith("updated");
    });

    it("does not emit onChange when document is unchanged", () => {
      const onChange = vi.fn();
      let capturedView: EditorView | null = null;

      render(() => (
        <MarkdownEditor
          value="initial"
          onChange={onChange}
          onReady={(view) => { capturedView = view; }}
        />
      ));

      capturedView!.dispatch({
        selection: EditorSelection.single(3),
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
