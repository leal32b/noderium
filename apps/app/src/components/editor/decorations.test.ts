import { describe, it, expect } from "vitest";
import { EditorSelection, EditorState, Extension } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";

import {
  codeBlockDecorations,
  hideMarkdownExceptCurrentLine,
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
