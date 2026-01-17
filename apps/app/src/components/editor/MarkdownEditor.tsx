import { onMount, onCleanup } from "solid-js";
import { EditorView,  Decoration,  ViewPlugin,  ViewUpdate, keymap } from "@codemirror/view";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { defaultHighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap,  history,  historyKeymap } from "@codemirror/commands";
import { languages as codeLanguages } from "@codemirror/language-data";

const MARGIN_LINES = 2;
const FONT_BOLD = "700";

function getVisibleRange(
  state: EditorState,
  viewport: { from: number; to: number }
) {
  const doc = state.doc;
  const fromLine = Math.max(1, doc.lineAt(viewport.from).number - MARGIN_LINES);
  const toLine = Math.min(doc.lines, doc.lineAt(viewport.to).number + MARGIN_LINES);

  return {
    from: doc.line(fromLine).from,
    to: doc.line(toLine).to,
  };
}

function needsRecompute(
  update: ViewUpdate,
  prev: { line: number; from: number; to: number },
  currentLine: number
) {
  const { from, to } = update.view.viewport;

  return (
    update.docChanged ||
    update.viewportChanged ||
    prev.line !== currentLine ||
    prev.from !== from ||
    prev.to !== to
  );
}

function normalizeLanguageClass(language: string) {
  const normalized = language.trim().toLowerCase();

  if (!normalized) {
    return "plain";
  }

  return normalized.replace(/[^a-z0-9_-]/g, "");
}

