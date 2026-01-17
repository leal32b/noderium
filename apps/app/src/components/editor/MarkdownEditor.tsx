import { onMount, onCleanup } from "solid-js";
import {
  type KeyBinding,
  type ViewUpdate,
  Decoration,
  EditorView,
  ViewPlugin,
  keymap,
} from "@codemirror/view";
import { type Extension, EditorState, RangeSetBuilder } from "@codemirror/state";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  syntaxTree,
} from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { languages as codeLanguages } from "@codemirror/language-data";

// ============================================================================
// Types
// ============================================================================

interface MarkdownEditorProps {
  initialContent?: string;
  class?: string;
  onReady?: (view: EditorView) => void;
}

interface LineInfo {
  readonly from: number;
  readonly to: number;
  readonly text: string;
}

interface ViewportState {
  line: number;
  from: number;
  to: number;
}

interface Viewport {
  readonly from: number;
  readonly to: number;
}

// ============================================================================
// Constants
// ============================================================================

const VIEWPORT_MARGIN = 2;
const FONT_WEIGHT_BOLD = "700" as const;
const DEFAULT_CONTENT = "Welcome to Noderium";
const LANGUAGE_SANITIZE_PATTERN = /[^a-z0-9_-]/g;
const DEFAULT_LANGUAGE = "plain";
const FENCE_MARKERS = ["```", "~~~"] as const;

const FONT_SANS = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const LIST_CONTAINER_NODES: ReadonlySet<string> = new Set([
  "ListItem",
  "BulletList",
  "OrderedList",
  "Document",
]);

const MARKER_NODES: ReadonlySet<string> = new Set([
  "CodeMark",
  "EmphasisMark",
  "HeaderMark",
  "QuoteMark",
]);

const SPACE_EXTENDED_MARKERS: ReadonlySet<string> = new Set(["HeaderMark", "QuoteMark"]);

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

// ============================================================================
// Decoration Instances (Reusable)
// ============================================================================

const DECO_HIDE = Decoration.mark({ class: "cm-hide-markdown" });
const DECO_HIDE_FENCE = Decoration.mark({ class: "cm-hide-markdown-fence" });
const DECO_FENCE_LINE = Decoration.line({ class: "cm-md-codeblock-fence" });
const DECO_FENCE_MARK = Decoration.mark({ class: "cm-md-codeblock-fence-text" });

// ============================================================================
// Types for Parsing
// ============================================================================

interface FenceMatch {
  marker: string;
  language: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function parseFenceLine(text: string): FenceMatch | null {
  for (const marker of FENCE_MARKERS) {
    if (text.startsWith(marker)) {
      return {
        marker,
        language: text.slice(marker.length),
      };
    }
  }
  return null;
}

function getLeadingWhitespace(text: string): string {
  const trimmed = text.trimStart();
  return text.slice(0, text.length - trimmed.length);
}

function computeVisibleRange(state: EditorState, viewport: Viewport): Viewport {
  const { doc } = state;
  const fromLine = Math.max(1, doc.lineAt(viewport.from).number - VIEWPORT_MARGIN);
  const toLine = Math.min(doc.lines, doc.lineAt(viewport.to).number + VIEWPORT_MARGIN);

  return {
    from: doc.line(fromLine).from,
    to: doc.line(toLine).to,
  };
}

function shouldRecompute(
  update: ViewUpdate,
  prev: ViewportState,
  currentLineNumber: number
): boolean {
  if (update.docChanged || update.viewportChanged) {
    return true;
  }

  const { from, to } = update.view.viewport;

  return prev.line !== currentLineNumber || prev.from !== from || prev.to !== to;
}

function normalizeLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();

  return normalized
    ? normalized.replace(LANGUAGE_SANITIZE_PATTERN, "")
    : DEFAULT_LANGUAGE;
}

function isLineInViewport(line: LineInfo, viewport: Viewport): boolean {
  return line.to >= viewport.from && line.from <= viewport.to;
}

// ============================================================================
// List Handling
// ============================================================================

export function isEmptyListItem(state: EditorState, line: LineInfo): boolean {
  const tree = syntaxTree(state);
  let hasListMark = false;
  let hasContent = false;

  tree.iterate({
    from: line.from,
    to: line.to,
    enter: ({ type, from, to }) => {
      if (type.name === "ListMark") {
        hasListMark = true;
        return;
      }

      if (LIST_CONTAINER_NODES.has(type.name)) {
        return;
      }

      const isWithinLine = from >= line.from && to <= line.to;
      if (isWithinLine && state.doc.sliceString(from, to).trim()) {
        hasContent = true;
      }
    },
  });

  return hasListMark && !hasContent;
}

