import { EditorState } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'

type DecorationPlugin = {
  decorations: typeof Decoration.none;
  update: (update: unknown) => void;
}

const getPlugin = <T>(view: EditorView, extension: T): DecorationPlugin => {
  const plugin = view.plugin(extension as unknown as ViewPlugin<DecorationPlugin>);
  if (!plugin) throw new Error("Plugin not available");

  return plugin;
}

const collectReplacedRanges = (plugin: DecorationPlugin, doc: EditorState["doc"]): string[] => {
  const results: string[] = [];
  plugin.decorations.between(0, doc.length, (from, to) => {
    results.push(doc.sliceString(from, to));
  });

  return results;
}

const collectReplacedRangesForLine = (
  plugin: DecorationPlugin, 
  doc: EditorState["doc"], 
  lineNumber: number
): string[] => {
  const results: string[] = [];
  const line = doc.line(lineNumber);
  
  plugin.decorations.between(line.from, line.to, (from, to) => {
    results.push(doc.sliceString(from, to));
  });
  
  return results;
};

export { getPlugin, collectReplacedRanges, collectReplacedRangesForLine }
