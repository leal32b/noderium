import { describe, it, expect } from "vitest";
import type { Extension } from "@codemirror/state";
import { EditorSelection, EditorState } from "@codemirror/state";
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

interface EditorTestContext {
  view: EditorView;
  host: HTMLDivElement;
  destroy: () => void;
}

interface PluginTestContext<T extends Extension> extends EditorTestContext {
  plugin: DecorationPlugin;
  extension: T;
}

function createTestHost(): HTMLDivElement {
  return document.createElement("div");
}

function createEditorContext(
  doc: string,
  extensions: Extension[] = []
): EditorTestContext {
  const host = createTestHost();
  const view = new EditorView({
    state: EditorState.create({ doc, extensions }),
    parent: host,
  });

  return {
    view,
    host,
    destroy: () => view.destroy(),
  };
}

function createPluginContext<T extends Extension>(
  doc: string,
  extensionFactory: () => T,
  additionalExtensions: Extension[] = []
): PluginTestContext<T> {
  const extension = extensionFactory();
  const ctx = createEditorContext(doc, [extension, ...additionalExtensions]);
  const plugin = ctx.view.plugin(extension as unknown as ViewPlugin<DecorationPlugin>);

  if (!plugin) {
    ctx.destroy();
    throw new Error("Plugin not available");
  }

  return { ...ctx, plugin, extension };
}

function selectLine(view: EditorView, lineNumber: number): void {
  const lineStart = view.state.doc.line(lineNumber).from;
  view.dispatch({ selection: EditorSelection.single(lineStart) });
}

function selectPosition(view: EditorView, position: number): void {
  view.dispatch({ selection: EditorSelection.single(position) });
}

async function flushUpdates(): Promise<void> {
  await Promise.resolve();
}

function collectDecorations(
  plugin: DecorationPlugin,
  doc: { length: number; sliceString: (from: number, to: number) => string },
  filter: (deco: Decoration) => boolean
): string[] {
  const results: string[] = [];

  plugin.decorations.between(
    0,
    doc.length,
    (from: number, to: number, deco: Decoration) => {
      if (filter(deco)) {
        results.push(doc.sliceString(from, to));
      }
    }
  );

  return results;
}

function collectDecorationsByClass(
  plugin: DecorationPlugin,
  doc: { length: number; sliceString: (from: number, to: number) => string },
  className: string
): string[] {
  return collectDecorations(plugin, doc, (deco) => deco.spec?.class === className);
}

function countDecorationsWithClass(
  plugin: DecorationPlugin,
  docLength: number,
  classSubstring: string
): number {
  let count = 0;

  plugin.decorations.between(0, docLength, (_from: number, _to: number, deco: Decoration) => {
    if (deco.spec?.class?.includes(classSubstring)) {
      count += 1;
    }
  });

  return count;
}

interface CodeLineAttribute {
  line: string;
  lang: string;
  klass: string;
}

function collectCodeLineAttributes(
  plugin: DecorationPlugin,
  docLength: number
): { fenceClasses: string[]; codeLineAttributes: CodeLineAttribute[] } {
  const fenceClasses: string[] = [];
  const codeLineAttributes: CodeLineAttribute[] = [];

  plugin.decorations.between(0, docLength, (_from: number, _to: number, deco: Decoration) => {
    const decoClass = deco.spec?.class ?? "";

    if (decoClass.includes("cm-md-codeblock-fence")) {
      fenceClasses.push(decoClass);
    }

    if (decoClass.includes("cm-md-codeblock-line")) {
      codeLineAttributes.push({
        line: String(deco.spec.attributes?.["data-code-line"] ?? ""),
        lang: String(deco.spec.attributes?.["data-code-lang"] ?? ""),
        klass: decoClass,
      });
    }
  });

  return { fenceClasses, codeLineAttributes };
}