export function codeBlockDecorations() {
  return ViewPlugin.fromClass(
    class {
      decorations = Decoration.none;

      update(update: ViewUpdate) {
        if (!update.docChanged && !update.viewportChanged) {
          return;
        }

        const state = update.state;
        const viewport = update.view.viewport;
        const { from, to } = getVisibleRange(state, viewport);
        const doc = state.doc;
        const builder = new RangeSetBuilder<Decoration>();

        let inFence = false;
        let fenceMarker = "";
        let language = "";
        let lineNumber = 0;

        for (let lineNumberIndex = 1; lineNumberIndex <= doc.lines; lineNumberIndex += 1) {
          const line = doc.line(lineNumberIndex);
          const match = line.text.match(/^(```|~~~)(.*)$/);

          if (match) {
            const marker = match[1];
            const lineInView = !(line.to < from || line.from > to);

            if (lineInView) {
              builder.add(
                line.from,
                line.from,
                Decoration.line({ class: "cm-md-codeblock-fence" })
              );
              builder.add(
                line.from,
                line.to,
                Decoration.mark({ class: "cm-md-codeblock-fence-text" })
              );
            }

            if (!inFence) {
              inFence = true;
              fenceMarker = marker;
              language = match[2].trim();
              lineNumber = 0;
            } else if (marker === fenceMarker) {
              inFence = false;
              fenceMarker = "";
              language = "";
              lineNumber = 0;
            }

            continue;
          }

          if (!inFence) {
            continue;
          }

          lineNumber += 1;

          if (line.to < from || line.from > to) {
            continue;
          }

          const languageClass = `cm-md-codeblock-lang-${normalizeLanguageClass(language)}`;
          builder.add(
            line.from,
            line.from,
            Decoration.line({
              class: `cm-md-codeblock cm-md-codeblock-line ${languageClass}`,
              attributes: {
                "data-code-line": String(lineNumber),
                "data-code-lang": normalizeLanguageClass(language),
              },
            })
          );
        }

        this.decorations = builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

export function hideMarkdownExceptCurrentLine() {
  const hide = Decoration.mark({ class: "cm-hide-markdown" });
  const hideFence = Decoration.mark({ class: "cm-hide-markdown-fence" });
  const markerNodes = new Set([
    "CodeMark",
    "EmphasisMark",
    "HeaderMark",
    "QuoteMark",
  ]);

  return ViewPlugin.fromClass(
    class {
      decorations = Decoration.none;
      state = { line: -1, from: 0, to: 0 };

      update(update: ViewUpdate) {
        const state = update.state;
        const head = state.selection.main.head;
        const currentLine = state.doc.lineAt(head);
        const viewport = update.view.viewport;

        if (!needsRecompute(update, this.state, currentLine.number)) {
          return;
        }
        
        this.state = {
          line: currentLine.number,
          from: viewport.from,
          to: viewport.to,
        };

        const { from, to } = getVisibleRange(state, viewport);
        const builder = new RangeSetBuilder<Decoration>();

        syntaxTree(state).iterate({
          from,
          to,
          enter: (node) => {
            if (!markerNodes.has(node.type.name)) {
              return;
            }

            if (node.from >= currentLine.from && node.from < currentLine.to) {
              return;
            }

            if (node.type.name === "CodeMark") {
              const line = state.doc.lineAt(node.from);
              const trimmed = line.text.trim();

              if (trimmed.startsWith("```")) {
                builder.add(node.from, node.to, hideFence);
                return;
              }
            }

            let endPos = node.to;
            
            if (node.type.name === "HeaderMark" || node.type.name === "QuoteMark") {
              const nextChar = state.doc.sliceString(node.to, node.to + 1);
              
              if (nextChar === " ") {
                endPos = node.to + 1;
              }
            }

            builder.add(node.from, endPos, hide);
          },
        });

        this.decorations = builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

const headingLineClasses: Record<string, string> = {
  ATXHeading1: "cm-md-heading-1",
  ATXHeading2: "cm-md-heading-2",
  ATXHeading3: "cm-md-heading-3",
  ATXHeading4: "cm-md-heading-4",
  ATXHeading5: "cm-md-heading-5",
  ATXHeading6: "cm-md-heading-6",
  SetextHeading1: "cm-md-heading-1",
  SetextHeading2: "cm-md-heading-2",
};

const inlineMarkClasses = new Map<string, string>([
  ["StrongEmphasis", "cm-md-strong"],
  ["Emphasis", "cm-md-emphasis"],
  ["InlineCode", "cm-md-code"],
  ["CodeText", "cm-md-code"],
]);

export function markdownSemanticStyles() {
  return ViewPlugin.fromClass(
    class {
      decorations = Decoration.none;
      state = { line: -1, from: 0, to: 0 };

      update(update: ViewUpdate) {
        const state = update.state;
        const viewport = update.view.viewport;
        const head = state.selection.main.head;
        const currentLine = state.doc.lineAt(head);

        if (!needsRecompute(update, this.state, currentLine.number)) {
          return;
        }

        this.state = {
          line: currentLine.number,
          from: viewport.from,
          to: viewport.to,
        };

        const { from, to } = getVisibleRange(state, viewport);
        const doc = state.doc;
        const builder = new RangeSetBuilder<Decoration>();

        syntaxTree(state).iterate({
          from,
          to,
          enter: (node) => {
            const headingClass =  headingLineClasses[node.type.name];

            if (headingClass) {
              const lineStart = doc.lineAt(node.from).from;
              builder.add(
                lineStart,
                lineStart,
                Decoration.line({ class: headingClass })
              );
              
              return;
            }

            const markClass = inlineMarkClasses.get(node.type.name);

            if (markClass) {
              builder.add(
                node.from,
                node.to,
                Decoration.mark({ class: markClass })
              );
            }
          },
        });

        this.decorations = builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

interface MarkdownEditorProps {
  initialContent?: string;
  class?: string;
  onReady?: (view: EditorView) => void;
}

export default function MarkdownEditor(
  props: MarkdownEditorProps
) {
  let container!: HTMLDivElement;
  let view: EditorView | null = null;

  onMount(() => {
    const state = EditorState.create({
      doc: props.initialContent || `Welcome to Noderium`,
      extensions: [
        history(),
        markdown({ codeLanguages }),
        codeBlockDecorations(),
        markdownSemanticStyles(),
        hideMarkdownExceptCurrentLine(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px"
          },
          ".cm-scroller": {
            fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          ".cm-content": {
            minHeight: "100%",
            padding: "1rem",
            caretColor: "currentColor"
          },
          ".cm-editor": { 
            height: "100%"
          },
          ".cm-md-heading-1": {
            fontSize: "2rem",
            fontWeight: FONT_BOLD,
          },
          ".cm-md-heading-2": {
            fontSize: "1.75rem",
            fontWeight: FONT_BOLD,
          },
          ".cm-md-heading-3": {
            fontSize: "1.5rem",
            fontWeight: FONT_BOLD,
          },
          ".cm-md-heading-4": {
            fontSize: "1.25rem",
            fontWeight: FONT_BOLD,
          },
          ".cm-md-heading-5": {
            fontSize: "1.1rem",
            fontWeight: FONT_BOLD,
          },
          ".cm-md-heading-6": {
            fontSize: "1rem",
            fontWeight: FONT_BOLD,
          },
          ".cm-md-strong": { 
            fontWeight: FONT_BOLD 
          },
          ".cm-md-emphasis": {
            fontStyle: "italic"
          },
          ".cm-line": {
            padding: "0",
          },
          ".cm-md-code": {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            backgroundColor: "rgba(15, 23, 42, 0.06)",
            borderRadius: "0.25rem",
            padding: "0.1rem 0.2rem",
          },
          ".cm-md-codeblock": {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
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
          ".cm-md-codeblock-lang-typescript": {
            borderLeft: "2px solid #3178c6",
          },
          ".cm-md-codeblock-lang-javascript": {
            borderLeft: "2px solid #f7df1e",
          },
          ".cm-md-list-bullet-widget::before": {
            content: "'•'",
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
        }),
      ],
    });

    view = new EditorView({
      state,
      parent: container,
    });

    props.onReady?.(view);
  });

  onCleanup(() => {
    view?.destroy();
    view = null;
  });

  return (
    <div
      ref={(el) => { container = el }}
      class={props.class}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
