import "@testing-library/jest-dom/vitest";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { EditorSelection, EditorState } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";

import MarkdownEditor, {
  codeBlockDecorations,
  hideMarkdownExceptCurrentLine,
  markdownSemanticStyles,
} from "./MarkdownEditor";

afterEach(() => {
  cleanup();
});

describe("MarkdownEditor component", () => {
  it("creates an editor with provided content, applies class and cleans up", () => {
    let readyView: EditorView | null = null;

    const { container, unmount } = render(() => (
      <MarkdownEditor
        class="custom-class"
        initialContent="# Title"
        onReady={(view) => {
          readyView = view;
        }}
      />
    ));

    expect(container.firstElementChild).toHaveClass("custom-class");
    expect(readyView).not.toBeNull();

    if (!readyView) {
      throw new Error("Editor view not created");
    }

    const view = readyView as EditorView;

    expect(view.state.doc.toString()).toBe("# Title");

    const destroySpy = vi.spyOn(view, "destroy");
    unmount();

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("uses the default content when initialContent is omitted", () => {
    let readyView: EditorView | null = null;

    render(() => (
      <MarkdownEditor
        onReady={(view) => {
          readyView = view;
        }}
      />
    ));

    expect(readyView).not.toBeNull();

    if (!readyView) {
      throw new Error("Editor view not created");
    }

    const view = readyView as EditorView;

    expect(view.state.doc.toString()).toContain("Welcome to Noderium");
  });
});

describe("hideMarkdownExceptCurrentLine", () => {
  it("hides markdown markers outside the active line", async () => {
    const host = document.createElement("div");
    const view = new EditorView({
      state: EditorState.create({
        doc: "# First heading\n# Second heading",
        extensions: [markdown(), hideMarkdownExceptCurrentLine()],
      }),
      parent: host,
    });

    const secondLineStart = view.state.doc.line(2).from;
    view.dispatch({ selection: EditorSelection.single(secondLineStart) });

    await Promise.resolve();

    const lines = Array.from(host.querySelectorAll<HTMLDivElement>(".cm-line"));

    expect(lines).toHaveLength(2);
    expect(lines[0].querySelectorAll(".cm-hide-markdown").length).toBeGreaterThan(0);
    expect(lines[1].querySelectorAll(".cm-hide-markdown").length).toBe(0);

    view.destroy();
  });

  it("adjusts hidden ranges for header and quote markers", async () => {
    const host = document.createElement("div");
    const extension = hideMarkdownExceptCurrentLine();
    const view = new EditorView({
      state: EditorState.create({
        doc: ["# Heading", "> Quote", ">"].join("\n"),
        extensions: [markdown(), extension],
      }),
      parent: host,
    });

    view.dispatch({
      selection: EditorSelection.single(view.state.doc.line(3).from),
    });
    await Promise.resolve();

    const plugin = view.plugin(extension) as {
      decorations: any;
      update: (update: any) => void;
    } | null;

    if (!plugin) {
      throw new Error("Hide markdown plugin not available");
    }

    const hiddenSlices: string[] = [];
    plugin.decorations.between(
      0,
      view.state.doc.length,
      (from: number, to: number, deco: Decoration) => {
        if (deco.spec?.class === "cm-hide-markdown") {
          hiddenSlices.push(view.state.doc.sliceString(from, to));
        }
      }
    );

    expect(hiddenSlices).toContain("# ");
    expect(hiddenSlices).toContain("> ");

    const prevDecorations = plugin.decorations;

    view.dispatch({
      selection: EditorSelection.single(view.state.doc.line(2).from),
    });
    await Promise.resolve();

    expect(plugin.decorations).not.toBe(prevDecorations);

    const sameLinePosition = view.state.doc.line(2).from + 1;
    const decorationsBeforeNoop = plugin.decorations;

    view.dispatch({
      selection: EditorSelection.single(sameLinePosition),
    });
    await Promise.resolve();

    expect(plugin.decorations).toBe(decorationsBeforeNoop);

    const hiddenSlicesAfter: string[] = [];
    plugin.decorations.between(
      0,
      view.state.doc.length,
      (from: number, to: number, deco: Decoration) => {
        if (deco.spec?.class === "cm-hide-markdown") {
          hiddenSlicesAfter.push(view.state.doc.sliceString(from, to));
        }
      }
    );

    expect(hiddenSlicesAfter).toContain(">");

    view.destroy();
  });

  it("hides fenced code markers outside the active line", async () => {
    const host = document.createElement("div");
    const extension = hideMarkdownExceptCurrentLine();
    const view = new EditorView({
      state: EditorState.create({
        doc: ["```js", "const x = 1;", "```"].join("\n"),
        extensions: [markdown(), extension],
      }),
      parent: host,
    });

    view.dispatch({
      selection: EditorSelection.single(view.state.doc.line(2).from),
    });
    await Promise.resolve();

    const plugin = view.plugin(extension) as {
      decorations: any;
      update: (update: any) => void;
    } | null;

    if (!plugin) {
      throw new Error("Hide markdown plugin not available");
    }

    const hiddenFenceSlices: string[] = [];
    plugin.decorations.between(
      0,
      view.state.doc.length,
      (from: number, to: number, deco: Decoration) => {
        if (deco.spec?.class === "cm-hide-markdown-fence") {
          hiddenFenceSlices.push(view.state.doc.sliceString(from, to));
        }
      }
    );

    expect(hiddenFenceSlices).toContain("```");

    view.destroy();
  });
});

describe("codeBlockDecorations", () => {
  it("adds fence and line decorations with language metadata", () => {
    const host = document.createElement("div");
    const extension = codeBlockDecorations();
    const view = new EditorView({
      state: EditorState.create({
        doc: [
          "```TypeScript++",
          "const a = 1;",
          "const b = 2;",
          "const c = 3;",
          "```",
        ].join("\n"),
        extensions: [extension],
      }),
      parent: host,
    });

    const plugin = view.plugin(extension) as {
      decorations: any;
      update: (update: any) => void;
    } | null;

    if (!plugin) {
      throw new Error("Code block plugin not available");
    }

    plugin.update({
      docChanged: true,
      viewportChanged: true,
      state: view.state,
      view: {
        viewport: {
          from: view.state.doc.line(1).from,
          to: view.state.doc.line(1).to,
        },
      },
    } as any);

    const fenceClasses: string[] = [];
    const codeLineAttributes: Array<{ line: string; lang: string; klass: string }> = [];

    plugin.decorations.between(
      0,
      view.state.doc.length,
      (from: number, to: number, deco: Decoration) => {
        void from;
        void to;
        if (deco.spec?.class?.includes("cm-md-codeblock-fence")) {
          fenceClasses.push(deco.spec.class);
        }

        if (deco.spec?.class?.includes("cm-md-codeblock-line")) {
          codeLineAttributes.push({
            line: String(deco.spec.attributes?.["data-code-line"] || ""),
            lang: String(deco.spec.attributes?.["data-code-lang"] || ""),
            klass: String(deco.spec.class || ""),
          });
        }
      }
    );

    expect(fenceClasses.some((klass) => klass.includes("cm-md-codeblock-fence"))).toBe(true);
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

    view.destroy();
  });

  it("falls back to plain language when no language is provided", () => {
    const host = document.createElement("div");
    const extension = codeBlockDecorations();
    const view = new EditorView({
      state: EditorState.create({
        doc: ["```", "plain text", "```"].join("\n"),
        extensions: [extension],
      }),
      parent: host,
    });

    const plugin = view.plugin(extension) as {
      decorations: any;
      update: (update: any) => void;
    } | null;

    if (!plugin) {
      throw new Error("Code block plugin not available");
    }

    plugin.update({
      docChanged: true,
      viewportChanged: true,
      state: view.state,
      view: {
        viewport: {
          from: view.state.doc.line(1).from,
          to: view.state.doc.line(1).to,
        },
      },
    } as any);

    const languages: string[] = [];

    plugin.decorations.between(
      0,
      view.state.doc.length,
      (from: number, to: number, deco: Decoration) => {
        void from;
        void to;
        if (deco.spec?.class?.includes("cm-md-codeblock-line")) {
          languages.push(String(deco.spec.attributes?.["data-code-lang"] || ""));
        }
      }
    );

    expect(languages).toContain("plain");

    view.destroy();
  });

  it("skips non-fenced lines when not inside a code block", () => {
    const host = document.createElement("div");
    const extension = codeBlockDecorations();
    const view = new EditorView({
      state: EditorState.create({
        doc: ["Just text", "Another line"].join("\n"),
        extensions: [extension],
      }),
      parent: host,
    });

    const plugin = view.plugin(extension) as {
      decorations: any;
      update: (update: any) => void;
    } | null;

    if (!plugin) {
      throw new Error("Code block plugin not available");
    }

    plugin.update({
      docChanged: true,
      viewportChanged: true,
      state: view.state,
      view: {
        viewport: {
          from: view.state.doc.line(1).from,
          to: view.state.doc.line(2).to,
        },
      },
    } as any);

    let codeLineCount = 0;
    plugin.decorations.between(
      0,
      view.state.doc.length,
      (from: number, to: number, deco: Decoration) => {
        void from;
        void to;
        if (deco.spec?.class?.includes("cm-md-codeblock-line")) {
          codeLineCount += 1;
        }
      }
    );

    expect(codeLineCount).toBe(0);

    view.destroy();
  });

  it("skips recompute when update has no relevant changes", () => {
    const host = document.createElement("div");
    const extension = codeBlockDecorations();
    const view = new EditorView({
      state: EditorState.create({
        doc: ["```js", "const x = 1;", "```"].join("\n"),
        extensions: [extension],
      }),
      parent: host,
    });

    const plugin = view.plugin(extension) as {
      decorations: any;
      update: (update: any) => void;
    } | null;

    if (!plugin) {
      throw new Error("Code block plugin not available");
    }

    const previousDecorations = plugin.decorations;
    plugin.update({
      docChanged: false,
      viewportChanged: false,
      state: view.state,
      view: view,
    } as any);

    expect(plugin.decorations).toBe(previousDecorations);

    view.destroy();
  });
});

describe("markdownSemanticStyles", () => {
  it("adds semantic classes for headings and inline marks", async () => {
    const host = document.createElement("div");
    const view = new EditorView({
      state: EditorState.create({
        doc: [
          "## Heading 2",
          "Line with **bold** and *italic* plus `code`",
        ].join("\n"),
        extensions: [markdown(), markdownSemanticStyles()],
      }),
      parent: host,
    });

    view.dispatch({ selection: EditorSelection.single(0) });
    await Promise.resolve();

    const lines = Array.from(host.querySelectorAll<HTMLDivElement>(".cm-line"));

    expect(lines[0].classList.contains("cm-md-heading-2")).toBe(true);
    expect(lines[1].querySelector(".cm-md-strong")).not.toBeNull();
    expect(lines[1].querySelector(".cm-md-emphasis")).not.toBeNull();
    expect(lines[1].querySelector(".cm-md-code")).not.toBeNull();

    view.destroy();
  });

  it("handles setext headings with semantic classes", async () => {
    const host = document.createElement("div");
    const view = new EditorView({
      state: EditorState.create({
        doc: ["Setext Heading", "----"].join("\n"),
        extensions: [markdown(), markdownSemanticStyles()],
      }),
      parent: host,
    });

    view.dispatch({ selection: EditorSelection.single(0) });
    await Promise.resolve();

    const lines = Array.from(host.querySelectorAll<HTMLDivElement>(".cm-line"));
    
    expect(lines[0].classList.contains("cm-md-heading-2")).toBe(true);

    view.destroy();
  });

  it("skips recompute when selection stays on the same line", async () => {
    const host = document.createElement("div");
    const extension = markdownSemanticStyles();
    const view = new EditorView({
      state: EditorState.create({
        doc: ["## Heading", "Line with `code`"].join("\n"),
        extensions: [markdown(), extension],
      }),
      parent: host,
    });

    view.dispatch({ selection: EditorSelection.single(0) });
    await Promise.resolve();

    const plugin = view.plugin(extension) as { decorations: any } | null;
    
    if (!plugin) {
      throw new Error("Markdown semantic plugin not available");
    }

    const prevDecorations = plugin.decorations;
    view.dispatch({ selection: EditorSelection.single(2) });
    await Promise.resolve();

    expect(plugin.decorations).toBe(prevDecorations);

    view.destroy();
  });
});
