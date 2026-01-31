import { syntaxTree } from '@codemirror/language'
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view'

type SimpleRange = {
  from: number
  to: number
}

const NODE_TYPES = new Map<string, number>([
  ['CodeMark', 0],
  ['EmphasisMark', 0],
  ['HeaderMark', 1],
  ['LinkMark', 0],
  ['ListMark', 1],
  ['QuoteMark', 1],
  ['StrikethroughMark', 0],
  ['TaskMarker', 1],
  ['URL', 0]
])

const BACKLINK_PATTERN = /\[\[([^\]]+)\]\]/g

const mergeRanges = (ranges: SimpleRange[]): SimpleRange[] => {
  if (ranges.length === 0) return []

  ranges.sort((a, b) => a.from - b.from)

  const merged: SimpleRange[] = [ranges[0]]

  for (let i = 1; i < ranges.length; i++) {
    const current = ranges[i]
    const last = merged[merged.length - 1]

    if (current.from <= last.to) {
      last.to = Math.max(last.to, current.to)
    }
    else {
      merged.push(current)
    }
  }

  return merged
}

const hideMarkers = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view)
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>()
      const { state } = view
      const { from, to } = view.viewport

      const cursorHead = state.selection.main.head
      const cursorLineObj = state.doc.lineAt(cursorHead)
      const cursorStart = cursorLineObj.from
      const cursorEnd = cursorLineObj.to

      const rangesToHide: SimpleRange[] = []
      const backlinkRanges: SimpleRange[] = []

      const docString = state.doc.sliceString(from, to)

      BACKLINK_PATTERN.lastIndex = 0
      let m: null | RegExpExecArray

      while ((m = BACKLINK_PATTERN.exec(docString)) !== null) {
        const matchFrom = from + m.index
        const matchTo = matchFrom + m[0].length

        backlinkRanges.push({ from: matchFrom, to: matchTo })

        if (matchFrom >= cursorStart && matchTo <= cursorEnd) continue

        rangesToHide.push({ from: matchFrom, to: matchFrom + 2 })
        rangesToHide.push({ from: matchTo - 2, to: matchTo })
      }

      backlinkRanges.sort((a, b) => a.from - b.from)

      let backlinkIndex = 0

      syntaxTree(state).iterate({
        enter: (node) => {
          const typeName = node.type.name
          const spaces = NODE_TYPES.get(typeName)

          if (spaces === undefined) return

          if (node.from >= cursorStart && node.to <= cursorEnd) return

          while (
            backlinkIndex < backlinkRanges.length
            && backlinkRanges[backlinkIndex].to <= node.from
          ) {
            backlinkIndex++
          }

          const currentBacklink = backlinkRanges[backlinkIndex]
          const isOverlappingBacklink = currentBacklink
            && node.from >= currentBacklink.from
            && node.to <= currentBacklink.to

          if ((typeName === 'LinkMark' || typeName === 'URL') && isOverlappingBacklink) {
            return
          }

          rangesToHide.push({
            from: node.from,
            to: node.to + spaces
          })
        },
        from,
        to
      })

      const mergedRangesFiltered = mergeRanges(rangesToHide).filter(({ from, to }) => from < to)

      for (const { from, to } of mergedRangesFiltered) {
        builder.add(from, to, Decoration.replace({}))
      }

      return builder.finish()
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations
  }
)

export { hideMarkers }
