import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from "@codemirror/view";

/**
 * ViewPlugin that hides markdown syntax markers (e.g. `#`, `*`, `[[...]]`) everywhere
 * except on the line containing the cursor. Uses viewport + syntax tree for performance.
 */

/** Map of syntax mark node types to trailing spaces to include in the hide range (0 or 1). */
const NODE_TYPES = new Map<string, number>([
  ["HeaderMark", 1],
  ["EmphasisMark", 0],
  ["StrikethroughMark", 0],
  ["LinkMark", 0],
  ["URL", 0],
  ["ListMark", 1],
  ["TaskMarker", 1],
  ["QuoteMark", 1],
  ["CodeMark", 0],
]);

const BACKLINK_PATTERN = /\[\[([^\]]+)\]\]/g;

/** Half-open document range [from, to). */
interface SimpleRange {
  from: number;
  to: number;
}

/**
 * Merges overlapping or adjacent ranges into a sorted, non-overlapping list.
 * Required because RangeSetBuilder does not accept overlapping ranges.
 */
const mergeRanges = (ranges: SimpleRange[]): SimpleRange[] => {
  if (ranges.length === 0) return [];

  ranges.sort((a, b) => a.from - b.from);

  const merged: SimpleRange[] = [ranges[0]];

  for (let i = 1; i < ranges.length; i++) {
    const current = ranges[i];
    const last = merged[merged.length - 1];

    if (current.from <= last.to) {
      last.to = Math.max(last.to, current.to);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

const hideMarkers = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const { state } = view;
      const { from, to } = view.viewport;

      const cursorHead = state.selection.main.head;
      const cursorLineObj = state.doc.lineAt(cursorHead);
      const cursorStart = cursorLineObj.from;
      const cursorEnd = cursorLineObj.to;

      const rangesToHide: SimpleRange[] = [];
      const backlinkRanges: SimpleRange[] = [];

      const docString = state.doc.sliceString(from, to);
      BACKLINK_PATTERN.lastIndex = 0;
      let m: RegExpExecArray | null;

      while ((m = BACKLINK_PATTERN.exec(docString)) !== null) {
        const matchFrom = from + m.index;
        const matchTo = matchFrom + m[0].length;

        backlinkRanges.push({ from: matchFrom, to: matchTo });

        if (matchFrom >= cursorStart && matchTo <= cursorEnd) continue;

        rangesToHide.push({ from: matchFrom, to: matchFrom + 2 });
        rangesToHide.push({ from: matchTo - 2, to: matchTo });
      }

      backlinkRanges.sort((a, b) => a.from - b.from);

      // Single index over sorted backlinkRanges for O(1) amortized overlap checks.
      let blIndex = 0; 

      syntaxTree(state).iterate({
        from,
        to,
        enter: (node) => {
          const typeName = node.type.name;
          const spaces = NODE_TYPES.get(typeName);
          if (spaces === undefined) return;

          if (node.from >= cursorStart && node.to <= cursorEnd) return;

          while (blIndex < backlinkRanges.length && backlinkRanges[blIndex].to <= node.from) {
            blIndex++;
          }

          const currentBl = backlinkRanges[blIndex];
          const isOverlappingBacklink =
            currentBl && node.from >= currentBl.from && node.to <= currentBl.to;

          if ((typeName === "LinkMark" || typeName === "URL") && isOverlappingBacklink) {
            return;
          }

          rangesToHide.push({
            from: node.from,
            to: node.to + spaces,
          });
        },
      });

      const mergedRangesFiltered = mergeRanges(rangesToHide).filter(({ from, to }) => from < to);

      for (const { from, to } of mergedRangesFiltered) {
        builder.add(from, to, Decoration.replace({}));
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

export { hideMarkers };
