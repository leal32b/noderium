import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditorSelection, EditorState, Extension } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";

const mockOpenUrl = vi.fn(() => Promise.resolve());

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: mockOpenUrl,
}));

import {
  codeBlockDecorations,
  computeInlineCodeRange,
  hideMarkdownExceptCurrentLine,
  isLinkWidgetClick,
  linkDecorations,
  markdownSemanticStyles,
} from "./decorations";

interface DecorationPlugin {
  decorations: typeof Decoration.none;
  update: (update: unknown) => void;
}

function createEditorView(doc: string, extensions: Extension[] = []): EditorView {
  return new EditorView({
    state: EditorState.create({ doc, extensions }),
    parent: document.createElement("div"),
  });
}

function getPlugin<T>(view: EditorView, extension: T): DecorationPlugin {
  const plugin = view.plugin(extension as unknown as ViewPlugin<DecorationPlugin>);
  if (!plugin) throw new Error("Plugin not available");
  return plugin;
}

function collectDecorationsByClass(
  plugin: DecorationPlugin,
  doc: EditorState["doc"],
  className: string
): string[] {
  const results: string[] = [];
  plugin.decorations.between(0, doc.length, (from, to, deco) => {
    if (deco.spec?.class === className) {
      results.push(doc.sliceString(from, to));
    }
  });
  return results;
}

function queryLines(view: EditorView): HTMLDivElement[] {
  return Array.from(view.dom.querySelectorAll<HTMLDivElement>(".cm-line"));
}

async function tick(): Promise<void> {
  await Promise.resolve();
}

describe("hideMarkdownExceptCurrentLine", () => {
  describe("marker visibility", () => {
    it("hides markdown markers outside the active line", async () => {
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView("# First heading\n# Second heading", [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const lines = queryLines(view);
      expect(lines[0].querySelectorAll(".cm-hide-markdown").length).toBeGreaterThan(0);
      expect(lines[1].querySelectorAll(".cm-hide-markdown").length).toBe(0);

      view.destroy();
    });

    it("hides inline code markers outside the active line", async () => {
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView("Line with `code` here\nSecond line", [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const hidden = collectDecorationsByClass(plugin, view.state.doc, "cm-hide-markdown");
      expect(hidden).toContain("`");

      view.destroy();
    });

    it("hides fenced code markers outside the active line", async () => {
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView("```js\nconst x = 1;\n```", [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const hidden = collectDecorationsByClass(plugin, view.state.doc, "cm-hide-markdown-fence");
      expect(hidden).toContain("```");

      view.destroy();
    });

    it("hides tilde fenced markers outside the active line", async () => {
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView("~~~js\nconst x = 1;\n~~~", [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const hidden = collectDecorationsByClass(plugin, view.state.doc, "cm-hide-markdown-fence");
      expect(hidden).toContain("~~~");

      view.destroy();
    });

    it("shows fence markers on current line", async () => {
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView("```js\nconst x = 1;\n```", [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(1).from) });
      await tick();

      const markers = collectDecorationsByClass(plugin, view.state.doc, "cm-md-marker");
      expect(markers).toContain("```");

      view.destroy();
    });
  });

  describe("space extension for markers", () => {
    it("extends hidden range for header and quote markers to include trailing space", async () => {
      const doc = "# Heading\n> Quote\n>";
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(3).from) });
      await tick();

      const hidden = collectDecorationsByClass(plugin, view.state.doc, "cm-hide-markdown");
      expect(hidden).toContain("# ");
      expect(hidden).toContain("> ");

      view.destroy();
    });

    it("hides quote marker without space when line has no content after marker", async () => {
      const doc = "# Heading\n> Quote\n>";
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const hidden = collectDecorationsByClass(plugin, view.state.doc, "cm-hide-markdown");
      expect(hidden).toContain(">");

      view.destroy();
    });
  });

  describe("recomputation optimization", () => {
    it("recomputes when document changes", async () => {
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView("# First heading\n# Second heading", [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const prevDecorations = plugin.decorations;

      view.dispatch({ changes: { from: 0, to: 0, insert: "New content\n" } });
      await tick();

      expect(plugin.decorations).not.toBe(prevDecorations);

      view.destroy();
    });

    it("recomputes when cursor moves to different line", async () => {
      const doc = "# Heading\n> Quote\n>";
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(3).from) });
      await tick();

      const prevDecorations = plugin.decorations;

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      expect(plugin.decorations).not.toBe(prevDecorations);

      view.destroy();
    });

    it("skips recomputation when cursor stays on same line", async () => {
      const doc = "# Heading\n> Quote\n>";
      const extension = hideMarkdownExceptCurrentLine();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const decorationsBefore = plugin.decorations;

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from + 1) });
      await tick();

      expect(plugin.decorations).toBe(decorationsBefore);

      view.destroy();
    });
  });
});