function triggerPluginUpdate(
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

function getViewport(state: EditorState, fromLine: number, toLine: number) {
  return {
    from: state.doc.line(fromLine).from,
    to: state.doc.line(toLine).to,
  };
}

function queryLines(host: HTMLElement): HTMLDivElement[] {
  return Array.from(host.querySelectorAll<HTMLDivElement>(".cm-line"));
}

const FIXTURES = {
  headings: {
    twoHeadings: "# First heading\n# Second heading",
    headingQuoteLine: ["# Heading", "> Quote", ">"].join("\n"),
    setextHeading: ["Setext Heading", "----"].join("\n"),
    headingWithCode: ["## Heading", "Line with `code`"].join("\n"),
    headingWithFormatting: ["## Heading 2", "Line with **bold** and *italic* plus `code`"].join("\n"),
  },
  codeBlocks: {
    jsBlock: ["```js", "const x = 1;", "```"].join("\n"),
    typescriptBlock: ["```TypeScript++", "const a = 1;", "const b = 2;", "const c = 3;", "```"].join("\n"),
    plainBlock: ["```", "plain text", "```"].join("\n"),
  },
  plainText: {
    twoLines: ["Just text", "Another line"].join("\n"),
  },
} as const;

describe("hideMarkdownExceptCurrentLine", () => {
  describe("marker visibility", () => {
    it("hides markdown markers outside the active line", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.twoHeadings,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 2);
      await flushUpdates();

      const lines = queryLines(sut.host);

      expect(lines).toHaveLength(2);
      expect(lines[0].querySelectorAll(".cm-hide-markdown").length).toBeGreaterThan(0);
      expect(lines[1].querySelectorAll(".cm-hide-markdown").length).toBe(0);

      sut.destroy();
    });

    it("hides inline code markers outside the active line", async () => {
      const docWithInlineCode = "Line with `code` here\nSecond line";
      const sut = createPluginContext(
        docWithInlineCode,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 2);
      await flushUpdates();

      const hiddenSlices = collectDecorationsByClass(
        sut.plugin,
        sut.view.state.doc,
        "cm-hide-markdown"
      );

      expect(hiddenSlices).toContain("`");

      sut.destroy();
    });

    it("hides fenced code markers outside the active line", async () => {
      const sut = createPluginContext(
        FIXTURES.codeBlocks.jsBlock,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 2);
      await flushUpdates();

      const hiddenFences = collectDecorationsByClass(
        sut.plugin,
        sut.view.state.doc,
        "cm-hide-markdown-fence"
      );

      expect(hiddenFences).toContain("```");

      sut.destroy();
    });

    it("hides tilde fenced markers outside the active line", async () => {
      const tildeBlock = ["~~~js", "const x = 1;", "~~~"].join("\n");
      const sut = createPluginContext(
        tildeBlock,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 2);
      await flushUpdates();

      const hiddenFences = collectDecorationsByClass(
        sut.plugin,
        sut.view.state.doc,
        "cm-hide-markdown-fence"
      );

      expect(hiddenFences).toContain("~~~");

      sut.destroy();
    });
  });

  describe("space extension for markers", () => {
    it("extends hidden range for header and quote markers to include trailing space", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingQuoteLine,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 3);
      await flushUpdates();

      const hiddenSlices = collectDecorationsByClass(
        sut.plugin,
        sut.view.state.doc,
        "cm-hide-markdown"
      );

      expect(hiddenSlices).toContain("# ");
      expect(hiddenSlices).toContain("> ");

      sut.destroy();
    });

    it("hides quote marker without space when line has no content after marker", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingQuoteLine,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 2);
      await flushUpdates();

      const hiddenSlices = collectDecorationsByClass(
        sut.plugin,
        sut.view.state.doc,
        "cm-hide-markdown"
      );

      expect(hiddenSlices).toContain(">");

      sut.destroy();
    });
  });

  describe("recomputation optimization", () => {
    it("recomputes when document changes", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.twoHeadings,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 1);
      await flushUpdates();

      const prevDecorations = sut.plugin.decorations;

      sut.view.dispatch({
        changes: { from: 0, to: 0, insert: "New content\n" },
      });
      await flushUpdates();

      expect(sut.plugin.decorations).not.toBe(prevDecorations);

      sut.destroy();
    });

    it("recomputes when cursor moves to different line", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingQuoteLine,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 3);
      await flushUpdates();

      const prevDecorations = sut.plugin.decorations;

      selectLine(sut.view, 2);
      await flushUpdates();

      expect(sut.plugin.decorations).not.toBe(prevDecorations);

      sut.destroy();
    });

    it("skips recomputation when cursor stays on same line", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingQuoteLine,
        hideMarkdownExceptCurrentLine,
        [markdown()]
      );

      selectLine(sut.view, 2);
      await flushUpdates();

      const decorationsBeforeMove = sut.plugin.decorations;
      const sameLinePosition = sut.view.state.doc.line(2).from + 1;

      selectPosition(sut.view, sameLinePosition);
      await flushUpdates();

      expect(sut.plugin.decorations).toBe(decorationsBeforeMove);

      sut.destroy();
    });
  });
});

