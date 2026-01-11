import { onMount, onCleanup } from "solid-js";
import { EditorView, keymap, Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";

// Extensão otimizada: processa apenas viewport + linha atual
function hideMarkdownExceptCurrentLine() {
  const hide = Decoration.mark({ class: "cm-hide-markdown" });

  // Regex compilados uma única vez
  const patterns = {
    header: /^(#{1,6})\s/gm,
    boldAsterisk: /\*\*([^*]+)\*\*/g,
    boldUnderscore: /__([^_]+)__/g,
    italicAsterisk: /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    code: /`([^`]+)`/g,
    listBullet: /^(\s*)([-*+])\s/gm,
    listNumber: /^(\s*)(\d+\.)\s/gm,
    blockquote: /^(\s*)>\s/gm,
  };

  function processLine(
    line: { from: number; to: number; text: string },
    currentLineNum: number,
    lineNum: number,
    builder: RangeSetBuilder<Decoration>
  ) {
    // Pular linha atual
    if (lineNum === currentLineNum) return;

    const lineOffset = line.from;
    let match: RegExpExecArray | null;

    // Headers
    patterns.header.lastIndex = 0;
    while ((match = patterns.header.exec(line.text)) !== null) {
      builder.add(
        lineOffset + match.index,
        lineOffset + match.index + match[1].length + 1,
        hide
      );
    }

    // Bold **
    patterns.boldAsterisk.lastIndex = 0;
    while ((match = patterns.boldAsterisk.exec(line.text)) !== null) {
      const start = lineOffset + match.index;
      const end = start + 2 + match[1].length;
      builder.add(start, start + 2, hide);
      builder.add(end, end + 2, hide);
    }

    // Bold __
    patterns.boldUnderscore.lastIndex = 0;
    while ((match = patterns.boldUnderscore.exec(line.text)) !== null) {
      const start = lineOffset + match.index;
      const end = start + 2 + match[1].length;
      builder.add(start, start + 2, hide);
      builder.add(end, end + 2, hide);
    }

    // Italic
    patterns.italicAsterisk.lastIndex = 0;
    while ((match = patterns.italicAsterisk.exec(line.text)) !== null) {
      const start = lineOffset + match.index;
      const end = start + 1 + match[1].length;
      builder.add(start, start + 1, hide);
      builder.add(end, end + 1, hide);
    }

    // Code
    patterns.code.lastIndex = 0;
    while ((match = patterns.code.exec(line.text)) !== null) {
      const start = lineOffset + match.index;
      const end = start + 1 + match[1].length;
      builder.add(start, start + 1, hide);
      builder.add(end, end + 1, hide);
    }

    // List bullet
    patterns.listBullet.lastIndex = 0;
    while ((match = patterns.listBullet.exec(line.text)) !== null) {
      const start = lineOffset + match.index + match[1].length;
      builder.add(start, start + 2, hide);
    }

    // List number
    patterns.listNumber.lastIndex = 0;
    while ((match = patterns.listNumber.exec(line.text)) !== null) {
      const start = lineOffset + match.index + match[1].length;
      builder.add(start, start + match[2].length + 1, hide);
    }

    // Blockquote
    patterns.blockquote.lastIndex = 0;
    while ((match = patterns.blockquote.exec(line.text)) !== null) {
      const start = lineOffset + match.index + match[1].length;
      builder.add(start, start + 2, hide);
    }
  }

  return ViewPlugin.fromClass(
    class {
      decorations = Decoration.none;
      private lastHead = -1;
      private lastViewport = { from: 0, to: 0 };

      update(update: ViewUpdate) {
        const state = update.state;
        const head = state.selection.main.head;
        const viewport = update.view.viewport;

        // Recalcular apenas se necessário
        const needsUpdate =
          update.selectionSet ||
          update.viewportChanged ||
          update.docChanged ||
          head !== this.lastHead ||
          viewport.from !== this.lastViewport.from ||
          viewport.to !== this.lastViewport.to;

        if (!needsUpdate) return;

        this.lastHead = head;
        this.lastViewport = viewport;

        const currentLine = state.doc.lineAt(head).number - 1;
        const viewportFrom = state.doc.lineAt(viewport.from).number - 1;
        const viewportTo = state.doc.lineAt(viewport.to).number - 1;

        const builder = new RangeSetBuilder<Decoration>();

        // Processar apenas viewport + margem pequena (2 linhas)
        const startLine = Math.max(0, viewportFrom - 2);
        const endLine = Math.min(state.doc.lines - 1, viewportTo + 2);

        for (let i = startLine; i <= endLine; i++) {
          const line = state.doc.line(i + 1);
          processLine(line, currentLine, i, builder);
        }

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
        hideMarkdownExceptCurrentLine(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-scroller": {
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
          },
          ".cm-content": {
            minHeight: "100%",
            padding: "1rem",
          },
          ".cm-editor": {
            height: "100%",
          },
          // Esconder marcadores markdown visualmente (mantém espaço mas esconde caractere)
          ".cm-hide-markdown": {
            color: "transparent",
            fontSize: "0",
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