describe("codeBlockDecorations", () => {
  function triggerUpdate(
    plugin: DecorationPlugin,
    state: EditorState,
    viewport: { from: number; to: number },
    options: { docChanged?: boolean; viewportChanged?: boolean } = {}
  ): void {
    plugin.update({
      docChanged: options.docChanged ?? true,
      viewportChanged: options.viewportChanged ?? true,
      state,
      view: { viewport },
    } as unknown);
  }

  function collectCodeLines(plugin: DecorationPlugin, docLength: number) {
    const fenceClasses: string[] = [];
    const codeLines: { line: string; lang: string; klass: string }[] = [];

    plugin.decorations.between(0, docLength, (_from, _to, deco) => {
      const cls = deco.spec?.class ?? "";
      if (cls.includes("cm-md-codeblock-fence")) {
        fenceClasses.push(cls);
      }
      if (cls.includes("cm-md-codeblock-line")) {
        codeLines.push({
          line: String(deco.spec.attributes?.["data-code-line"] ?? ""),
          lang: String(deco.spec.attributes?.["data-code-lang"] ?? ""),
          klass: cls,
        });
      }
    });

    return { fenceClasses, codeLines };
  }

  describe("language metadata", () => {
    it("adds fence and line decorations with normalized language", () => {
      const doc = "```TypeScript++\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      const viewport = { from: view.state.doc.line(1).from, to: view.state.doc.line(1).to };
      triggerUpdate(plugin, view.state, viewport);

      const { fenceClasses, codeLines } = collectCodeLines(plugin, view.state.doc.length);

      expect(fenceClasses.some((cls) => cls.includes("cm-md-codeblock-fence"))).toBe(true);
      expect(codeLines).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ line: "1", lang: "typescript", klass: expect.stringContaining("cm-md-codeblock-lang-typescript") }),
          expect.objectContaining({ line: "2", lang: "typescript", klass: expect.stringContaining("cm-md-codeblock-lang-typescript") }),
        ])
      );

      view.destroy();
    });

    it("falls back to plain language when not specified", () => {
      const doc = "```\nplain text\n```";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      const viewport = { from: view.state.doc.line(1).from, to: view.state.doc.line(1).to };
      triggerUpdate(plugin, view.state, viewport);

      const { codeLines } = collectCodeLines(plugin, view.state.doc.length);
      expect(codeLines.some((attr) => attr.lang === "plain")).toBe(true);

      view.destroy();
    });
  });

  describe("non-code content", () => {
    it("applies no decorations to plain text", () => {
      const doc = "Just text\nAnother line";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      const viewport = { from: view.state.doc.line(1).from, to: view.state.doc.line(2).to };
      triggerUpdate(plugin, view.state, viewport);

      let count = 0;
      plugin.decorations.between(0, view.state.doc.length, (_from, _to, deco) => {
        if (deco.spec?.class?.includes("cm-md-codeblock-line")) count++;
      });

      expect(count).toBe(0);

      view.destroy();
    });
  });

  describe("recomputation optimization", () => {
    it("skips recomputation when no relevant changes", () => {
      const doc = "```js\nconst x = 1;\n```";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      const previousDecorations = plugin.decorations;

      triggerUpdate(plugin, view.state, view.viewport, { docChanged: false, viewportChanged: false });

      expect(plugin.decorations).toBe(previousDecorations);

      view.destroy();
    });
  });

  describe("viewport handling", () => {
    it("keeps code line numbers when viewport jumps forward", () => {
      const doc = "```js\nfirst\nsecond\nthird\n```\nafter";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      triggerUpdate(plugin, view.state, { from: view.state.doc.line(2).from, to: view.state.doc.line(2).to });

      const { codeLines: initialLines } = collectCodeLines(plugin, view.state.doc.length);
      expect(initialLines.some((attr) => attr.line === "1")).toBe(true);

      triggerUpdate(plugin, view.state, { from: view.state.doc.line(4).from, to: view.state.doc.line(4).to }, { docChanged: false, viewportChanged: true });

      const { codeLines: laterLines } = collectCodeLines(plugin, view.state.doc.length);
      expect(laterLines.some((attr) => attr.line === "3")).toBe(true);

      view.destroy();
    });

    it("keeps code line numbers when viewport jumps backward", () => {
      const doc = "```js\nfirst\nsecond\nthird\n```\nafter";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      triggerUpdate(plugin, view.state, { from: view.state.doc.line(4).from, to: view.state.doc.line(4).to });
      triggerUpdate(plugin, view.state, { from: view.state.doc.line(2).from, to: view.state.doc.line(2).to }, { docChanged: false, viewportChanged: true });

      const { codeLines } = collectCodeLines(plugin, view.state.doc.length);
      expect(codeLines.some((attr) => attr.line === "1")).toBe(true);

      view.destroy();
    });

    it("processes code lines without decorations when computing state before viewport", () => {
      const doc = "prefix\n```js\ncode1\ncode2\ncode3\ncode4\ncode5\ncode6\ncode7\n```\nsuffix";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      triggerUpdate(plugin, view.state, { from: view.state.doc.line(9).from, to: view.state.doc.line(11).to });

      const { codeLines } = collectCodeLines(plugin, view.state.doc.length);
      expect(codeLines.some((attr) => attr.line === "6")).toBe(true);

      view.destroy();
    });
  });

  describe("fence marker matching", () => {
    it("keeps fence open when marker does not match", () => {
      const doc = "```js\nfirst\n~~~\nsecond\n```";
      const extension = codeBlockDecorations();
      const view = createEditorView(doc, [extension]);
      const plugin = getPlugin(view, extension);

      triggerUpdate(plugin, view.state, { from: view.state.doc.line(4).from, to: view.state.doc.line(4).to });

      const { codeLines } = collectCodeLines(plugin, view.state.doc.length);
      expect(codeLines).toEqual(
        expect.arrayContaining([expect.objectContaining({ line: "2", lang: "js" })])
      );

      view.destroy();
    });
  });
});

