import type { EditorState, Extension } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import type { LineInfo, Viewport, ViewportState } from "./types";

import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";
import {
  computeVisibleRange,
  normalizeLanguage,
  parseFenceLine,
  shouldRecompute,
} from "./utils";

async function openExternalUrl(url: string): Promise<void> {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

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

interface CodeMarkPosition {
  name: string;
  from: number;
  to: number;
}

export function computeInlineCodeRange(
  nodeFrom: number,
  nodeTo: number,
  children: CodeMarkPosition[]
): { from: number; to: number } | null {
  let contentFrom = nodeFrom;
  let contentTo = nodeTo;

  for (const child of children) {
    if (child.name !== "CodeMark") {
      continue;
    }
    if (child.from === nodeFrom) {
      contentFrom = child.to;
    } else {
      contentTo = child.from;
    }
  }

  return contentFrom < contentTo ? { from: contentFrom, to: contentTo } : null;
}

export function isLinkWidgetClick(target: HTMLElement): boolean {
  return target.classList.contains("cm-link-widget");
}

const DECO_HIDE = Decoration.mark({ class: "cm-hide-markdown" });
const DECO_HIDE_FENCE = Decoration.mark({ class: "cm-hide-markdown-fence" });
const DECO_MARKER = Decoration.mark({ class: "cm-md-marker" });
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

            const isOnCurrentLine = from >= currentLine.from && from < currentLine.to;

            if (type.name === "CodeMark") {
              const lineText = state.doc.lineAt(from).text.trim();
              if (parseFenceLine(lineText)) {
                if (isOnCurrentLine) {
                  builder.add(from, to, DECO_MARKER);
                } else {
                  builder.add(from, to, DECO_HIDE_FENCE);
                }
                return;
              }
            }

            if (isOnCurrentLine) {
              builder.add(from, to, DECO_MARKER);
              return;
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
              const children: CodeMarkPosition[] = [];
              const cursor = node.cursor();
              cursor.firstChild();
              do {
                children.push({ name: cursor.name, from: cursor.from, to: cursor.to });
              } while (cursor.nextSibling());

              // Markdown parser always generates valid InlineCode with content between CodeMarks
              const range = computeInlineCodeRange(from, to, children) as NonNullable<
                ReturnType<typeof computeInlineCodeRange>
              >;
              builder.add(range.from, range.to, Decoration.mark({ class: "cm-md-code" }));
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

class LinkWidget extends WidgetType {
  constructor(
    private readonly text: string,
    private readonly url: string
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "cm-link-widget";
    span.textContent = this.text;
    span.setAttribute("data-url", this.url);
    span.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openExternalUrl(this.url);
    });
    return span;
  }

  eq(other: LinkWidget): boolean {
    return this.text === other.text && this.url === other.url;
  }
}

const DECO_HIDE_LINK = Decoration.mark({ class: "cm-hide-link-syntax" });
const DECO_LINK_ACTIVE = Decoration.mark({ class: "cm-md-link-active" });

interface LinkInfo {
  from: number;
  to: number;
  textFrom: number;
  textTo: number;
  urlFrom: number;
  urlTo: number;
  text: string;
  url: string;
}

function extractLinkInfo(
  state: EditorState,
  linkFrom: number,
  linkTo: number
): LinkInfo | null {
  const fullText = state.doc.sliceString(linkFrom, linkTo);
  const linkMatch = /^\[([^\]]*)\]\(([^)]*)\)$/.exec(fullText);
  
  if (!linkMatch) {
    return null;
  }

  const [, text, url] = linkMatch;
  const textFrom = linkFrom + 1;
  const textTo = textFrom + text.length;
  const urlFrom = textTo + 2;
  const urlTo = urlFrom + url.length;

  return {
    from: linkFrom,
    to: linkTo,
    textFrom,
    textTo,
    urlFrom,
    urlTo,
    text,
    url,
  };
}

export function linkDecorations(): Extension {
  return ViewPlugin.fromClass(
    class LinkDecorationsPlugin {
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
        const decorations: { from: number; to: number; deco: Decoration }[] = [];

        syntaxTree(state).iterate({
          from: visibleRange.from,
          to: visibleRange.to,
          enter: (nodeRef) => {
            const { type, from, to } = nodeRef;

            if (type.name !== "Link") {
              return;
            }

            const linkInfo = extractLinkInfo(state, from, to);
            if (!linkInfo) {
              return false;
            }

            const isOnCurrentLine = from >= currentLine.from && from < currentLine.to;

            if (isOnCurrentLine) {
              decorations.push({
                from: linkInfo.urlFrom,
                to: linkInfo.urlTo,
                deco: DECO_LINK_ACTIVE,
              });
              return false;
            }

            decorations.push({
              from: linkInfo.from,
              to: linkInfo.from + 1,
              deco: DECO_HIDE_LINK,
            });

            decorations.push({
              from: linkInfo.textTo,
              to: linkInfo.to,
              deco: DECO_HIDE_LINK,
            });

            decorations.push({
              from: linkInfo.textFrom,
              to: linkInfo.textTo,
              deco: Decoration.replace({
                widget: new LinkWidget(linkInfo.text, linkInfo.url),
              }),
            });

            return false;
          },
        });

        decorations.sort((a, b) => a.from - b.from || a.to - b.to);

        const builder = new RangeSetBuilder<Decoration>();
        for (const { from, to, deco } of decorations) {
          builder.add(from, to, deco);
        }

        this.decorations = builder.finish();
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
      eventHandlers: {
        mousedown: (event) => isLinkWidgetClick(event.target as HTMLElement),
      },
    }
  );
}