describe("codeBlockDecorations", () => {
  describe("language metadata", () => {
    it("adds fence and line decorations with normalized language", () => {
      const sut = createPluginContext(FIXTURES.codeBlocks.typescriptBlock, codeBlockDecorations);
      const viewport = getViewport(sut.view.state, 1, 1);

      triggerPluginUpdate(sut.plugin, sut.view.state, viewport);

      const { fenceClasses, codeLineAttributes } = collectCodeLineAttributes(
        sut.plugin,
        sut.view.state.doc.length
      );

      expect(fenceClasses.some((cls) => cls.includes("cm-md-codeblock-fence"))).toBe(true);
      expect(codeLineAttributes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            line: "1",
            lang: "typescript",
            klass: expect.stringContaining("cm-md-codeblock-lang-typescript"),
          }),
          expect.objectContaining({
            line: "2",
            lang: "typescript",
            klass: expect.stringContaining("cm-md-codeblock-lang-typescript"),
          }),
        ])
      );

      sut.destroy();
    });

    it("falls back to plain language when not specified", () => {
      const sut = createPluginContext(FIXTURES.codeBlocks.plainBlock, codeBlockDecorations);
      const viewport = getViewport(sut.view.state, 1, 1);

      triggerPluginUpdate(sut.plugin, sut.view.state, viewport);

      const { codeLineAttributes } = collectCodeLineAttributes(
        sut.plugin,
        sut.view.state.doc.length
      );

      expect(codeLineAttributes.some((attr) => attr.lang === "plain")).toBe(true);

      sut.destroy();
    });
  });

  describe("non-code content", () => {
    it("applies no decorations to plain text", () => {
      const sut = createPluginContext(FIXTURES.plainText.twoLines, codeBlockDecorations);
      const viewport = getViewport(sut.view.state, 1, 2);

      triggerPluginUpdate(sut.plugin, sut.view.state, viewport);

      const codeLineCount = countDecorationsWithClass(
        sut.plugin,
        sut.view.state.doc.length,
        "cm-md-codeblock-line"
      );

      expect(codeLineCount).toBe(0);

      sut.destroy();
    });
  });

  describe("recomputation optimization", () => {
    it("skips recomputation when no relevant changes", () => {
      const sut = createPluginContext(FIXTURES.codeBlocks.jsBlock, codeBlockDecorations);

      const previousDecorations = sut.plugin.decorations;

      triggerPluginUpdate(sut.plugin, sut.view.state, sut.view.viewport, {
        docChanged: false,
        viewportChanged: false,
      });

      expect(sut.plugin.decorations).toBe(previousDecorations);

      sut.destroy();
    });
  });

  describe("viewport handling", () => {
    it("keeps code line numbers when viewport jumps forward", () => {
      const doc = [
        "```js",
        "first",
        "second",
        "third",
        "```",
        "after",
      ].join("\n");

      const sut = createPluginContext(doc, codeBlockDecorations);

      const initialViewport = getViewport(sut.view.state, 2, 2);
      triggerPluginUpdate(sut.plugin, sut.view.state, initialViewport);

      const { codeLineAttributes: initialLines } = collectCodeLineAttributes(
        sut.plugin,
        sut.view.state.doc.length
      );
      expect(initialLines.some((attr) => attr.line === "1")).toBe(true);

      const laterViewport = getViewport(sut.view.state, 4, 4);
      triggerPluginUpdate(sut.plugin, sut.view.state, laterViewport, {
        docChanged: false,
        viewportChanged: true,
      });

      const { codeLineAttributes: laterLines } = collectCodeLineAttributes(
        sut.plugin,
        sut.view.state.doc.length
      );
      expect(laterLines.some((attr) => attr.line === "3")).toBe(true);

      sut.destroy();
    });

    it("keeps code line numbers when viewport jumps backward", () => {
      const doc = [
        "```js",
        "first",
        "second",
        "third",
        "```",
        "after",
      ].join("\n");

      const sut = createPluginContext(doc, codeBlockDecorations);

      const laterViewport = getViewport(sut.view.state, 4, 4);
      triggerPluginUpdate(sut.plugin, sut.view.state, laterViewport);

      const earlierViewport = getViewport(sut.view.state, 2, 2);
      triggerPluginUpdate(sut.plugin, sut.view.state, earlierViewport, {
        docChanged: false,
        viewportChanged: true,
      });

      const { codeLineAttributes } = collectCodeLineAttributes(
        sut.plugin,
        sut.view.state.doc.length
      );

      expect(codeLineAttributes.some((attr) => attr.line === "1")).toBe(true);

      sut.destroy();
    });

    it("processes code lines without decorations when computing state before viewport", () => {
      const doc = [
        "prefix",
        "```js",
        "code1",
        "code2",
        "code3",
        "code4",
        "code5",
        "code6",
        "code7",
        "```",
        "suffix",
      ].join("\n");

      const sut = createPluginContext(doc, codeBlockDecorations);
      const lateViewport = getViewport(sut.view.state, 9, 11);

      triggerPluginUpdate(sut.plugin, sut.view.state, lateViewport);

      const { codeLineAttributes } = collectCodeLineAttributes(
        sut.plugin,
        sut.view.state.doc.length
      );

      expect(codeLineAttributes.some((attr) => attr.line === "6")).toBe(true);

      sut.destroy();
    });
  });

  describe("fence marker matching", () => {
    it("keeps fence open when marker does not match", () => {
      const doc = [
        "```js",
        "first",
        "~~~",
        "second",
        "```",
      ].join("\n");

      const sut = createPluginContext(doc, codeBlockDecorations);
      const viewport = getViewport(sut.view.state, 4, 4);

      triggerPluginUpdate(sut.plugin, sut.view.state, viewport);

      const { codeLineAttributes } = collectCodeLineAttributes(
        sut.plugin,
        sut.view.state.doc.length
      );

      expect(codeLineAttributes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ line: "2", lang: "js" }),
        ])
      );

      sut.destroy();
    });
  });
});