describe("markdownSemanticStyles", () => {
  describe("heading styles", () => {
    it("applies heading class to ATX headings", async () => {
      const doc = "## Heading 2\nLine with **bold** and *italic* plus `code`";
      const extension = markdownSemanticStyles();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const lines = queryLines(view);
      expect(lines[0].classList.contains("cm-md-heading-2")).toBe(true);

      view.destroy();
    });

    it("applies heading class to setext headings", async () => {
      const doc = "Setext Heading\n----";
      const extension = markdownSemanticStyles();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const lines = queryLines(view);
      expect(lines[0].classList.contains("cm-md-heading-2")).toBe(true);

      view.destroy();
    });
  });

  describe("inline formatting styles", () => {
    it("applies semantic classes for bold, italic, and code", async () => {
      const doc = "## Heading 2\nLine with **bold** and *italic* plus `code`";
      const extension = markdownSemanticStyles();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const lines = queryLines(view);
      const formattingLine = lines[1];

      expect(formattingLine.querySelector(".cm-md-strong")).not.toBeNull();
      expect(formattingLine.querySelector(".cm-md-emphasis")).not.toBeNull();
      expect(formattingLine.querySelector(".cm-md-code")).not.toBeNull();

      view.destroy();
    });

    it("handles empty inline code gracefully", async () => {
      const doc = "Text with `` empty backticks";
      const extension = markdownSemanticStyles();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const lines = queryLines(view);
      expect(lines[0].querySelector(".cm-md-code")).toBeNull();

      view.destroy();
    });
  });

  describe("fenced code handling", () => {
    it("skips fenced code blocks without applying semantic styles", async () => {
      const doc = "```js\nconst bold = '**not bold**';\n```";
      const extension = markdownSemanticStyles();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const lines = queryLines(view);
      const codeLine = lines[1];

      expect(codeLine.querySelector(".cm-md-strong")).toBeNull();

      view.destroy();
    });
  });

  describe("recomputation optimization", () => {
    it("skips recomputation when cursor stays on same line", async () => {
      const doc = "## Heading\nLine with `code`";
      const extension = markdownSemanticStyles();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const prevDecorations = plugin.decorations;

      view.dispatch({ selection: EditorSelection.single(2) });
      await tick();

      expect(plugin.decorations).toBe(prevDecorations);

      view.destroy();
    });

    it("skips recomputation when cursor moves to another line", async () => {
      const doc = "## Heading\nLine with `code`";
      const extension = markdownSemanticStyles();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const prevDecorations = plugin.decorations;

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      expect(plugin.decorations).toBe(prevDecorations);

      view.destroy();
    });
  });
});

