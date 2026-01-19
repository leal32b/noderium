import type { Extension, EditorState } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { Decoration, ViewPlugin } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import type { LineInfo, Viewport, ViewportState } from "./types";
import {
  computeVisibleRange,
  normalizeLanguage,
  parseFenceLine,
  shouldRecompute,
} from "./utils";

const MARKER_NODES: ReadonlySet<string> = new Set([
  "CodeMark",
  "EmphasisMark",
  "HeaderMark",
  "QuoteMark",
]);

const SPACE_EXTENDED_MARKERS: ReadonlySet<string> = new Set([
  "HeaderMark",
  "QuoteMark",
]);

const HEADING_CLASSES: Readonly<Record<string, string>> = {
  ATXHeading1: "cm-md-heading-1",
  ATXHeading2: "cm-md-heading-2",
  ATXHeading3: "cm-md-heading-3",
  ATXHeading4: "cm-md-heading-4",
  ATXHeading5: "cm-md-heading-5",
  ATXHeading6: "cm-md-heading-6",
  SetextHeading1: "cm-md-heading-1",
  SetextHeading2: "cm-md-heading-2",
};

const INLINE_MARK_CLASSES: Readonly<Record<string, string>> = {
  StrongEmphasis: "cm-md-strong",
  Emphasis: "cm-md-emphasis",
};

const DECO_HIDE = Decoration.mark({ class: "cm-hide-markdown" });
const DECO_HIDE_FENCE = Decoration.mark({ class: "cm-hide-markdown-fence" });
const DECO_FENCE_LINE = Decoration.line({ class: "cm-md-codeblock-fence" });
const DECO_FENCE_MARK = Decoration.mark({ class: "cm-md-codeblock-fence-text" });

interface FenceState {
  inFence: boolean;
  activeFenceMarker: string;
  currentLanguage: string;
  codeLineNumber: number;
}

function getViewportState(
  update: ViewUpdate,
  prevState: ViewportState,
  currentLineNumber: number,
  trackLine = true
): { shouldUpdate: boolean; state: ViewportState; viewport: Viewport } {
  const { viewport } = update.view;

  const effectiveLine = trackLine ? currentLineNumber : prevState.line;

  if (!shouldRecompute(update, prevState, effectiveLine)) {
    return { shouldUpdate: false, state: prevState, viewport };
  }

  return {
    shouldUpdate: true,
    viewport,
    state: {
      line: trackLine ? currentLineNumber : prevState.line,
      from: viewport.from,
      to: viewport.to,
    },
  };
}

export function codeBlockDecorations(): Extension {
  return ViewPlugin.fromClass(
    class CodeBlockPlugin {
      decorations = Decoration.none;
      cache: { startLine: number; state: FenceState } | null = null;

      update(update: ViewUpdate): void {
        if (!update.docChanged && !update.viewportChanged) {
          return;
        }

        const { state, view } = update;
        const visibleRange = computeVisibleRange(state, view.viewport);
        const { doc } = state;
        const builder = new RangeSetBuilder<Decoration>();
        const fromLine = doc.lineAt(visibleRange.from).number;
        const toLine = doc.lineAt(visibleRange.to).number;

        if (update.docChanged) {
          this.cache = null;
        }

        const initialState = this.getStateBeforeLine(doc, fromLine);
        let fenceState = { ...initialState };

        for (let lineIdx = fromLine; lineIdx <= toLine; lineIdx += 1) {
          const line = doc.line(lineIdx);
          fenceState = this.processLine(line, fenceState, builder);
        }

        this.cache = { startLine: fromLine, state: initialState };
        this.decorations = builder.finish();
      }

      private getStateBeforeLine(doc: EditorState["doc"], targetLine: number): FenceState {
        const initialState: FenceState = {
          inFence: false,
          activeFenceMarker: "",
          currentLanguage: "",
          codeLineNumber: 0,
        };

        let state = initialState;
        let startLine = 1;

        if (this.cache && targetLine >= this.cache.startLine) {
          state = { ...this.cache.state };
          startLine = this.cache.startLine;
        }

        for (let lineIdx = startLine; lineIdx < targetLine; lineIdx += 1) {
          const line = doc.line(lineIdx);
          state = this.processLine(line, state);
        }

        return state;
      }

      private processLine(
        line: LineInfo,
        currentState: FenceState,
        builder?: RangeSetBuilder<Decoration>
      ): FenceState {
        const fence = parseFenceLine(line.text);

        if (fence) {
          if (builder) {
            builder.add(line.from, line.from, DECO_FENCE_LINE);
            builder.add(line.from, line.to, DECO_FENCE_MARK);
          }

          if (!currentState.inFence) {
            return {
              inFence: true,
              activeFenceMarker: fence.marker,
              currentLanguage: fence.language.trim(),
              codeLineNumber: 0,
            };
          }

          if (fence.marker === currentState.activeFenceMarker) {
            return {
              inFence: false,
              activeFenceMarker: "",
              currentLanguage: "",
              codeLineNumber: 0,
            };
          }

          return currentState;
        }

        if (!currentState.inFence) {
          return currentState;
        }

        const nextLineNumber = currentState.codeLineNumber + 1;

        if (builder) {
          const normalizedLang = normalizeLanguage(currentState.currentLanguage);
          builder.add(
            line.from,
            line.from,
            Decoration.line({
              class: `cm-md-codeblock cm-md-codeblock-line cm-md-codeblock-lang-${normalizedLang}`,
              attributes: {
                "data-code-line": String(nextLineNumber),
                "data-code-lang": normalizedLang,
              },
            })
          );
        }

        return { ...currentState, codeLineNumber: nextLineNumber };
      }
    },
    { decorations: (plugin) => plugin.decorations }
  );
}

