import type { Extension } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { Decoration, ViewPlugin } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import type { FenceMatch, LineInfo, Viewport, ViewportState } from "./types";
import {
  computeVisibleRange,
  isLineInViewport,
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
  InlineCode: "cm-md-code",
  CodeText: "cm-md-code",
};

const DECO_HIDE = Decoration.mark({ class: "cm-hide-markdown" });
const DECO_HIDE_FENCE = Decoration.mark({ class: "cm-hide-markdown-fence" });
const DECO_FENCE_LINE = Decoration.line({ class: "cm-md-codeblock-fence" });
const DECO_FENCE_MARK = Decoration.mark({ class: "cm-md-codeblock-fence-text" });

export function codeBlockDecorations(): Extension {
  return ViewPlugin.fromClass(
    class CodeBlockPlugin {
      decorations = Decoration.none;

      update(update: ViewUpdate): void {
        if (!update.docChanged && !update.viewportChanged) {
          return;
        }

        const { state, view } = update;
        const visibleRange = computeVisibleRange(state, view.viewport);
        const { doc } = state;
        const builder = new RangeSetBuilder<Decoration>();

        let inFence = false;
        let activeFenceMarker = "";
        let currentLanguage = "";
        let codeLineNumber = 0;

        for (let lineIdx = 1; lineIdx <= doc.lines; lineIdx += 1) {
          const line = doc.line(lineIdx);
          const fence = parseFenceLine(line.text);

          if (fence) {
            this.handleFenceLine(
              builder,
              line,
              fence,
              visibleRange,
              { inFence, activeFenceMarker },
              (newState) => {
                inFence = newState.inFence;
                activeFenceMarker = newState.marker;
                currentLanguage = newState.language;
                codeLineNumber = 0;
              }
            );
            continue;
          }

          if (!inFence) continue;

          codeLineNumber += 1;

          if (!isLineInViewport(line, visibleRange)) continue;

          const normalizedLang = normalizeLanguage(currentLanguage);
          builder.add(
            line.from,
            line.from,
            Decoration.line({
              class: `cm-md-codeblock cm-md-codeblock-line cm-md-codeblock-lang-${normalizedLang}`,
              attributes: {
                "data-code-line": String(codeLineNumber),
                "data-code-lang": normalizedLang,
              },
            })
          );
        }

        this.decorations = builder.finish();
      }

      private handleFenceLine(
        builder: RangeSetBuilder<Decoration>,
        line: LineInfo,
        fence: FenceMatch,
        visibleRange: Viewport,
        currentState: { inFence: boolean; activeFenceMarker: string },
        updateState: (state: { inFence: boolean; marker: string; language: string }) => void
      ): void {
        if (isLineInViewport(line, visibleRange)) {
          builder.add(line.from, line.from, DECO_FENCE_LINE);
          builder.add(line.from, line.to, DECO_FENCE_MARK);
        }

        if (!currentState.inFence) {
          updateState({
            inFence: true,
            marker: fence.marker,
            language: fence.language.trim(),
          });
        } else if (fence.marker === currentState.activeFenceMarker) {
          updateState({ inFence: false, marker: "", language: "" });
        }
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
        const { state, view } = update;
        const cursorPos = state.selection.main.head;
        const currentLine = state.doc.lineAt(cursorPos);
        const { viewport } = view;

        if (!shouldRecompute(update, this.viewportState, currentLine.number)) {
          return;
        }

        this.viewportState = {
          line: currentLine.number,
          from: viewport.from,
          to: viewport.to,
        };

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
              if (lineText.startsWith("```")) {
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
        const { state, view } = update;
        const cursorPos = state.selection.main.head;
        const currentLine = state.doc.lineAt(cursorPos);
        const { viewport } = view;

        if (!shouldRecompute(update, this.viewportState, currentLine.number)) {
          return;
        }

        this.viewportState = {
          line: currentLine.number,
          from: viewport.from,
          to: viewport.to,
        };

        const visibleRange = computeVisibleRange(state, viewport);
        const builder = new RangeSetBuilder<Decoration>();

        syntaxTree(state).iterate({
          from: visibleRange.from,
          to: visibleRange.to,
          enter: ({ type, from, to }) => {
            const headingClass = HEADING_CLASSES[type.name];
            if (headingClass) {
              const lineStart = state.doc.lineAt(from).from;
              builder.add(lineStart, lineStart, Decoration.line({ class: headingClass }));
              return;
            }

            const inlineClass = INLINE_MARK_CLASSES[type.name];
            if (inlineClass) {
              builder.add(from, to, Decoration.mark({ class: inlineClass }));
            }
          },
        });

        this.decorations = builder.finish();
      }
    },
    { decorations: (plugin) => plugin.decorations }
  );
}