describe("linkDecorations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenUrl.mockResolvedValue(undefined);
  });

  describe("link display when cursor is outside link line", () => {
    it("hides link markers and URL when cursor is on different line", async () => {
      const doc = "First line\n[google](https://www.google.com)\nThird line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const lines = queryLines(view);
      const linkLine = lines[1];

      expect(linkLine.querySelector(".cm-link-widget")).not.toBeNull();
      expect(linkLine.querySelector(".cm-hide-link-syntax")).not.toBeNull();

      view.destroy();
    });

    it("displays link name as clickable widget when cursor is outside", async () => {
      const doc = "First line\n[My Link](https://example.com)\nThird line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const linkWidget = view.dom.querySelector(".cm-link-widget");
      expect(linkWidget).not.toBeNull();
      expect(linkWidget?.textContent).toBe("My Link");

      view.destroy();
    });
  });

  describe("link display when cursor is on link line", () => {
    it("shows raw markdown text when cursor is on the link line", async () => {
      const doc = "First line\n[google](https://www.google.com)\nThird line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const lines = queryLines(view);
      const linkLine = lines[1];

      expect(linkLine.querySelector(".cm-link-widget")).toBeNull();
      expect(linkLine.textContent).toContain("[google](https://www.google.com)");

      view.destroy();
    });

    it("applies cm-md-link-active class to URL when cursor is on the link line", async () => {
      const doc = "First line\n[google](https://www.google.com)\nThird line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const linkActive = view.dom.querySelector(".cm-md-link-active");

      expect(linkActive).not.toBeNull();
      expect(linkActive?.textContent).toBe("https://www.google.com");

      view.destroy();
    });

    it("does not apply cm-md-link-active when cursor is outside link line", async () => {
      const doc = "First line\n[google](https://www.google.com)\nThird line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      expect(view.dom.querySelector(".cm-md-link-active")).toBeNull();

      view.destroy();
    });
  });

  describe("link click behavior", () => {
    it("opens link via Tauri opener when mousedown on link widget", async () => {
      const doc = "First line\n[google](https://www.google.com)\nThird line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const linkWidget = view.dom.querySelector(".cm-link-widget") as HTMLElement;
      expect(linkWidget).not.toBeNull();

      const mousedownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      linkWidget.dispatchEvent(mousedownEvent);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOpenUrl).toHaveBeenCalledWith("https://www.google.com");

      view.destroy();
    });

    it("falls back to window.open when dynamic import fails", async () => {
      vi.doUnmock("@tauri-apps/plugin-opener");
      vi.mock("@tauri-apps/plugin-opener", () => {
        throw new Error("Module not found");
      });

      const originalOpen = window.open;
      window.open = vi.fn();

      const doc = "First line\n[link](https://fallback.com)\nThird line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const linkWidget = view.dom.querySelector(".cm-link-widget") as HTMLElement;
      const mousedownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      linkWidget.dispatchEvent(mousedownEvent);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(window.open).toHaveBeenCalledWith("https://fallback.com", "_blank", "noopener,noreferrer");

      window.open = originalOpen;
      vi.doUnmock("@tauri-apps/plugin-opener");
      vi.mock("@tauri-apps/plugin-opener", () => ({
        openUrl: mockOpenUrl,
      }));
      view.destroy();
    });
  });

  describe("multiple links handling", () => {
    it("handles multiple links on different lines", async () => {
      const doc = "[first](https://first.com)\n[second](https://second.com)";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const widgets = view.dom.querySelectorAll(".cm-link-widget");
      expect(widgets.length).toBe(1);
      expect(widgets[0].textContent).toBe("first");

      view.destroy();
    });

    it("handles multiple links on same line when cursor is outside", async () => {
      const doc = "Text with [link1](https://a.com) and [link2](https://b.com)\nSecond line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const widgets = view.dom.querySelectorAll(".cm-link-widget");
      expect(widgets.length).toBe(2);
      expect(widgets[0].textContent).toBe("link1");
      expect(widgets[1].textContent).toBe("link2");

      view.destroy();
    });
  });

  describe("non-standard link formats", () => {
    it("ignores image links and only processes regular links", async () => {
      const doc = "![image](https://img.com)\n[link](https://link.com)";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(1).from) });
      await tick();

      const widgets = view.dom.querySelectorAll(".cm-link-widget");
      expect(widgets.length).toBe(1);
      expect(widgets[0].textContent).toBe("link");

      view.destroy();
    });

    it("handles autolinks without creating widgets", async () => {
      const doc = "<https://auto.com>\n[link](https://link.com)";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(1).from) });
      await tick();

      const widgets = view.dom.querySelectorAll(".cm-link-widget");
      expect(widgets.length).toBe(1);
      expect(widgets[0].textContent).toBe("link");

      view.destroy();
    });

    it("handles links with title attributes correctly", async () => {
      const doc = '[titled](https://example.com "Title Text")\nSecond line';
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const widgets = view.dom.querySelectorAll(".cm-link-widget");
      expect(widgets.length).toBe(1);
      expect(widgets[0].textContent).toBe("titled");

      view.destroy();
    });

    it("handles empty link text gracefully", async () => {
      const doc = "[](https://empty.com)\n[normal](https://normal.com)";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const widgets = view.dom.querySelectorAll(".cm-link-widget");
      expect(widgets.length).toBe(1);

      view.destroy();
    });

    it("handles links with nested parentheses in URL", async () => {
      const doc = "[wiki](https://en.wikipedia.org/wiki/Markdown_(syntax))\nSecond line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const lines = queryLines(view);
      expect(lines[0].textContent).toContain("wiki");

      view.destroy();
    });
  });

  describe("recomputation optimization", () => {
    it("recomputes when cursor moves to different line", async () => {
      const doc = "[link](https://example.com)\nSecond line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const prevDecorations = plugin.decorations;

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      expect(plugin.decorations).not.toBe(prevDecorations);

      view.destroy();
    });

    it("skips recomputation when cursor stays on same line", async () => {
      const doc = "[link](https://example.com)\nSecond line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);
      const plugin = getPlugin(view, extension);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const prevDecorations = plugin.decorations;

      view.dispatch({ selection: EditorSelection.single(5) });
      await tick();

      expect(plugin.decorations).toBe(prevDecorations);

      view.destroy();
    });
  });

  describe("widget equality", () => {
    it("reuses widget when link content is unchanged", async () => {
      const doc = "[link](https://example.com)\nSecond line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const widget1 = view.dom.querySelector(".cm-link-widget");

      view.dispatch({ changes: { from: view.state.doc.line(2).from, insert: "x" } });
      await tick();

      const widget2 = view.dom.querySelector(".cm-link-widget");

      expect(widget1?.textContent).toBe(widget2?.textContent);

      view.destroy();
    });

    it("creates new widget when link text changes", async () => {
      const doc = "[link](https://example.com)\nSecond line";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(view.state.doc.line(2).from) });
      await tick();

      const widget1 = view.dom.querySelector(".cm-link-widget");
      expect(widget1?.textContent).toBe("link");

      view.dispatch({ changes: { from: 1, to: 5, insert: "new-link" } });
      await tick();

      const widget2 = view.dom.querySelector(".cm-link-widget");
      expect(widget2?.textContent).toBe("new-link");

      view.destroy();
    });
  });

  describe("widget event handling", () => {
    it("prevents editor from processing mousedown on link widget", async () => {
      const doc = "First line\n[link](https://example.com)";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      const widget = view.dom.querySelector(".cm-link-widget") as HTMLElement;
      expect(widget).not.toBeNull();

      const mousedownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      widget.dispatchEvent(mousedownEvent);
      await tick();

      const currentLine = view.state.doc.lineAt(view.state.selection.main.head);
      expect(currentLine.number).toBe(1);

      view.destroy();
    });

    it("allows editor to process mousedown on non-link elements", async () => {
      const doc = "First line\n[link](https://example.com)";
      const extension = linkDecorations();
      const view = createEditorView(doc, [extension, markdown()]);

      view.dispatch({ selection: EditorSelection.single(0) });
      await tick();

      mockOpenUrl.mockClear();

      const contentArea = view.contentDOM;
      const mousedownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      contentArea.dispatchEvent(mousedownEvent);

      expect(mockOpenUrl).not.toHaveBeenCalled();

      view.destroy();
    });
  });
});

