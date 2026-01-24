import type { EditorView } from "@codemirror/view";

export interface MarkdownEditorProps {
  value?: string;
  initialContent?: string;
  class?: string;
  onChange?: (value: string) => void;
  onReady?: (view: EditorView) => void;
}

export interface LineInfo {
  readonly from: number;
  readonly to: number;
  readonly text: string;
}

export interface ViewportState {
  readonly line: number;
  readonly from: number;
  readonly to: number;
}

export interface Viewport {
  readonly from: number;
  readonly to: number;
}

export interface FenceMatch {
  readonly marker: string;
  readonly language: string;
}
