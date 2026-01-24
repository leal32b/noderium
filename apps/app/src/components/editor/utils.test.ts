import { EditorState } from "@codemirror/state";

import {
  parseFenceLine,
  getLeadingWhitespace,
  computeVisibleRange,
  shouldRecompute,
  normalizeLanguage,
} from "./utils";
import type { ViewportState } from "./types";

function createState(doc: string): EditorState {
  return EditorState.create({ doc });
}

function createViewUpdate(
  state: EditorState,
  options: {
    docChanged?: boolean;
    viewport?: { from: number; to: number };
  } = {}
) {
  return {
    docChanged: options.docChanged ?? false,
    view: {
      viewport: options.viewport ?? { from: 0, to: state.doc.length },
    },
  } as Parameters<typeof shouldRecompute>[0];
}

describe("parseFenceLine", () => {
  describe("backtick fences", () => {
    it("parses fence with language", () => {
      const result = parseFenceLine("```js");

      expect(result).toEqual({ marker: "```", language: "js" });
    });

    it("parses fence without language", () => {
      const result = parseFenceLine("```");

      expect(result).toEqual({ marker: "```", language: "" });
    });

    it("parses fence with complex language identifier", () => {
      const result = parseFenceLine("```TypeScript++");

      expect(result).toEqual({ marker: "```", language: "TypeScript++" });
    });
  });

  describe("tilde fences", () => {
    it("parses tilde fence with language", () => {
      const result = parseFenceLine("~~~python");

      expect(result).toEqual({ marker: "~~~", language: "python" });
    });

    it("parses tilde fence without language", () => {
      const result = parseFenceLine("~~~");

      expect(result).toEqual({ marker: "~~~", language: "" });
    });
  });

  describe("non-fence lines", () => {
    it("returns null for plain text", () => {
      expect(parseFenceLine("just some text")).toBeNull();
    });

    it("returns null for partial backticks", () => {
      expect(parseFenceLine("``not a fence")).toBeNull();
    });

    it("returns null for partial tildes", () => {
      expect(parseFenceLine("~~not a fence")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseFenceLine("")).toBeNull();
    });
  });
});

describe("getLeadingWhitespace", () => {
  it("extracts leading spaces", () => {
    expect(getLeadingWhitespace("  hello")).toBe("  ");
  });

  it("extracts leading tabs", () => {
    expect(getLeadingWhitespace("\t\thello")).toBe("\t\t");
  });

  it("extracts mixed whitespace", () => {
    expect(getLeadingWhitespace("  \t hello")).toBe("  \t ");
  });

  it("returns empty string for no leading whitespace", () => {
    expect(getLeadingWhitespace("hello")).toBe("");
  });

  it("returns full string for whitespace-only input", () => {
    expect(getLeadingWhitespace("   ")).toBe("   ");
  });

  it("returns empty string for empty input", () => {
    expect(getLeadingWhitespace("")).toBe("");
  });
});

describe("computeVisibleRange", () => {
  it("expands viewport by margin lines", () => {
    const doc = ["line1", "line2", "line3", "line4", "line5", "line6", "line7"].join("\n");
    const state = createState(doc);
    const line3 = state.doc.line(3);
    const line5 = state.doc.line(5);

    const result = computeVisibleRange(state, { from: line3.from, to: line5.to });

    expect(result.from).toBe(state.doc.line(1).from);
    expect(result.to).toBe(state.doc.line(7).to);
  });

  it("clamps to document bounds when margin exceeds start", () => {
    const doc = ["line1", "line2", "line3"].join("\n");
    const state = createState(doc);
    const line1 = state.doc.line(1);

    const result = computeVisibleRange(state, { from: line1.from, to: line1.to });

    expect(result.from).toBe(state.doc.line(1).from);
  });

  it("clamps to document bounds when margin exceeds end", () => {
    const doc = ["line1", "line2", "line3"].join("\n");
    const state = createState(doc);
    const line3 = state.doc.line(3);

    const result = computeVisibleRange(state, { from: line3.from, to: line3.to });

    expect(result.to).toBe(state.doc.line(3).to);
  });
});

describe("shouldRecompute", () => {
  const defaultViewportState: ViewportState = { line: 1, from: 0, to: 100 };

  it("returns true when document changed", () => {
    const state = createState("test");
    const update = createViewUpdate(state, { docChanged: true });

    expect(shouldRecompute(update, defaultViewportState, 1)).toBe(true);
  });

  it("returns true when line number changed", () => {
    const state = createState("line1\nline2");
    const update = createViewUpdate(state, { viewport: { from: 0, to: 100 } });

    expect(shouldRecompute(update, defaultViewportState, 2)).toBe(true);
  });

  it("returns true when viewport.from changed", () => {
    const state = createState("test");
    const update = createViewUpdate(state, { viewport: { from: 10, to: 100 } });

    expect(shouldRecompute(update, defaultViewportState, 1)).toBe(true);
  });

  it("returns true when viewport.to changed", () => {
    const state = createState("test");
    const update = createViewUpdate(state, { viewport: { from: 0, to: 200 } });

    expect(shouldRecompute(update, defaultViewportState, 1)).toBe(true);
  });

  it("returns false when nothing changed", () => {
    const state = createState("test");
    const update = createViewUpdate(state, { viewport: { from: 0, to: 100 } });

    expect(shouldRecompute(update, defaultViewportState, 1)).toBe(false);
  });
});

describe("normalizeLanguage", () => {
  it("lowercases language identifier", () => {
    expect(normalizeLanguage("TypeScript")).toBe("typescript");
  });

  it("removes special characters", () => {
    expect(normalizeLanguage("c++")).toBe("c");
  });

  it("preserves underscores and hyphens", () => {
    expect(normalizeLanguage("objective-c")).toBe("objective-c");
    expect(normalizeLanguage("some_lang")).toBe("some_lang");
  });

  it("trims whitespace", () => {
    expect(normalizeLanguage("  python  ")).toBe("python");
  });

  it("returns plain for empty string", () => {
    expect(normalizeLanguage("")).toBe("plain");
  });

  it("returns plain for whitespace-only string", () => {
    expect(normalizeLanguage("   ")).toBe("plain");
  });

  it("handles complex language identifiers", () => {
    expect(normalizeLanguage("TypeScript++")).toBe("typescript");
  });
});
