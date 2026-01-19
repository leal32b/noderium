import { EditorView } from "@codemirror/view";

const FONT_WEIGHT_BOLD = "700" as const;
const FONT_SANS = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const editorTheme = EditorView.theme({
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
  ".cm-md-heading-1": {
    fontSize: "2rem",
    fontWeight: FONT_WEIGHT_BOLD,
    textDecoration: "none",
  },
  ".cm-md-heading-2": {
    fontSize: "1.75rem",
    fontWeight: FONT_WEIGHT_BOLD,
    textDecoration: "none",
  },
  ".cm-md-heading-3": {
    fontSize: "1.5rem",
    fontWeight: FONT_WEIGHT_BOLD,
    textDecoration: "none",
  },
  ".cm-md-heading-4": {
    fontSize: "1.25rem",
    fontWeight: FONT_WEIGHT_BOLD,
    textDecoration: "none",
  },
  ".cm-md-heading-5": {
    fontSize: "1.1rem",
    fontWeight: FONT_WEIGHT_BOLD,
    textDecoration: "none",
  },
  ".cm-md-heading-6": {
    fontSize: "1rem",
    fontWeight: FONT_WEIGHT_BOLD,
    textDecoration: "none",
  },
  ".cm-md-heading-1 span, .cm-md-heading-2 span, .cm-md-heading-3 span, .cm-md-heading-4 span, .cm-md-heading-5 span, .cm-md-heading-6 span": {
    textDecoration: "none !important",
  },
  ".cm-md-strong": {
    fontWeight: FONT_WEIGHT_BOLD,
  },
  ".cm-md-emphasis": {
    fontStyle: "italic",
  },
  ".cm-md-code": {
    fontFamily: FONT_MONO,
    backgroundColor: "var(--editor-inline-code-bg, rgba(15, 23, 42, 0.06))",
    borderRadius: "0.25rem",
    padding: "0.1rem 0.2rem",
  },
  ".cm-md-codeblock": {
    fontFamily: FONT_MONO,
    backgroundColor: "var(--editor-codeblock-bg, rgba(0, 0, 0, 0.3))",
    borderLeft: "2px solid var(--editor-codeblock-border, green)",
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
    color: "var(--editor-codeblock-line-number, rgba(148, 163, 184, 0.9))",
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
  ".cm-md-marker, .cm-md-marker span": {
    color: "var(--editor-marker-color, #94a3b8)",
  },
});