describe("computeInlineCodeRange", () => {
  it("returns content range when CodeMark children are present", () => {
    const children = [
      { name: "CodeMark", from: 0, to: 1 },
      { name: "CodeMark", from: 5, to: 6 },
    ];

    const result = computeInlineCodeRange(0, 6, children);

    expect(result).toEqual({ from: 1, to: 5 });
  });

  it("returns null when content range has no space", () => {
    const children = [
      { name: "CodeMark", from: 0, to: 1 },
      { name: "CodeMark", from: 1, to: 2 },
    ];

    const result = computeInlineCodeRange(0, 2, children);

    expect(result).toBeNull();
  });

  it("returns null when content range is invalid", () => {
    const children = [
      { name: "CodeMark", from: 0, to: 3 },
      { name: "CodeMark", from: 2, to: 4 },
    ];

    const result = computeInlineCodeRange(0, 4, children);

    expect(result).toBeNull();
  });

  it("skips non-CodeMark children", () => {
    const children = [
      { name: "CodeMark", from: 0, to: 1 },
      { name: "Text", from: 1, to: 5 },
      { name: "CodeMark", from: 5, to: 6 },
    ];

    const result = computeInlineCodeRange(0, 6, children);

    expect(result).toEqual({ from: 1, to: 5 });
  });

  it("returns full range when no CodeMark children exist", () => {
    const children = [
      { name: "Text", from: 1, to: 5 },
    ];

    const result = computeInlineCodeRange(0, 6, children);

    expect(result).toEqual({ from: 0, to: 6 });
  });

  it("returns full range when children array is empty", () => {
    const result = computeInlineCodeRange(0, 6, []);

    expect(result).toEqual({ from: 0, to: 6 });
  });
});

describe("isLinkWidgetClick", () => {
  it("returns true when target has cm-link-widget class", () => {
    const element = document.createElement("span");
    element.classList.add("cm-link-widget");

    expect(isLinkWidgetClick(element)).toBe(true);
  });

  it("returns false when target does not have cm-link-widget class", () => {
    const element = document.createElement("span");
    element.classList.add("cm-other-class");

    expect(isLinkWidgetClick(element)).toBe(false);
  });

  it("returns false when target has no classes", () => {
    const element = document.createElement("span");

    expect(isLinkWidgetClick(element)).toBe(false);
  });
});