export function hideMarkdownExceptCurrentLine(): Extension {
  return ViewPlugin.fromClass(
    class HideMarkdownPlugin {
      decorations = Decoration.none;
      viewportState: ViewportState = { line: -1, from: 0, to: 0 };

      update(update: ViewUpdate): void {
        const { state } = update;
        const cursorPos = state.selection.main.head;
        const currentLine = state.doc.lineAt(cursorPos);
        const { shouldUpdate, state: nextViewportState, viewport } = getViewportState(
          update,
          this.viewportState,
          currentLine.number
        );

        if (!shouldUpdate) {
          return;
        }

        this.viewportState = nextViewportState;

        const visibleRange = computeVisibleRange(state, viewport);
        const builder = new RangeSetBuilder<Decoration>();

        syntaxTree(state).iterate({
          from: visibleRange.from,
          to: visibleRange.to,
          enter: ({ type, from, to }) => {
            if (!MARKER_NODES.has(type.name)) return;
            if (from >= currentLine.from && from < currentLine.to) return;

            if (type.name === "CodeMark") {
              const lineText = state.doc.lineAt(from).text.trim();
              if (parseFenceLine(lineText)) {
                builder.add(from, to, DECO_HIDE_FENCE);
                return;
              }
            }

            const endPos = SPACE_EXTENDED_MARKERS.has(type.name) &&
              state.doc.sliceString(to, to + 1) === " "
                ? to + 1
                : to;

            builder.add(from, endPos, DECO_HIDE);
          },
        });

        this.decorations = builder.finish();
      }
    },
    { decorations: (plugin) => plugin.decorations }
  );
}

export function markdownSemanticStyles(): Extension {
  return ViewPlugin.fromClass(
    class SemanticStylesPlugin {
      decorations = Decoration.none;
      viewportState: ViewportState = { line: -1, from: 0, to: 0 };

      update(update: ViewUpdate): void {
        const { state } = update;
        const cursorPos = state.selection.main.head;
        const currentLine = state.doc.lineAt(cursorPos);
        const { shouldUpdate, state: nextViewportState, viewport } = getViewportState(
          update,
          this.viewportState,
          currentLine.number,
          false
        );

        if (!shouldUpdate) {
          return;
        }

        this.viewportState = nextViewportState;

        const visibleRange = computeVisibleRange(state, viewport);
        const builder = new RangeSetBuilder<Decoration>();

        syntaxTree(state).iterate({
          from: visibleRange.from,
          to: visibleRange.to,
          enter: (nodeRef) => {
            const { type, from, to, node } = nodeRef;

            if (type.name === "FencedCode") {
              return false;
            }

            const headingClass = HEADING_CLASSES[type.name];
            if (headingClass) {
              const lineStart = state.doc.lineAt(from).from;
              builder.add(lineStart, lineStart, Decoration.line({ class: headingClass }));
              return;
            }

            const inlineClass = INLINE_MARK_CLASSES[type.name];
            if (inlineClass) {
              builder.add(from, to, Decoration.mark({ class: inlineClass }));
              return;
            }

            if (type.name === "InlineCode") {
              let contentFrom = from;
              let contentTo = to;
              const cursor = node.cursor();
              cursor.firstChild();
              do {
                if (cursor.name === "CodeMark") {
                  if (cursor.from === from) {
                    contentFrom = cursor.to;
                  } else {
                    contentTo = cursor.from;
                  }
                }
              } while (cursor.nextSibling());

              if (contentFrom < contentTo) {
                builder.add(contentFrom, contentTo, Decoration.mark({ class: "cm-md-code" }));
              }
              return false;
            }
          },
        });

        this.decorations = builder.finish();
      }
    },
    { decorations: (plugin) => plugin.decorations }
  );
}