describe("markdownSemanticStyles", () => {
  describe("heading styles", () => {
    it("applies heading class to ATX headings", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingWithFormatting,
        markdownSemanticStyles,
        [markdown()]
      );

      selectPosition(sut.view, 0);
      await flushUpdates();

      const lines = queryLines(sut.host);

      expect(lines[0].classList.contains("cm-md-heading-2")).toBe(true);

      sut.destroy();
    });

    it("applies heading class to setext headings", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.setextHeading,
        markdownSemanticStyles,
        [markdown()]
      );

      selectPosition(sut.view, 0);
      await flushUpdates();

      const lines = queryLines(sut.host);

      expect(lines[0].classList.contains("cm-md-heading-2")).toBe(true);

      sut.destroy();
    });
  });

  describe("inline formatting styles", () => {
    it("applies semantic classes for bold, italic, and code", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingWithFormatting,
        markdownSemanticStyles,
        [markdown()]
      );

      selectPosition(sut.view, 0);
      await flushUpdates();

      const lines = queryLines(sut.host);
      const formattingLine = lines[1];

      expect(formattingLine.querySelector(".cm-md-strong")).not.toBeNull();
      expect(formattingLine.querySelector(".cm-md-emphasis")).not.toBeNull();
      expect(formattingLine.querySelector(".cm-md-code")).not.toBeNull();

      sut.destroy();
    });
  });

  describe("recomputation optimization", () => {
    it("skips recomputation when cursor stays on same line", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingWithCode,
        markdownSemanticStyles,
        [markdown()]
      );

      selectPosition(sut.view, 0);
      await flushUpdates();

      const prevDecorations = sut.plugin.decorations;

      selectPosition(sut.view, 2);
      await flushUpdates();

      expect(sut.plugin.decorations).toBe(prevDecorations);

      sut.destroy();
    });

    it("skips recomputation when cursor moves to another line", async () => {
      const sut = createPluginContext(
        FIXTURES.headings.headingWithCode,
        markdownSemanticStyles,
        [markdown()]
      );

      selectPosition(sut.view, 0);
      await flushUpdates();

      const prevDecorations = sut.plugin.decorations;
      const lineTwoPosition = sut.view.state.doc.line(2).from;

      selectPosition(sut.view, lineTwoPosition);
      await flushUpdates();

      expect(sut.plugin.decorations).toBe(prevDecorations);

      sut.destroy();
    });
  });
});