export function handleEnterInList(view: EditorView): boolean {
  const { state } = view;
  const { head } = state.selection.main;
  const line = state.doc.lineAt(head);

  if (!isEmptyListItem(state, line)) {
    return false;
  }

  const leadingWhitespace = getLeadingWhitespace(line.text);

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: leadingWhitespace },
    selection: { anchor: line.from + leadingWhitespace.length },
  });

  return true;
}

const listKeymap: readonly KeyBinding[] = [
  { key: "Enter", run: handleEnterInList },
];

// ============================================================================
// Code Block Decorations
// ============================================================================

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

// ============================================================================
// Hide Markdown Markers
// ============================================================================

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

// ============================================================================
// Semantic Styles
// ============================================================================

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

// ============================================================================
// Theme
// ============================================================================

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
  },
  ".cm-scroller": {
    fontFamily: FONT_SANS,
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "1rem",
    caretColor: "currentColor",
  },
  ".cm-editor": {
    height: "100%",
  },
  ".cm-line": {
    padding: "0",
  },
  ".cm-md-heading-1": { fontSize: "2rem", fontWeight: FONT_WEIGHT_BOLD, textDecoration: "none" },
  ".cm-md-heading-2": { fontSize: "1.75rem", fontWeight: FONT_WEIGHT_BOLD, textDecoration: "none" },
  ".cm-md-heading-3": { fontSize: "1.5rem", fontWeight: FONT_WEIGHT_BOLD, textDecoration: "none" },
  ".cm-md-heading-4": { fontSize: "1.25rem", fontWeight: FONT_WEIGHT_BOLD, textDecoration: "none" },
  ".cm-md-heading-5": { fontSize: "1.1rem", fontWeight: FONT_WEIGHT_BOLD, textDecoration: "none" },
  ".cm-md-heading-6": { fontSize: "1rem", fontWeight: FONT_WEIGHT_BOLD, textDecoration: "none" },
  ".cm-md-heading-1 span, .cm-md-heading-2 span, .cm-md-heading-3 span, .cm-md-heading-4 span, .cm-md-heading-5 span, .cm-md-heading-6 span": {
    textDecoration: "none !important",
  },
  ".cm-md-strong": { fontWeight: FONT_WEIGHT_BOLD },
  ".cm-md-emphasis": { fontStyle: "italic" },
  ".cm-md-code": {
    fontFamily: FONT_MONO,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    borderRadius: "0.25rem",
    padding: "0.1rem 0.2rem",
  },
  ".cm-md-codeblock": {
    fontFamily: FONT_MONO,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderLeft: "2px solid green",
  },
  ".cm-md-codeblock-line": {
    position: "relative",
    paddingLeft: "2.5rem",
  },
  ".cm-md-codeblock-line::before": {
    content: "attr(data-code-line)",
    position: "absolute",
    left: "0",
    width: "2rem",
    textAlign: "right",
    color: "rgba(148, 163, 184, 0.9)",
    fontVariantNumeric: "tabular-nums",
  },
  ".cm-md-codeblock-fence": {
    backgroundColor: "transparent",
    color: "inherit",
    fontFamily: "inherit",
  },
  ".cm-md-codeblock-fence-text": {
    fontFamily: "inherit",
    color: "inherit",
    backgroundColor: "transparent",
  },
  ".cm-md-codeblock-fence span": {
    color: "inherit",
  },
  ".cm-hide-markdown": {
    position: "absolute",
    width: "0",
    height: "0",
    opacity: "0",
    pointerEvents: "none",
  },
  ".cm-hide-markdown-fence": {
    display: "inline-block",
    width: "0",
    opacity: "0",
    pointerEvents: "none",
  },
});

// ============================================================================
// Editor Extensions
// ============================================================================

function createEditorExtensions(): Extension[] {
  return [
    history(),
    markdown({ codeLanguages }),
    codeBlockDecorations(),
    markdownSemanticStyles(),
    hideMarkdownExceptCurrentLine(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...listKeymap, ...defaultKeymap, ...historyKeymap]),
    editorTheme,
  ];
}

// ============================================================================
// Component
// ============================================================================

export default function MarkdownEditor(props: MarkdownEditorProps) {
  let containerRef!: HTMLDivElement;
  let editorView: EditorView | null = null;

  onMount(() => {
    const state = EditorState.create({
      doc: props.initialContent ?? DEFAULT_CONTENT,
      extensions: createEditorExtensions(),
    });

    editorView = new EditorView({
      state,
      parent: containerRef,
    });

    props.onReady?.(editorView);
  });

  onCleanup(() => {
    editorView?.destroy();
    editorView = null;
  });

  return (
    <div
      ref={(el) => { containerRef = el; }}
      class={props.class}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
