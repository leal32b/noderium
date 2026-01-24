import type { ViewUpdate } from "@codemirror/view";
import type { EditorState } from "@codemirror/state";
import type { FenceMatch, Viewport, ViewportState } from "./types";

const VIEWPORT_MARGIN = 2 as const;
const LANGUAGE_SANITIZE_PATTERN = /[^a-z0-9_-]/g;
const DEFAULT_LANGUAGE = "plain" as const;
const FENCE_MARKERS = ["```", "~~~"] as const;

export function parseFenceLine(text: string): FenceMatch | null {
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

export function getLeadingWhitespace(text: string): string {
  const trimmed = text.trimStart();
  return text.slice(0, text.length - trimmed.length);
}

export function computeVisibleRange(state: EditorState, viewport: Viewport): Viewport {
  const { doc } = state;
  const fromLine = Math.max(1, doc.lineAt(viewport.from).number - VIEWPORT_MARGIN);
  const toLine = Math.min(doc.lines, doc.lineAt(viewport.to).number + VIEWPORT_MARGIN);

  return {
    from: doc.line(fromLine).from,
    to: doc.line(toLine).to,
  };
}

export function shouldRecompute(
  update: ViewUpdate,
  prev: ViewportState,
  currentLineNumber: number
): boolean {
  if (update.docChanged) {
    return true;
  }

  const { from, to } = update.view.viewport;

  return prev.line !== currentLineNumber || prev.from !== from || prev.to !== to;
}

export function normalizeLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();

  return normalized
    ? normalized.replace(LANGUAGE_SANITIZE_PATTERN, "")
    : DEFAULT_LANGUAGE;
}
