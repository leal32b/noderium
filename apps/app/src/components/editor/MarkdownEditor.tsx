import { onMount, onCleanup } from "solid-js";
import { EditorView, keymap, Decoration, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";

// Extensão otimizada: processa apenas viewport + linha atual
function hideMarkdownExceptCurrentLine() {
  const hide = Decoration.mark({ class: "cm-hide-markdown" });
  const markerNodes = new Set(["CodeMark", "EmphasisMark", "HeaderMark", "QuoteMark"]);
  const trailingSpaceNodes = new Set(["HeaderMark", "QuoteMark"]);
  const marginLines = 2;

  return ViewPlugin.fromClass(
    class {
      decorations = Decoration.none;
      private lastLine = -1;
      private lastViewport = { from: 0, to: 0 };

      update(update: ViewUpdate) {
        const state = update.state;
        const head = state.selection.main.head;
        const viewport = update.view.viewport;

        const currentLineInfo = state.doc.lineAt(head);
        const currentLine = currentLineInfo.number - 1;

        // Recalcular apenas se necessário
        const needsUpdate =
          update.docChanged ||
          update.viewportChanged ||
          currentLine !== this.lastLine ||
          viewport.from !== this.lastViewport.from ||
          viewport.to !== this.lastViewport.to;

        if (!needsUpdate) return;

        this.lastLine = currentLine;
        this.lastViewport = viewport;

        const builder = new RangeSetBuilder<Decoration>();
        const doc = state.doc;
        const viewportFrom = doc.lineAt(viewport.from).number;
        const viewportTo = doc.lineAt(viewport.to).number;

        const startLine = Math.max(1, viewportFrom - marginLines);
        const endLine = Math.min(doc.lines, viewportTo + marginLines);
        const from = doc.line(startLine).from;
        const to = doc.line(endLine).to;

        const currentFrom = currentLineInfo.from;
        const currentTo = currentLineInfo.to;

        const tree = syntaxTree(state);
        tree.iterate({
          from,
          to,
          enter: (node) => {
            if (!markerNodes.has(node.type.name)) return;

            // Não esconder marcadores na linha atual
            if (node.from >= currentFrom && node.from < currentTo) return;

            let fromPos = node.from;
            let toPos = node.to;

            // Expandir para consumir o espaço só para marcadores de bloco
            if (
              trailingSpaceNodes.has(node.type.name) &&
              toPos < doc.length &&
              doc.sliceString(toPos, toPos + 1) === " "
            ) {
              toPos += 1;
            }

            builder.add(fromPos, toPos, hide);
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

// Aplica estilo semântico aos blocos e trechos markdown sem exibir os marcadores
function markdownSemanticStyles() {
  const marginLines = 2;

  return ViewPlugin.fromClass(
    class {
      decorations = Decoration.none;
      private lastViewport = { from: 0, to: 0 };
      private lastDocLength = 0;
      private lastLine = -1;

      update(update: ViewUpdate) {
        const state = update.state;
        const viewport = update.view.viewport;
        const head = state.selection.main.head;
        const currentLineInfo = state.doc.lineAt(head);
        const currentLine = currentLineInfo.number - 1;
        const currentFrom = currentLineInfo.from;
        const currentTo = currentLineInfo.to;

        const needsUpdate =
          update.docChanged ||
          update.viewportChanged ||
          state.doc.length !== this.lastDocLength ||
          currentLine !== this.lastLine ||
          viewport.from !== this.lastViewport.from ||
          viewport.to !== this.lastViewport.to;

        if (!needsUpdate) return;

        this.lastViewport = viewport;
        this.lastDocLength = state.doc.length;
        this.lastLine = currentLine;

        const builder = new RangeSetBuilder<Decoration>();
        const doc = state.doc;
        const viewportFrom = doc.lineAt(viewport.from).number;
        const viewportTo = doc.lineAt(viewport.to).number;
        const fromLine = Math.max(1, viewportFrom - marginLines);
        const toLine = Math.min(doc.lines, viewportTo + marginLines);
        const from = doc.line(fromLine).from;
        const to = doc.line(toLine).to;

        const tree = syntaxTree(state);
        tree.iterate({
          from,
          to,
          enter: (node) => {
            const headingClass = headingLineClasses[node.type.name];
            if (headingClass) {
              const lineStart = doc.lineAt(node.from).from;
              builder.add(lineStart, lineStart, Decoration.line({ class: headingClass }));
              return;
            }

            const markClass = inlineMarkClasses.get(node.type.name);
            if (markClass) {
              builder.add(node.from, node.to, Decoration.mark({ class: markClass }));
            }

            if (node.type.name === "ListMark") {
              const raw = doc.sliceString(node.from, node.to);
              const isOrdered = /^\s*\d+\./.test(raw);
              const isBullet = /^\s*[-+*]/.test(raw);
              const onCurrentLine = node.from >= currentFrom && node.from < currentTo;

              if (isOrdered) {
                builder.add(node.from, node.to, Decoration.mark({ class: "cm-md-list-ordered" }));
                return;
              }

              if (isBullet) {
                if (onCurrentLine) {
                  builder.add(
                    node.from,
                    node.to,
                    Decoration.mark({ class: "cm-md-list-bullet-on" })
                  );
                } else {
                  builder.add(
                    node.from,
                    node.to,
                    Decoration.replace({
                      widget: new ListBulletWidget("• "),
                      inclusive: false,
                    })
                  );
                }
              }
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

class ListBulletWidget extends WidgetType {
  constructor(private text: string) {
    super();
  }

  eq(other: ListBulletWidget) {
    return this.text === other.text;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-md-list-bullet-widget";
    // Usa pseudo-elemento para renderizar o marcador padrão (disc)
    span.textContent = "";
    return span;
  }
}

interface MarkdownEditorProps {
  initialContent?: string;
  class?: string;
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  let editorContainer!: HTMLDivElement;
  let view: EditorView | null = null;

  onMount(() => {
    // Minimal optimized editor configuration
    const state = EditorState.create({
      doc: props.initialContent || `# Welcome to Noderium

## Headers

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Text Formatting

This is **bold text** using asterisks.
This is __bold text__ using underscores.
This is *italic text* using asterisks.
This is \`inline code\` in a sentence.

## Lists

### Bullet List
- First item
- Second item
- Third item
  - Nested item
  - Another nested item

### Numbered List
1. First numbered item
2. Second numbered item
3. Third numbered item

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
> Perfect for quotes or callouts.

## Code Blocks

\`\`\`javascript
function greet(name) {
  console.log("Hello, " + name + "!");
  return "Welcome to Noderium";
}
\`\`\`

## Mixed Examples

You can combine **bold** and *italic* text, use \`code\` inline, and create:

- Lists with **bold items**
- Lists with *italic items*
- Lists with \`code items\`

> Blockquotes can also contain **formatted** text and \`code\`.

Start writing your notes...`,
      extensions: [
        history(),
        markdown(),
        markdownSemanticStyles(),
        hideMarkdownExceptCurrentLine(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-scroller": {
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          ".cm-content": {
            minHeight: "100%",
            padding: "1rem",
          },
          ".cm-editor": {
            height: "100%",
          },
          ".cm-md-heading-1": {
            fontSize: "2rem",
            fontWeight: "700",
            lineHeight: "1.25",
          },
          ".cm-md-heading-2": {
            fontSize: "1.75rem",
            fontWeight: "700",
            lineHeight: "1.3",
          },
          ".cm-md-heading-3": {
            fontSize: "1.5rem",
            fontWeight: "700",
            lineHeight: "1.35",
          },
          ".cm-md-heading-4": {
            fontSize: "1.25rem",
            fontWeight: "700",
            lineHeight: "1.4",
          },
          ".cm-md-heading-5": {
            fontSize: "1.1rem",
            fontWeight: "700",
            lineHeight: "1.45",
          },
          ".cm-md-heading-6": {
            fontSize: "1rem",
            fontWeight: "700",
            lineHeight: "1.45",
          },
          ".cm-md-strong": {
            fontWeight: "700",
          },
          ".cm-md-emphasis": {
            fontStyle: "italic",
          },
          ".cm-md-code": {
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
            backgroundColor: "rgba(15, 23, 42, 0.06)",
            padding: "0.1rem 0",
            borderRadius: "0.25rem",
          },
          ".cm-md-list-ordered": {
            color: "inherit",
            paddingRight: "0.35em",
            display: "inline-block",
            minWidth: "1.2em",
          },
          ".cm-md-list-bullet-on": {
            color: "inherit",
            paddingRight: "0.35em",
            display: "inline-block",
            width: "0.8em",
            textAlign: "center",
          },
          ".cm-md-list-bullet-widget": {
            color: "inherit",
            fontFamily: "inherit",
            pointerEvents: "none",
            userSelect: "none",
            display: "inline-block",
            width: "0.8em",
            marginLeft: "0",
            marginRight: "0.35em",
            textAlign: "center",
          },
          ".cm-md-list-bullet-widget::before": {
            content: "'•'",
          },
          // Esconder marcadores markdown visualmente (mantém espaço mas esconde caractere)
          ".cm-hide-markdown": {
            color: "transparent",
            fontSize: "0",
            letterSpacing: "0",
          },
        }),
      ],
    });

    view = new EditorView({
      state,
      parent: editorContainer,
    });
  });

  onCleanup(() => {
    view?.destroy();
  });

  return (
    <div
      ref={editorContainer}
      class={props.class}
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
}
