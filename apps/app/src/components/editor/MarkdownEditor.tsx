import { onMount, onCleanup } from "solid-js";
import { EditorView,  Decoration,  ViewPlugin,  ViewUpdate, keymap } from "@codemirror/view";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap,  history,  historyKeymap } from "@codemirror/commands";

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
      doc: props.initialContent || "Welcome to Noderium",
      extensions: [
        history(),
        markdown(),
        markdownSemanticStyles(),
        hideMarkdownExceptCurrentLine(),
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
          ".cm-md-code": {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            backgroundColor: "rgba(15, 23, 42, 0.06)",
            borderRadius: "0.25rem",
            padding: "0.1rem 0.2rem",
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
